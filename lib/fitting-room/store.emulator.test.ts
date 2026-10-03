// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest"

import { makeup, type MakeupGuide, paler } from "@/lib/makeup"

import type { Fitting } from "./steps"
import type { TryOn } from "./try-on"

// The Fitting Room's store through the real Admin SDK, against the Firestore
// emulator (`npm run test:firestore`): its transactions, the free costume's
// query among them, as Firestore runs them. Only Firestore: no Storage.

vi.mock("server-only", () => ({}))

const PROJECT = "demo-kostuma"
const EMULATOR = "127.0.0.1:8085"
process.env.NEXT_PUBLIC_projectId = PROJECT
process.env.FIRESTORE_EMULATOR_HOST = EMULATOR
// No credentials against the emulators (lib/firebase/admin.ts).
process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099"

const { fittingRoomStore } = await import("./store")
const { newTryOn } = await import("./steps")
const { FAILED_TRIES } = await import("./free-costume")

const store = fittingRoomStore()
const UID = "visitor"

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

/** A try-on of `slug` on face photo `n`, before anything is sent. */
function tryOn(
  slug = "ghostface",
  n = 0,
  renderer: TryOn["renderer"] = "youcam"
) {
  const fitting: Fitting = {
    slug,
    guide,
    face: {
      id: String(n).padStart(32, "0"),
      width: 768,
      height: 1024,
      skin: "#C7998A",
    },
    body: { id: "b".repeat(32), width: 960, height: 1440 },
    garment: `https://example.com/${slug}.webp`,
  }
  return newTryOn(fitting, Date.now(), renderer)
}

/** A started try-on whose outfit came out, then failed. */
async function failAfterAPicture(fresh: TryOn) {
  await store.begin(UID, fresh)
  await store.updateStep(UID, fresh.id, 0, () => true, { status: "done" })
  return store.finish(UID, fresh.id, "failed", "face_photo")
}

beforeEach(async () => {
  const response = await fetch(
    `http://${EMULATOR}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`,
    { method: "DELETE" }
  )
  expect(response.ok).toBe(true)
})

describe("begin", () => {
  it("keeps a new try-on, then gives it again", async () => {
    const fresh = tryOn()
    expect(await store.begin(UID, fresh)).toMatchObject({
      outcome: "started",
    })
    expect(await store.begin(UID, fresh)).toMatchObject({
      outcome: "existing",
      tryOn: { id: fresh.id, status: "running" },
    })
  })

  it("refuses another try-on while one holds the free costume, or once it is used", async () => {
    const first = tryOn("ghostface")
    await store.begin(UID, first)
    expect(await store.begin(UID, tryOn("pennywise"))).toEqual({
      outcome: "out_of_units",
    })
    await store.finish(UID, first.id, "done", null)
    expect(await store.begin(UID, tryOn("ghostface", 1))).toEqual({
      outcome: "out_of_units",
    })
    expect(await store.tryOns(UID)).toHaveLength(1)
    // Seeing it again is free.
    expect((await store.begin(UID, first)).outcome).toBe("existing")
  })

  it("gives it to one of two try-ons started at the same time", async () => {
    const outcomes = await Promise.all([
      store.begin(UID, tryOn("ghostface")),
      store.begin(UID, tryOn("pennywise")),
      store.begin(UID, tryOn("chucky")),
    ])
    expect(outcomes.map((each) => each.outcome).sort()).toEqual([
      "out_of_units",
      "out_of_units",
      "started",
    ])
    expect(await store.tryOns(UID)).toHaveLength(1)
  })

  it("never lets a test build's fake try-on use up a real one", async () => {
    const fake = tryOn("ghostface", 0, "fake")
    await store.begin(UID, fake)
    await store.finish(UID, fake.id, "done", null)
    expect((await store.begin(UID, tryOn("pennywise"))).outcome).toBe("started")
  })
})

describe("finish", () => {
  it("gives the free costume back when a try-on fails before any picture", async () => {
    const first = tryOn("ghostface")
    await store.begin(UID, first)
    expect(await store.finish(UID, first.id, "failed", "body_photo")).toBe(true)
    expect((await store.room(UID)).failedTries).toBe(0)
    expect((await store.begin(UID, tryOn("pennywise"))).outcome).toBe("started")
  })

  it(`counts the failures after pictures were made, and stops at ${FAILED_TRIES}`, async () => {
    for (let n = 0; n < FAILED_TRIES; n++) {
      expect(await failAfterAPicture(tryOn("ghostface", n))).toBe(true)
      expect((await store.room(UID)).failedTries).toBe(n + 1)
    }
    expect(await store.begin(UID, tryOn("pennywise"))).toEqual({
      outcome: "out_of_units",
    })
  })

  it("ends a try-on once", async () => {
    const first = tryOn()
    await store.begin(UID, first)
    await store.updateStep(UID, first.id, 0, () => true, { status: "done" })
    expect(await store.finish(UID, first.id, "failed", "failed")).toBe(true)
    expect(await store.finish(UID, first.id, "failed", "failed")).toBe(false)
    expect((await store.room(UID)).failedTries).toBe(1)
  })
})
