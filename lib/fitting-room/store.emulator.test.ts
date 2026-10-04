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
    expect(await store.finish(UID, first.id, "failed", "face_photo")).toBe(true)
    expect(await store.finish(UID, first.id, "failed", "face_photo")).toBe(
      false
    )
    expect((await store.room(UID)).failedTries).toBe(1)
  })

  it("never counts Kostuma's or YouCam's failures against the visitor", async () => {
    for (const [n, failure] of (["failed", "unavailable"] as const).entries()) {
      const fresh = tryOn("ghostface", n)
      await store.begin(UID, fresh)
      await store.updateStep(UID, fresh.id, 0, () => true, { status: "done" })
      await store.finish(UID, fresh.id, "failed", failure)
    }
    expect((await store.room(UID)).failedTries).toBe(0)
  })
})

describe("the budget", () => {
  const config = () =>
    fetch(
      `http://${EMULATOR}/v1/projects/${PROJECT}/databases/(default)/documents/config/fittingRoom`,
      { headers: { Authorization: "Bearer owner" } }
    ).then((response) => response.json())

  it("makes the owner's switch with its defaults, and reserves a try-on's units", async () => {
    const fresh = tryOn()
    const begun = await store.begin(UID, fresh)
    expect(begun).toMatchObject({
      outcome: "started",
      // The outfits (2 + 2) and one step.
      tryOn: { reserved: { units: 5 } },
    })
    expect((await config()).fields).toMatchObject({
      open: { booleanValue: true },
      dailyUnits: { integerValue: "120" },
      floor: { integerValue: "40" },
    })
    expect((await store.capacity()).reserved).toBe(5)
  })

  it("refuses starts past the day's budget, and gives back what was never made", async () => {
    await store.recordBalance(1000, Date.now())
    const first = tryOn("ghostface", 0)
    await store.begin(UID, first)
    // 120 a day: 23 more try-ons of 5 fit, the 25th doesn't.
    for (let n = 1; n < 24; n++)
      await store.begin(`visitor-${n}`, tryOn("ghostface", n))
    expect(await store.begin("visitor-24", tryOn("ghostface", 24))).toEqual({
      outcome: "closed",
    })
    await store.updateStep(UID, first.id, 0, () => true, { status: "done" })
    await store.finish(UID, first.id, "failed", "face_photo")
    // Its outfit was made (2 units); 3 come back.
    expect((await store.capacity()).reserved).toBe(117)
    expect(
      (await store.begin("visitor-24", tryOn("ghostface", 24))).outcome
    ).toBe("closed")
  })

  it("closes for Kostuma's reasons only when open, and reopens with the daily check", async () => {
    await store.close("units")
    expect(await store.begin(UID, tryOn())).toEqual({ outcome: "closed" })
    const controls = await store.recordBalance(500, Date.now())
    expect(controls).toMatchObject({
      open: true,
      closedFor: null,
      balance: 500,
    })
    expect((await store.begin(UID, tryOn())).outcome).toBe("started")
    expect(await store.recordBalance(10, Date.now())).toMatchObject({
      open: false,
      closedFor: "units",
    })
  })
})

describe("YouCam's calls and webhooks", () => {
  it("never gives out more calls than the budget holds, however many ask at once", async () => {
    const { CAPACITY } = await import("./calls")
    const now = Date.now()
    // Eight starts of four calls each: seven fit in a full budget.
    const granted = await Promise.all(
      Array.from({ length: 8 }, () => store.takeCalls(4, now))
    )
    expect(granted.filter(Boolean)).toHaveLength(Math.floor(CAPACITY / 4))
    // A deletion still goes, a little into debt.
    expect(await store.takeCalls(1, now, true)).toBe(true)
  })

  it("notes whose a task is until it is forgotten", async () => {
    const step = { uid: UID, id: "a".repeat(32), index: 2 }
    // A task id with characters a document id can't hold.
    const task = "pfNK5Pu/Re0MrwLH+cGA3DOmB1ahwfXT="
    await store.trackTask(task, step, Date.now())
    expect(await store.taskStep(task)).toEqual(step)
    await store.forgetTask(task)
    expect(await store.taskStep(task)).toBeNull()
  })

  it("takes each webhook delivery once", async () => {
    const id = "msg_1eWPv9cWJCnEP99UJncmVJ6KjK_xVXRhZPe:1761112848"
    const firsts = await Promise.all([
      store.firstDelivery(id, Date.now()),
      store.firstDelivery(id, Date.now()),
    ])
    expect(firsts.sort()).toEqual([false, true])
  })

  it("lists the running try-ons started before a time, until they end", async () => {
    const old = tryOn("ghostface", 0)
    old.createdAt = Date.now() - 2 * 24 * 60 * 60 * 1000
    await store.begin(UID, old)
    await store.begin("visitor-2", tryOn("ghostface", 1))
    expect(await store.runningSince(Date.now() - 60_000, 10)).toEqual([
      { uid: UID, id: old.id },
    ])
    await store.finish(UID, old.id, "failed", "failed")
    expect(await store.runningSince(Date.now() - 60_000, 10)).toEqual([])
  })

  it("sweeps the notes older than a time", async () => {
    const step = { uid: UID, id: "a".repeat(32), index: 0 }
    await store.trackTask("old", step, 1_000)
    await store.trackTask("new", step, Date.now())
    await store.firstDelivery("old-delivery", 1_000)
    await store.sweep(Date.now() - 60_000)
    expect(await store.taskStep("old")).toBeNull()
    expect(await store.taskStep("new")).toEqual(step)
    expect(await store.firstDelivery("old-delivery", Date.now())).toBe(true)
  })
})
