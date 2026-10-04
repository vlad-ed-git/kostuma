// @vitest-environment node
import { Timestamp } from "firebase-admin/firestore"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

/** A Firestore of one collection: what the limits read and write. */
const db = vi.hoisted(() => {
  const docs = new Map<string, Record<string, unknown>>()
  const ref = (id: string) => ({ id })
  return {
    docs,
    collection: (name: string) => ({
      doc: (id: string) => ref(`${name}/${id}`),
      where: (_field: string, _op: string, at: { toMillis(): number }) => ({
        limit: (count: number) => ({
          get: async () => {
            const spent = [...docs.entries()]
              .filter(
                ([path, data]) =>
                  path.startsWith(`${name}/`) &&
                  (data.expiresAt as { toMillis(): number }).toMillis() <=
                    at.toMillis()
              )
              .slice(0, count)
              .map(([path]) => ({ ref: ref(path) }))
            return { empty: spent.length === 0, docs: spent }
          },
        }),
      }),
    }),
    runTransaction: async <T>(work: (transaction: unknown) => Promise<T>) =>
      work({
        get: async ({ id }: { id: string }) => ({ data: () => docs.get(id) }),
        set: ({ id }: { id: string }, data: Record<string, unknown>) =>
          docs.set(id, data),
      }),
    batch: () => {
      const deletes: string[] = []
      return {
        delete: ({ id }: { id: string }) => deletes.push(id),
        commit: async () => deletes.forEach((id) => docs.delete(id)),
      }
    },
  }
})

vi.mock("@/lib/firebase/admin", () => ({ adminDb: () => db }))

const { addressOf, sweepRateLimits, withinLimit } = await import("./rate-limit")

const hour = 60 * 60 * 1000
const limit = { name: "feedback", max: 3, windowMs: hour }
const start = Date.UTC(2026, 9, 31, 20)

beforeEach(() => db.docs.clear())

/** Uses the limit `times` times at `now`, the answers in order. */
async function use(times: number, sender = "address:203.0.113.7", now = start) {
  const answers: boolean[] = []
  for (let i = 0; i < times; i++) {
    answers.push(await withinLimit(limit, sender, now))
  }
  return answers
}

describe("withinLimit", () => {
  it("allows up to the limit, then refuses", async () => {
    expect(await use(4)).toEqual([true, true, true, false])
  })

  it("doesn't count a refused use", async () => {
    await use(5)
    const [entry] = db.docs.values()
    expect(entry.count).toBe(3)
  })

  it("keeps each sender apart, and each limit", async () => {
    await use(3, "address:203.0.113.7")
    expect(await use(1, "address:198.51.100.2")).toEqual([true])
    expect(await use(1, "account:u1")).toEqual([true])
    expect(
      await withinLimit({ ...limit, name: "other" }, "address:203.0.113.7")
    ).toBe(true)
  })

  it("starts over once the window from the first use has passed", async () => {
    await use(1, undefined, start)
    await use(2, undefined, start + 50 * 60 * 1000)
    expect(await use(1, undefined, start + hour - 1)).toEqual([false])
    expect(await use(3, undefined, start + hour)).toEqual([true, true, true])
    const [entry] = db.docs.values()
    expect((entry.expiresAt as Timestamp).toMillis()).toBe(start + 2 * hour)
  })

  it("keeps a hash, never the sender itself", async () => {
    await use(1, "address:203.0.113.7")
    const [path] = db.docs.keys()
    expect(path).toMatch(/^rateLimits\/[0-9a-f]{64}$/)
    expect(JSON.stringify([...db.docs.entries()])).not.toContain("203.0.113")
  })
})

describe("sweepRateLimits", () => {
  it("deletes the spent entries only", async () => {
    await use(1, "address:203.0.113.7", start)
    await use(1, "address:198.51.100.2", start + 30 * 60 * 1000)
    await sweepRateLimits(start + hour)
    expect(db.docs.size).toBe(1)
    await sweepRateLimits(start + 2 * hour)
    expect(db.docs.size).toBe(0)
  })

  it("does nothing with nothing spent", async () => {
    await sweepRateLimits(start)
    expect(db.docs.size).toBe(0)
  })
})

describe("addressOf", () => {
  it.each([
    [{ "x-real-ip": "203.0.113.7" }, "203.0.113.7"],
    [{ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }, "203.0.113.7"],
    [
      { "x-real-ip": "2001:db8::1", "x-forwarded-for": "203.0.113.7" },
      "2001:db8::1",
    ],
    [{ "x-forwarded-for": " " }, null],
    [{}, null],
  ])("reads %j", (headers, address) => {
    expect(addressOf(new Headers(headers))).toBe(address)
  })
})
