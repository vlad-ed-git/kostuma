// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  hair,
  makeup,
  type MakeupGuide,
  matte,
  paler,
  lips,
} from "@/lib/makeup"

import { dayOf } from "./budget"
import { BUSY_LIMIT_MS } from "./calls"
import { FAILED_TRIES } from "./free-costume"
import { memoryStore } from "./memory-store"
import {
  ProviderError,
  type RenderImages,
  type RenderProvider,
  type TaskState,
} from "./provider"
import type { Render } from "./render-plan"
import {
  advance,
  begin,
  type Deps,
  drive,
  type Fitting,
  LEASE_MS,
  MAX_ATTEMPTS,
  mayBegin,
  RUN_LIMIT_MS,
  tryOnId,
} from "./steps"
import { type Begun, type FittingRoomStore, toView, type TryOn } from "./try-on"

const UID = "visitor"
const FACE = new Uint8Array([1])
const BODY = new Uint8Array([2])
const GARMENT = new Uint8Array([3])

const guide: MakeupGuide = {
  look: "A test face.",
  steps: [
    {
      title: "Base",
      howTo: "Foundation.",
      products: ["foundation"],
      render: makeup(paler(2)),
    },
    {
      title: "Lips",
      howTo: "Lipstick.",
      products: ["lipstick"],
      render: makeup(lips(matte("#2A2A2A"))),
    },
    {
      title: "Hair",
      howTo: "Hair.",
      products: ["black hair color spray"],
      render: hair("#151515"),
    },
  ],
}

const BODY_PHOTO = { id: "b".repeat(32), width: 960, height: 1440 }
const GARMENT_URL = "https://example.com/costumes%2Fghostface.1a2b3c4d5e.webp"

const fitting: Fitting = {
  slug: "ghostface",
  guide,
  face: { id: "f".repeat(32), width: 768, height: 1024, skin: "#C7998A" },
  body: BODY_PHOTO,
  garment: GARMENT_URL,
}

/**
 * A provider run by the test: every task runs until the test says how it
 * ends (`finish`), and every call is noted.
 */
function scripted() {
  const started: { task: string; render: Render; images: RenderImages }[] = []
  const states = new Map<string, TaskState>()
  const discarded: string[] = []
  const checked: string[] = []
  let startError: Error | null = null
  let checkError: Error | null = null
  const provider: RenderProvider = {
    name: "youcam",
    async start(render, images) {
      if (startError) throw startError
      const task = `task-${started.length}`
      started.push({ task, render, images })
      states.set(task, { status: "running" })
      if (render.tool !== "clothes") return { task }
      // The garment goes up with the outfit, unless it was up already.
      return { task, garmentFile: images.garmentFile ?? `garment-of-${task}` }
    },
    async check(task) {
      checked.push(task)
      if (checkError) throw checkError
      const state = states.get(task)
      if (!state) throw new ProviderError("unknown", "failed", false)
      return state
    },
    async discard(task) {
      discarded.push(task)
    },
    async balance() {
      return null
    },
  }
  return {
    provider,
    started,
    discarded,
    checked,
    /** Ends the task of step `tool` started last. */
    finish(task: string, state: TaskState) {
      states.set(task, state)
    },
    failStarts(error: Error | null) {
      startError = error
    },
    failChecks(error: Error | null) {
      checkError = error
    },
  }
}

const picture = (n: number) => ({
  status: "done" as const,
  image: new Uint8Array([100 + n]),
})

let now = 1_000_000
let store: FittingRoomStore
let render: ReturnType<typeof scripted>
let deps: Deps

beforeEach(async () => {
  now = 1_000_000
  store = memoryStore()
  render = scripted()
  deps = {
    store,
    provider: render.provider,
    garment: async () => GARMENT,
    now: () => now,
  }
  await store.savePhotos(UID, {
    face: [fitting.face, FACE],
    body: [BODY_PHOTO, BODY],
  })
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => vi.restoreAllMocks())

/** The try-on a start gave; fails the test when it gave none. */
function made(begun: Begun): TryOn {
  if (begun.outcome === "out_of_units" || begun.outcome === "closed")
    throw new Error(`No try-on: ${begun.outcome}.`)
  return begun.tryOn
}

/**
 * The page asking again a little later: long enough for YouCam to be asked
 * about any running render (calls.ts `checkEvery`).
 */
async function ask(id: string, options?: { due?: number }) {
  now += 10_000
  return advance(deps, UID, id, options)
}

/** Starts the try-on (or another `fitting`) and returns its id. */
async function started(other: Fitting = fitting) {
  return made(await begin(deps, UID, other)).id
}

/** The same costume on another face photo. */
const otherFace = (n: number): Fitting => ({
  ...fitting,
  face: { ...fitting.face, id: String(n).padStart(32, "0") },
})

/** Another costume on the same photos. */
const otherCostume: Fitting = { ...fitting, slug: "pennywise" }

describe("begin", () => {
  it("keeps a new try-on, its steps waiting: the outfit on the body and on the face, then the guide", async () => {
    const result = await begin(deps, UID, fitting)
    expect(result.outcome).toBe("started")
    const tryOn = made(result)
    expect(tryOn.id).toBe(
      tryOnId(
        fitting.face.id,
        BODY_PHOTO.id,
        "ghostface",
        "youcam",
        GARMENT_URL
      )
    )
    expect(tryOn.garment).toBe(GARMENT_URL)
    expect(tryOn.steps.map((step) => step.render.tool)).toEqual([
      "clothes",
      "clothes",
      "makeup",
      "makeup",
      "hair",
    ])
    expect(tryOn.steps.every((step) => step.status === "waiting")).toBe(true)
  })

  it("gives the same try-on again for the same photos and costume", async () => {
    const id = await started()
    const again = await begin(deps, UID, fitting)
    expect(again).toMatchObject({ outcome: "existing", tryOn: { id } })
  })

  it("starts over a try-on that failed", async () => {
    const id = await started()
    await store.finish(UID, id, "failed", "face_photo")
    const again = await begin(deps, UID, fitting)
    expect(again.outcome).toBe("started")
    expect(made(again).status).toBe("running")
  })

  it("makes another try-on for other photos, another costume, another renderer or another outfit picture", () => {
    const face = "a".repeat(32)
    const body = "b".repeat(32)
    const garment = GARMENT_URL
    const one = tryOnId(face, body, "ghostface", "youcam", garment)
    expect(tryOnId(face, body, "ghostface", "youcam", garment)).toBe(one)
    for (const other of [
      tryOnId("c".repeat(32), body, "ghostface", "youcam", garment),
      tryOnId(face, "c".repeat(32), "ghostface", "youcam", garment),
      tryOnId(face, body, "pennywise", "youcam", garment),
      tryOnId(face, null, "ghostface", "youcam", null),
      // A fake try-on never stands in for a real one,
      tryOnId(face, body, "ghostface", "fake", garment),
      // nor one of an outfit picture since replaced.
      tryOnId(
        face,
        body,
        "ghostface",
        "youcam",
        garment.replace("1a2b", "9f8e")
      ),
    ])
      expect(other).not.toBe(one)
  })
})

describe("advance", () => {
  it("tries the outfit on first, on the body photo with the garment", async () => {
    const id = await started()
    const tryOn = await ask(id)
    expect(render.started).toHaveLength(1)
    expect(render.started[0].render.tool).toBe("clothes")
    expect(render.started[0].images).toEqual({ source: BODY, garment: GARMENT })
    expect(tryOn?.steps.map((step) => step.status)).toEqual([
      "running",
      "waiting",
      "waiting",
      "waiting",
      "waiting",
    ])
  })

  it("dresses the face once the body is dressed, then paints each step on the picture the step before left", async () => {
    const id = await started()
    await ask(id)
    render.finish("task-0", picture(0))

    // The ask that keeps the outfit tries it on the face photo next, with
    // the garment the body's outfit uploaded: its task (which YouCam would
    // delete with the garment) stays until the face is dressed.
    let tryOn = await ask(id)
    expect(tryOn?.steps[0].status).toBe("done")
    expect(await store.stepImage(UID, id, 0)).toEqual(new Uint8Array([100]))
    expect(render.discarded).not.toContain("task-0")
    expect(render.started).toHaveLength(2)
    expect(render.started[1].render).toMatchObject({
      tool: "clothes",
      from: "face",
    })
    expect(render.started[1].images).toEqual({
      source: FACE,
      garmentFile: "garment-of-task-0",
    })
    // The makeup waits for the dressed face.
    expect(tryOn?.steps.slice(2).map((step) => step.status)).toEqual([
      "waiting",
      "waiting",
      "waiting",
    ])

    render.finish("task-1", picture(1))
    tryOn = await ask(id)
    expect(render.discarded).toEqual(
      expect.arrayContaining(["task-0", "task-1"])
    )
    expect(tryOn?.steps[0].task).toBeNull()
    expect(render.started[2].render.tool).toBe("makeup")
    expect(render.started[2].images).toEqual({ source: new Uint8Array([101]) })

    render.finish("task-2", picture(2))
    tryOn = await ask(id)
    expect(render.started[3].render.tool).toBe("makeup")
    expect(render.started[3].images).toEqual({ source: new Uint8Array([102]) })

    render.finish("task-3", picture(3))
    tryOn = await ask(id)
    expect(render.started[4].render.tool).toBe("hair")
    expect(render.started[4].images).toEqual({ source: new Uint8Array([103]) })

    render.finish("task-4", picture(4))
    tryOn = await ask(id)
    expect(tryOn?.status).toBe("done")
    expect(tryOn?.steps.every((step) => step.status === "done")).toBe(true)
  })

  it("makes up the face photo as it is when YouCam can't dress it", async () => {
    const id = await started()
    await ask(id)
    render.finish("task-0", picture(0))
    await ask(id)
    render.finish("task-1", {
      status: "error",
      reason: "face_photo",
      retry: false,
      detail: "error_pose",
    })
    let tryOn = await ask(id)
    expect(tryOn?.status).toBe("running")
    expect(tryOn?.steps[1].status).toBe("failed")

    tryOn = await ask(id)
    expect(render.started[2].render.tool).toBe("makeup")
    expect(render.started[2].images).toEqual({ source: FACE })
    for (const task of [2, 3, 4]) {
      render.finish(`task-${task}`, picture(task))
      tryOn = await ask(id)
    }
    expect(tryOn).toMatchObject({ status: "done", failure: null })
  })

  it("starts a costume that is all makeup on the face photo at once, with no body photo", async () => {
    const allMakeup: Fitting = {
      ...fitting,
      guide: { ...guide, allMakeup: true },
      body: null,
      garment: null,
    }
    const tryOn = made(await begin(deps, UID, allMakeup))
    expect(tryOn.id).toBe(
      tryOnId(fitting.face.id, null, "ghostface", "youcam", null)
    )
    expect(tryOn.garment).toBeNull()
    expect(tryOn.body).toBeNull()
    expect(tryOn.steps.map((step) => step.render.tool)).toEqual([
      "makeup",
      "makeup",
      "hair",
    ])
    await advance(deps, UID, tryOn.id)
    expect(render.started).toHaveLength(1)
    expect(render.started[0].images).toEqual({ source: FACE })
  })

  it("sends each render once, however many tabs ask at the same time", async () => {
    const id = await started()
    await Promise.all([ask(id), ask(id), ask(id)])
    expect(render.started).toHaveLength(1)
  })

  it("fails the try-on when a photo can't be read, and sends nothing more", async () => {
    const id = await started()
    await ask(id)
    render.finish("task-0", {
      status: "error",
      reason: "body_photo",
      retry: false,
      detail: "error_pose",
    })
    const tryOn = await ask(id)
    expect(tryOn).toMatchObject({ status: "failed", failure: "body_photo" })
    // No makeup is paid for after a failed outfit.
    await ask(id)
    expect(render.started).toHaveLength(1)
    expect(render.discarded).toContain("task-0")
  })

  it("fails the try-on when the makeup can't read the face, and paints nothing after it", async () => {
    const id = await started()
    await ask(id)
    render.finish("task-0", picture(0))
    await ask(id)
    render.finish("task-1", picture(1))
    await ask(id)
    render.finish("task-2", {
      status: "error",
      reason: "face_photo",
      retry: false,
      detail: "error_face_angle_invalid",
    })
    const tryOn = await ask(id)
    expect(tryOn).toMatchObject({ status: "failed", failure: "face_photo" })
    await ask(id)
    expect(render.started).toHaveLength(3)
  })

  it("tries a hiccup again, and gives up after MAX_ATTEMPTS", async () => {
    const id = await started()
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      await ask(id)
      render.finish(`task-${attempt}`, {
        status: "error",
        reason: "failed",
        retry: true,
        detail: "unknown_internal_error",
      })
      const tryOn = await ask(id)
      if (attempt < MAX_ATTEMPTS - 1) {
        expect(tryOn?.status).toBe("running")
        expect(tryOn?.steps[0]).toMatchObject({
          status: "waiting",
          attempts: attempt + 1,
        })
      } else {
        expect(tryOn).toMatchObject({ status: "failed", failure: "failed" })
      }
    }
    expect(render.started).toHaveLength(MAX_ATTEMPTS)
  })

  it("fails the try-on and closes the Fitting Room when the service refuses (no units, no key)", async () => {
    const id = await started()
    render.failStarts(
      new ProviderError("CreditInsufficiency", "unavailable", false, {
        closes: "units",
      })
    )
    const tryOn = await ask(id)
    expect(tryOn).toMatchObject({ status: "failed", failure: "unavailable" })
    expect((await store.capacity(now)).controls).toMatchObject({
      open: false,
      closedFor: "units",
    })
    // Not the visitor's fault: the free costume comes back, untouched.
    expect((await store.room(UID)).failedTries).toBe(0)
  })

  it("asks again next time when the service can't be reached", async () => {
    const id = await started()
    await ask(id)
    render.failChecks(new ProviderError("timeout", "failed", true))
    const tryOn = await ask(id)
    expect(tryOn?.steps[0]).toMatchObject({ status: "running", attempts: 0 })
    render.failChecks(null)
    render.finish("task-0", picture(0))
    expect((await ask(id))?.steps[0].status).toBe("done")
  })

  it("gives up on a render that runs too long, and sends it again", async () => {
    const id = await started()
    await ask(id)
    now += RUN_LIMIT_MS + 1
    let tryOn = await ask(id)
    expect(render.discarded).toContain("task-0")
    expect(tryOn?.steps[0]).toMatchObject({ status: "waiting", attempts: 1 })
    tryOn = await ask(id)
    expect(render.started).toHaveLength(2)
    expect(tryOn?.steps[0].status).toBe("running")
  })

  it("takes over a claim whose request died", async () => {
    const id = await started()
    // A request claimed the outfit, then never came back.
    await store.updateStep(UID, id, 0, () => true, {
      status: "starting",
      since: now,
    })
    await ask(id)
    expect(render.started).toHaveLength(0)
    now += LEASE_MS + 1
    await ask(id)
    expect(render.started).toHaveLength(1)
  })

  it("leaves a finished try-on alone", async () => {
    const id = await started()
    await store.finish(UID, id, "done", null)
    await ask(id)
    expect(render.started).toHaveLength(0)
  })

  it("knows no try-on of another account", async () => {
    const id = await started()
    expect(await advance(deps, "someone-else", id)).toBeNull()
  })
})

describe("the free costume", () => {
  /** Dresses a started try-on's body and face, then fails its makeup. */
  async function failAfterTheOutfit(id: string) {
    const latest = () => `task-${render.started.length - 1}`
    await ask(id)
    render.finish(latest(), picture(0))
    await ask(id)
    render.finish(latest(), picture(1))
    await ask(id)
    render.finish(latest(), {
      status: "error",
      reason: "face_photo",
      retry: false,
      detail: "error_face_angle_invalid",
    })
    return ask(id)
  }

  it("is used once a try-on is done: no try-on of another costume, nor of other photos", async () => {
    const id = await started()
    await store.finish(UID, id, "done", null)
    expect(await begin(deps, UID, otherCostume)).toEqual({
      outcome: "out_of_units",
    })
    expect(await begin(deps, UID, otherFace(1))).toEqual({
      outcome: "out_of_units",
    })
    expect(await store.tryOns(UID)).toHaveLength(1)
  })

  it("is held while a try-on runs", async () => {
    await started()
    expect((await begin(deps, UID, otherCostume)).outcome).toBe("out_of_units")
  })

  it("never stops the visitor seeing a try-on already made", async () => {
    const id = await started()
    await store.finish(UID, id, "done", null)
    expect(await begin(deps, UID, fitting)).toMatchObject({
      outcome: "existing",
      tryOn: { id },
    })
  })

  it("comes back when a try-on fails before any picture is made, however often", async () => {
    for (let n = 0; n < FAILED_TRIES + 2; n++) {
      const id = await started(otherFace(n))
      await store.finish(UID, id, "failed", "body_photo")
    }
    expect((await store.room(UID)).failedTries).toBe(0)
    expect((await begin(deps, UID, otherCostume)).outcome).toBe("started")
  })

  it(`comes back after a failure once pictures were made, ${FAILED_TRIES} times`, async () => {
    for (let n = 0; n < FAILED_TRIES; n++) {
      const other = otherFace(n)
      await store.savePhotos(UID, { face: [other.face, FACE] })
      const tryOn = await failAfterTheOutfit(await started(other))
      expect(tryOn).toMatchObject({ status: "failed", failure: "face_photo" })
    }
    expect((await store.room(UID)).failedTries).toBe(FAILED_TRIES)
    expect(await begin(deps, UID, otherCostume)).toEqual({
      outcome: "out_of_units",
    })
  })

  it("never counts a failure that isn't the visitor's photos, even after pictures were made", async () => {
    for (const failure of ["failed", "unavailable"] as const) {
      for (let n = 0; n < FAILED_TRIES + 1; n++) {
        const id = await started(otherFace(n))
        await store.updateStep(UID, id, 0, () => true, { status: "done" })
        await store.finish(UID, id, "failed", failure)
      }
    }
    expect((await store.room(UID)).failedTries).toBe(0)
    expect((await begin(deps, UID, otherCostume)).outcome).toBe("started")
  })

  it("counts a failed try-on started over as another try", async () => {
    for (let n = 0; n < FAILED_TRIES; n++)
      await failAfterTheOutfit(await started())
    expect(await begin(deps, UID, fitting)).toEqual({ outcome: "out_of_units" })
  })

  it("goes to one of two try-ons started at the same time", async () => {
    const outcomes = await Promise.all([
      begin(deps, UID, fitting),
      begin(deps, UID, otherCostume),
    ])
    expect(outcomes.map((each) => each.outcome).sort()).toEqual([
      "out_of_units",
      "started",
    ])
  })

  it("belongs to each account", async () => {
    const id = await started()
    await store.finish(UID, id, "done", null)
    expect((await begin(deps, "someone-else", otherCostume)).outcome).toBe(
      "started"
    )
  })
})

describe("mayBegin", () => {
  it("says whether a try-on would start, and keeps nothing", async () => {
    expect(await mayBegin(deps, UID, otherCostume)).toBe("ok")
    expect(await store.tryOns(UID)).toHaveLength(0)
    const id = await started()
    await store.finish(UID, id, "done", null)
    expect(await mayBegin(deps, UID, otherCostume)).toBe("out_of_units")
    expect(await mayBegin(deps, UID, otherFace(1))).toBe("out_of_units")
  })

  it("lets the visitor see a try-on already made", async () => {
    const id = await started()
    await store.finish(UID, id, "done", null)
    expect(await mayBegin(deps, UID, fitting)).toBe("ok")
  })

  it("says the Fitting Room is closed, by the switch or the day's budget", async () => {
    deps.store = memoryStore({ controls: { open: false } })
    expect(await mayBegin(deps, UID, fitting)).toBe("closed")
    // The outfits (2 + 2) and three steps: 7 units.
    deps.store = memoryStore({ controls: { dailyUnits: 6 } })
    expect(await mayBegin(deps, UID, fitting)).toBe("closed")
    deps.store = memoryStore({ controls: { dailyUnits: 7 } })
    expect(await mayBegin(deps, UID, fitting)).toBe("ok")
  })
})

describe("the budget", () => {
  /** The units the store has reserved today. */
  const reserved = async () => (await deps.store.capacity(now)).reserved

  it("reserves a try-on's units when it starts: 2 per outfit, 1 per step", async () => {
    const tryOn = made(await begin(deps, UID, fitting))
    expect(tryOn.reserved).toEqual({ day: dayOf(now), units: 7 })
    expect(await reserved()).toBe(7)
    // Seeing it again reserves nothing.
    await begin(deps, UID, fitting)
    expect(await reserved()).toBe(7)
  })

  it("refuses a start once the day's budget is reserved, then the next day takes it", async () => {
    deps.store = store = memoryStore({ controls: { dailyUnits: 10 } })
    await started()
    expect(await begin(deps, "someone-else", fitting)).toEqual({
      outcome: "closed",
    })
    now += 24 * 60 * 60 * 1000
    expect((await begin(deps, "someone-else", fitting)).outcome).toBe("started")
  })

  it("refuses every start while the switch is off", async () => {
    deps.store = memoryStore({ controls: { open: false } })
    expect(await begin(deps, UID, fitting)).toEqual({ outcome: "closed" })
  })

  it("gives back the units of the renders a try-on never made", async () => {
    const id = await started()
    await ask(id)
    render.finish("task-0", picture(0))
    await ask(id)
    render.finish("task-1", {
      status: "error",
      reason: "failed",
      retry: false,
      detail: "error_editing_failed",
    })
    // The face's outfit failed for Kostuma: the makeup goes on.
    await ask(id)
    await ask(id)
    for (const task of [2, 3, 4]) {
      render.finish(`task-${task}`, picture(task))
      await ask(id)
    }
    expect((await store.tryOn(UID, id))?.status).toBe("done")
    // The body's outfit (2) and three steps (3) were made: 5 of 7.
    expect(await reserved()).toBe(5)
  })

  it("gives all its units back to a try-on that failed before any picture", async () => {
    const id = await started()
    await store.finish(UID, id, "failed", "body_photo")
    expect(await reserved()).toBe(0)
  })
})

describe("asking YouCam", () => {
  /** Starts the try-on and sends its first render (the body's outfit). */
  async function sent() {
    const id = await started()
    await advance(deps, UID, id)
    return id
  }

  it("asks about a running outfit at most every 10 s, whoever asks", async () => {
    const id = await sent()
    for (const step of [3_000, 3_000, 3_000]) {
      now += step
      await advance(deps, UID, id)
    }
    expect(render.checked).toEqual([])
    now += 1_001
    await Promise.all([advance(deps, UID, id), advance(deps, UID, id)])
    expect(render.checked).toEqual(["task-0"])
  })

  it("asks about a running makeup step at most every 5 s", async () => {
    const allMakeup: Fitting = {
      ...fitting,
      guide: { ...guide, allMakeup: true },
      body: null,
      garment: null,
    }
    const id = made(await begin(deps, UID, allMakeup)).id
    await advance(deps, UID, id)
    now += 4_000
    await advance(deps, UID, id)
    expect(render.checked).toEqual([])
    now += 1_001
    await advance(deps, UID, id)
    expect(render.checked).toEqual(["task-0"])
  })

  it("asks at once about the render YouCam says is done (its webhook)", async () => {
    const id = await sent()
    render.finish("task-0", picture(0))
    const tryOn = await advance(deps, UID, id, { due: 0 })
    expect(tryOn?.steps[0].status).toBe("done")
    // And sends the face's outfit in the same move.
    expect(render.started).toHaveLength(2)
  })

  it("notes whose each task is, and forgets it once deleted", async () => {
    const id = await sent()
    expect(await store.taskStep("task-0")).toEqual({ uid: UID, id, index: 0 })
    render.finish("task-0", picture(0))
    await ask(id)
    render.finish("task-1", picture(1))
    await ask(id)
    expect(await store.taskStep("task-0")).toBeNull()
    expect(await store.taskStep("task-1")).toBeNull()
    expect(await store.taskStep("task-2")).toEqual({ uid: UID, id, index: 2 })
  })

  it("lets go of the garment's task when the face can't be dressed", async () => {
    const id = await sent()
    render.finish("task-0", picture(0))
    await ask(id)
    render.finish("task-1", {
      status: "error",
      reason: "face_photo",
      retry: false,
      detail: "error_pose",
    })
    const tryOn = await ask(id)
    expect(render.discarded).toEqual(
      expect.arrayContaining(["task-0", "task-1"])
    )
    expect(tryOn?.steps[0]).toMatchObject({ status: "done", task: null })
  })

  it("deletes every task kept or running when the try-on fails", async () => {
    const id = await sent()
    render.finish("task-0", picture(0))
    await ask(id)
    // The face's outfit runs, the body's outfit keeps its task: a hiccup
    // fails the try-on for good.
    await store.updateStep(UID, id, 1, () => true, {
      status: "failed",
      failure: "failed",
    })
    await store.updateStep(UID, id, 2, () => true, {
      status: "failed",
      failure: "failed",
    })
    const tryOn = await ask(id)
    expect(tryOn?.status).toBe("failed")
    expect(render.discarded).toContain("task-0")
  })
})

describe("a busy YouCam", () => {
  const busy = () =>
    new ProviderError("HTTP 429", "failed", true, { busy: true })

  it("keeps a render waiting, never counted as an attempt, a little longer each time", async () => {
    const id = await started()
    render.failStarts(busy())
    let tryOn = await advance(deps, UID, id)
    expect(tryOn?.steps[0]).toMatchObject({
      status: "waiting",
      attempts: 0,
      busy: 1,
      notBefore: now + 5_000,
    })
    expect(toView(tryOn!).busy).toBe(true)
    // Not before its time.
    now += 4_000
    await advance(deps, UID, id)
    expect(render.started).toHaveLength(0)
    now += 1_001
    tryOn = await advance(deps, UID, id)
    expect(tryOn?.steps[0]).toMatchObject({ busy: 2, notBefore: now + 10_000 })

    render.failStarts(null)
    now += 10_001
    tryOn = await advance(deps, UID, id)
    expect(tryOn?.steps[0]).toMatchObject({
      status: "running",
      attempts: 0,
      busy: 0,
    })
    expect(toView(tryOn!).busy).toBe(false)
  })

  it("gives up after waiting too long: Kostuma's failure, never the visitor's", async () => {
    const id = await started()
    render.failStarts(busy())
    let tryOn = await advance(deps, UID, id)
    for (let round = 0; round < 40 && tryOn?.status === "running"; round++) {
      now += 60_001
      tryOn = await advance(deps, UID, id)
    }
    expect(now - 1_000_000).toBeGreaterThan(BUSY_LIMIT_MS)
    expect(tryOn).toMatchObject({ status: "failed", failure: "failed" })
    expect((await store.room(UID)).failedTries).toBe(0)
  })

  it("asks about a running render again after a while", async () => {
    const id = await started()
    await advance(deps, UID, id)
    render.failChecks(busy())
    let tryOn = await ask(id)
    expect(tryOn?.steps[0]).toMatchObject({
      status: "running",
      attempts: 0,
      busy: 1,
      notBefore: now + 5_000,
    })
    render.failChecks(null)
    render.finish("task-0", picture(0))
    tryOn = await ask(id)
    expect(tryOn?.steps[0].status).toBe("done")
  })
})

describe("drive", () => {
  it("moves a try-on along with no page asking: each webhook keeps a picture and sends the next render", async () => {
    deps.sleep = async (ms) => {
      now += ms
    }
    const id = await started()
    await drive(deps, UID, id, { until: now + 45_000 })
    for (let index = 0; index < 5; index++) {
      const task = `task-${index}`
      render.finish(task, picture(index))
      // YouCam's notice of `task`: its step.
      const step = await store.taskStep(task)
      await drive(deps, UID, id, { due: step!.index, until: now + 45_000 })
    }
    expect((await store.tryOn(UID, id))?.status).toBe("done")
  })

  it("waits out a busy YouCam while it may", async () => {
    deps.sleep = async (ms) => {
      now += ms
      render.failStarts(null)
    }
    const id = await started()
    render.failStarts(
      new ProviderError("HTTP 503", "failed", true, { busy: true })
    )
    const tryOn = await drive(deps, UID, id, { until: now + 45_000 })
    expect(tryOn?.steps[0].status).toBe("running")
  })

  it("leaves a wait longer than it may for the next ask", async () => {
    let slept = 0
    deps.sleep = async (ms) => {
      slept += ms
      now += ms
    }
    const id = await started()
    render.failStarts(
      new ProviderError("HTTP 429", "failed", true, { busy: true })
    )
    const tryOn = await drive(deps, UID, id, { until: now + 1_000 })
    expect(slept).toBe(0)
    expect(tryOn?.steps[0].status).toBe("waiting")
  })
})
