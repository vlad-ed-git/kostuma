// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

import { makeup, type MakeupGuide, paler } from "@/lib/makeup"

import { dailyCheck, STUCK_MS } from "./daily"
import { FAILED_TRIES } from "./free-costume"
import { memoryStore } from "./memory-store"
import { ProviderError, type RenderProvider } from "./provider"
import { newTryOn } from "./steps"

const NOW = Date.UTC(2026, 9, 20, 6)
const DAY = 24 * 60 * 60 * 1000

const provider = (balance: () => Promise<number | null>) =>
  ({ name: "youcam", balance }) as unknown as RenderProvider

afterEach(() => vi.restoreAllMocks())

describe("dailyCheck", () => {
  it("keeps YouCam's balance, and closes the Fitting Room below the floor", async () => {
    const store = memoryStore({ controls: { floor: 50 } })
    const report = await dailyCheck(
      { store, provider: provider(async () => 49) },
      NOW
    )
    expect(report).toEqual({
      balance: 49,
      open: false,
      ended: 0,
      expired: 0,
      failed: [],
    })
    expect((await store.capacity(NOW)).controls).toMatchObject({
      open: false,
      closedFor: "units",
      balance: 49,
      balanceAt: NOW,
    })
  })

  it("reopens the Fitting Room Kostuma closed once units are back", async () => {
    const store = memoryStore()
    await store.close("units")
    const report = await dailyCheck(
      { store, provider: provider(async () => 1000) },
      NOW
    )
    expect(report.open).toBe(true)
  })

  it("never reopens what the owner closed", async () => {
    const store = memoryStore({ controls: { open: false } })
    await store.close("units")
    expect(
      (await dailyCheck({ store, provider: provider(async () => 1000) }, NOW))
        .open
    ).toBe(false)
  })

  it("says which part failed, and leaves the controls alone", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const store = memoryStore()
    const report = await dailyCheck(
      {
        store,
        provider: provider(async () => {
          throw new ProviderError("timeout", "failed", true)
        }),
      },
      NOW
    )
    expect(report).toEqual({
      balance: null,
      open: null,
      ended: 0,
      expired: 0,
      failed: ["balance"],
    })
    expect((await store.capacity(NOW)).controls.open).toBe(true)
  })

  it("asks nothing without a renderer, or of the free fake", async () => {
    const store = memoryStore()
    expect(await dailyCheck({ store, provider: null }, NOW)).toEqual({
      balance: null,
      open: null,
      ended: 0,
      expired: 0,
      failed: [],
    })
    expect(
      await dailyCheck({ store, provider: provider(async () => null) }, NOW)
    ).toMatchObject({ balance: null })
  })
})

describe("dailyCheck, stuck try-ons and old notes", () => {
  const guide: MakeupGuide = {
    look: "A test face.",
    steps: [
      {
        title: "Base",
        howTo: "Foundation.",
        products: ["foundation"],
        render: makeup(paler(2)),
      },
    ],
  }

  const tryOnAt = (createdAt: number, n: number) =>
    newTryOn(
      {
        slug: "ghostface",
        guide,
        face: {
          id: String(n).padStart(32, "0"),
          width: 768,
          height: 1024,
          skin: "#C7998A",
        },
        body: { id: "b".repeat(32), width: 960, height: 1440 },
        garment: "https://example.com/ghostface.webp",
      },
      createdAt,
      "youcam"
    )

  it("ends a try-on running a day after it started, as Kostuma's failure, and deletes its tasks", async () => {
    const discarded: string[] = []
    const youcam = {
      name: "youcam",
      balance: async () => null,
      discard: async (task: string) => {
        discarded.push(task)
      },
    } as unknown as RenderProvider
    const store = memoryStore()
    const stuck = tryOnAt(NOW - STUCK_MS - 1, 0)
    const fresh = tryOnAt(NOW - 60_000, 1)
    await store.begin("visitor", stuck)
    await store.begin("visitor-2", fresh)
    await store.updateStep("visitor", stuck.id, 0, () => true, {
      status: "running",
      task: "task-9",
    })
    await store.trackTask(
      "task-9",
      { uid: "visitor", id: stuck.id, index: 0 },
      NOW
    )

    const report = await dailyCheck({ store, provider: youcam }, NOW)
    expect(report.ended).toBe(1)
    expect(await store.tryOn("visitor", stuck.id)).toMatchObject({
      status: "failed",
      failure: "failed",
    })
    expect((await store.tryOn("visitor-2", fresh.id))?.status).toBe("running")
    expect(discarded).toEqual(["task-9"])
    expect(await store.taskStep("task-9")).toBeNull()
    // Never the visitor's: the free costume comes back.
    expect(await store.allowance("visitor", "youcam")).toEqual({
      free: true,
      triesLeft: FAILED_TRIES,
    })
    // Ended once.
    expect((await dailyCheck({ store, provider: youcam }, NOW)).ended).toBe(0)
  })

  it("forgets YouCam's tasks and webhooks older than two days", async () => {
    const store = memoryStore()
    await store.trackTask("old", { uid: "u", id: "i", index: 0 }, NOW - 3 * DAY)
    await store.trackTask("new", { uid: "u", id: "i", index: 1 }, NOW - DAY)
    await store.firstDelivery("old-delivery", NOW - 3 * DAY)
    await dailyCheck({ store, provider: null }, NOW)
    expect(await store.taskStep("old")).toBeNull()
    expect(await store.taskStep("new")).not.toBeNull()
    expect(await store.firstDelivery("old-delivery", NOW)).toBe(true)
  })
})
