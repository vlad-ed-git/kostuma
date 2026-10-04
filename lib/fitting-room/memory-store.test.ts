// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { makeup, type MakeupGuide, paler } from "@/lib/makeup"

import { FAILED_TRIES } from "./free-costume"
import { memoryStore } from "./memory-store"
import { newTryOn } from "./steps"
import type { FittingRoomStore } from "./try-on"

// What every store does with an account's photos and try-ons when they are
// deleted or expire (memory-store.ts, mirrored by store.ts and its emulator
// tests).

const UID = "visitor"
const DAY = 24 * 60 * 60 * 1000
const START = Date.UTC(2026, 9, 20)

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
const face = (n: number) => ({
  id: String(n).padStart(32, "0"),
  width: 768,
  height: 1024,
  skin: "#C7998A" as const,
})
const body = { id: "b".repeat(32), width: 960, height: 1440 }
const tryOnOf = (n: number, at = Date.now()) =>
  newTryOn(
    {
      slug: "ghostface",
      guide,
      face: face(n),
      body,
      garment: "https://example.com/ghostface.webp",
    },
    at,
    "youcam"
  )

let store: FittingRoomStore

beforeEach(async () => {
  vi.useFakeTimers({ now: START })
  store = memoryStore()
  await store.savePhotos(UID, {
    face: [face(0), new Uint8Array([1])],
    body: [body, new Uint8Array([2])],
  })
})

afterEach(() => vi.useRealTimers())

describe("erase", () => {
  it("deletes the photos, pictures and try-ons, never the free costume used", async () => {
    const done = tryOnOf(0)
    await store.begin(UID, done)
    await store.updateStep(UID, done.id, 0, () => true, {
      status: "done",
      task: "kept-task",
    })
    await store.saveStepImage(UID, done.id, 0, new Uint8Array([9]))
    await store.finish(UID, done.id, "done", null)

    expect(await store.erase(UID)).toEqual(["kept-task"])
    expect(await store.room(UID)).toEqual({ face: null, body: null })
    expect(await store.tryOns(UID)).toEqual([])
    expect(await store.photo(UID, "face", face(0).id)).toBeNull()
    expect(await store.stepImage(UID, done.id, 0)).toBeNull()
    expect(await store.allowance(UID, "youcam")).toMatchObject({
      free: false,
      costume: "ghostface",
    })
  })

  it("keeps the free costume used by a try-on still running that made pictures, and gives it back otherwise", async () => {
    const pictured = tryOnOf(0)
    await store.begin(UID, pictured)
    await store.updateStep(UID, pictured.id, 0, () => true, {
      status: "done",
    })
    await store.erase(UID)
    expect((await store.allowance(UID, "youcam")).free).toBe(false)
    expect(await store.runningSince(Infinity, 10)).toEqual([])

    const other = memoryStore()
    await other.begin(UID, tryOnOf(1))
    await other.erase(UID)
    expect((await other.allowance(UID, "youcam")).free).toBe(true)
  })

  it("deletes the free costume's record too with the account", async () => {
    const done = tryOnOf(0)
    await store.begin(UID, done)
    await store.finish(UID, done.id, "done", null)
    await store.erase(UID, { account: true })
    expect(await store.allowance(UID, "youcam")).toEqual({
      free: true,
      triesLeft: FAILED_TRIES,
    })
  })
})

describe("expire", () => {
  it("deletes what is older than a time, keeps the rest, and forgets old photos in use", async () => {
    const old = tryOnOf(0)
    await store.begin(UID, old)
    await store.finish(UID, old.id, "failed", "body_photo")
    vi.setSystemTime(START + 400 * DAY)
    await store.savePhotos(UID, { face: [face(1), new Uint8Array([3])] })
    const fresh = tryOnOf(1)
    await store.begin(UID, fresh)

    expect(await store.expire(START + 365 * DAY, 10)).toBe(1)
    expect((await store.tryOns(UID)).map((each) => each.id)).toEqual([fresh.id])
    // The new face stays in use; the old body photo is gone.
    expect(await store.room(UID)).toEqual({ face: face(1), body: null })
    expect(await store.photo(UID, "body", body.id)).toBeNull()
    // The new try-on still holds the free costume.
    expect(await store.allowance(UID, "youcam")).toMatchObject({
      free: false,
      tryOn: fresh.id,
    })
    // Nothing left to expire.
    expect(await store.expire(START + 365 * DAY, 10)).toBe(0)
  })

  it("never deletes a try-on still running", async () => {
    const running = tryOnOf(0)
    await store.begin(UID, running)
    await store.expire(START + DAY, 10)
    expect(await store.tryOn(UID, running.id)).not.toBeNull()
  })
})
