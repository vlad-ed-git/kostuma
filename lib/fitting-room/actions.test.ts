// @vitest-environment node
import sharp from "sharp"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { memoryStore } from "./memory-store"
import type { RenderProvider } from "./provider"
import type { Deps } from "./steps"

// startTryOn as a server action is reached: a signed-in visitor, the
// Fitting Room on the memory store and a renderer that never renders.
vi.mock("server-only", () => ({}))
vi.mock("@/lib/auth/session", () => ({
  getUser: async () => ({ uid: "visitor", email: "v@example.com", name: "V" }),
}))
const limit = { calls: 0, max: Infinity }
vi.mock("@/lib/rate-limit", () => ({
  withinLimit: async () => ++limit.calls <= limit.max,
}))
let deps: Deps | null = null
vi.mock("./service", () => ({ fittingRoom: () => deps }))
const opened = vi.fn()
vi.mock("./photo", async (original) => {
  const actual = await original<typeof import("./photo")>()
  return {
    ...actual,
    preparePhoto: (...args: Parameters<typeof actual.preparePhoto>) => {
      opened()
      return actual.preparePhoto(...args)
    },
  }
})

const { startTryOn } = await import("./actions")
const { START_LIMIT } = await import("@/lib/limits")

const provider = {
  name: "fake",
  start: async () => ({ task: "t" }),
  check: async () => ({ status: "running" }),
  discard: async () => {},
  balance: async () => null,
} as unknown as RenderProvider

async function form() {
  const jpeg = (width: number, height: number) =>
    sharp({
      create: { width, height, channels: 3, background: "#C68642" },
    })
      .jpeg()
      .toBuffer()
  const data = new FormData()
  data.set("costume", "beetlejuice")
  data.set("face", new File([await jpeg(768, 1024)], "face.jpg"))
  data.set("body", new File([await jpeg(1080, 1440)], "body.jpg"))
  return data
}

beforeEach(() => {
  limit.calls = 0
  limit.max = START_LIMIT.max
  opened.mockClear()
  deps = {
    store: memoryStore(),
    provider,
    garment: async () => new Uint8Array(),
  }
})

describe("startTryOn", () => {
  it("starts a try-on of the photos given", async () => {
    const result = await startTryOn(await form())
    expect(result).toMatchObject({ ok: true, tryOn: { slug: "beetlejuice" } })
    expect(opened).toHaveBeenCalledTimes(2)
  })

  it(`refuses a start past ${START_LIMIT.max} an hour, before opening a photo`, async () => {
    limit.max = 0
    expect(await startTryOn(await form())).toEqual({
      ok: false,
      error: "too_many_starts",
    })
    expect(opened).not.toHaveBeenCalled()
  })

  it("says the Fitting Room is closed, before counting or opening anything", async () => {
    deps = null
    expect(await startTryOn(await form())).toEqual({
      ok: false,
      error: "closed",
    })
    expect(limit.calls).toBe(0)
  })

  it("says the day's budget can't take it", async () => {
    deps = { ...deps!, store: memoryStore({ controls: { dailyUnits: 1 } }) }
    expect(await startTryOn(await form())).toEqual({
      ok: false,
      error: "closed",
    })
  })
})
