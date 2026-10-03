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
  type Fitting,
  LEASE_MS,
  MAX_ATTEMPTS,
  RUN_LIMIT_MS,
  tryOnId,
} from "./steps"
import type { FittingRoomStore } from "./try-on"

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

const fitting: Fitting = {
  slug: "ghostface",
  guide,
  face: { id: "f".repeat(32), width: 768, height: 1024, skin: "#C7998A" },
  body: BODY_PHOTO,
}

/**
 * A provider run by the test: every task runs until the test says how it
 * ends (`finish`), and every call is noted.
 */
function scripted() {
  const started: { task: string; render: Render; images: RenderImages }[] = []
  const states = new Map<string, TaskState>()
  const discarded: string[] = []
  let startError: Error | null = null
  let checkError: Error | null = null
  const provider: RenderProvider = {
    async start(render, images) {
      if (startError) throw startError
      const task = `task-${started.length}`
      started.push({ task, render, images })
      states.set(task, { status: "running" })
      return task
    },
    async check(task) {
      if (checkError) throw checkError
      const state = states.get(task)
      if (!state) throw new ProviderError("unknown", "failed", false)
      return state
    },
    async discard(task) {
      discarded.push(task)
    },
  }
  return {
    provider,
    started,
    discarded,
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

/** Starts the try-on and returns its id. */
async function started() {
  const { tryOn } = await begin(deps, UID, fitting)
  return tryOn.id
}

describe("begin", () => {
  it("keeps a new try-on, its steps waiting: the outfit, then the guide", async () => {
    const result = await begin(deps, UID, fitting)
    expect(result.outcome).toBe("started")
    expect(result.tryOn.id).toBe(
      tryOnId(fitting.face.id, BODY_PHOTO.id, "ghostface")
    )
    expect(result.tryOn.steps.map((step) => step.render.tool)).toEqual([
      "clothes",
      "makeup",
      "makeup",
      "hair",
    ])
    expect(result.tryOn.steps.every((step) => step.status === "waiting")).toBe(
      true
    )
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
    expect(again.tryOn.status).toBe("running")
  })

  it("makes another try-on for other photos or another costume", () => {
    const one = tryOnId("a".repeat(32), "b".repeat(32), "ghostface")
    expect(tryOnId("c".repeat(32), "b".repeat(32), "ghostface")).not.toBe(one)
    expect(tryOnId("a".repeat(32), "c".repeat(32), "ghostface")).not.toBe(one)
    expect(tryOnId("a".repeat(32), "b".repeat(32), "pennywise")).not.toBe(one)
    expect(tryOnId("a".repeat(32), null, "ghostface")).not.toBe(one)
  })
})

describe("advance", () => {
  it("tries the outfit on first, on the body photo with the garment", async () => {
    const id = await started()
    const tryOn = await advance(deps, UID, id)
    expect(render.started).toHaveLength(1)
    expect(render.started[0].render.tool).toBe("clothes")
    expect(render.started[0].images).toEqual({ source: BODY, garment: GARMENT })
    expect(tryOn?.steps.map((step) => step.status)).toEqual([
      "running",
      "waiting",
      "waiting",
      "waiting",
    ])
  })

  it("paints each step on the picture the step before left, once the outfit is done", async () => {
    const id = await started()
    await advance(deps, UID, id)
    render.finish("task-0", picture(0))

    // The ask that keeps the outfit sends the first makeup step, on the face.
    let tryOn = await advance(deps, UID, id)
    expect(tryOn?.steps[0].status).toBe("done")
    expect(await store.stepImage(UID, id, 0)).toEqual(new Uint8Array([100]))
    expect(render.discarded).toContain("task-0")
    expect(render.started).toHaveLength(2)
    expect(render.started[1].render.tool).toBe("makeup")
    expect(render.started[1].images).toEqual({ source: FACE })
    // The next one waits for it.
    expect(tryOn?.steps.slice(2).map((step) => step.status)).toEqual([
      "waiting",
      "waiting",
    ])

    render.finish("task-1", picture(1))
    tryOn = await advance(deps, UID, id)
    expect(render.started[2].render.tool).toBe("makeup")
    expect(render.started[2].images).toEqual({ source: new Uint8Array([101]) })

    render.finish("task-2", picture(2))
    tryOn = await advance(deps, UID, id)
    expect(render.started[3].render.tool).toBe("hair")
    expect(render.started[3].images).toEqual({ source: new Uint8Array([102]) })

    render.finish("task-3", picture(3))
    tryOn = await advance(deps, UID, id)
    expect(tryOn?.status).toBe("done")
    expect(tryOn?.steps.every((step) => step.status === "done")).toBe(true)
  })

  it("starts a costume that is all makeup on the face photo at once, with no body photo", async () => {
    const allMakeup: Fitting = {
      ...fitting,
      guide: { ...guide, allMakeup: true },
      body: null,
    }
    const { tryOn } = await begin(deps, UID, allMakeup)
    expect(tryOn.id).toBe(tryOnId(fitting.face.id, null, "ghostface"))
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
    await Promise.all([
      advance(deps, UID, id),
      advance(deps, UID, id),
      advance(deps, UID, id),
    ])
    expect(render.started).toHaveLength(1)
  })

  it("fails the try-on when a photo can't be read, and sends nothing more", async () => {
    const id = await started()
    await advance(deps, UID, id)
    render.finish("task-0", {
      status: "error",
      reason: "body_photo",
      retry: false,
      detail: "error_pose",
    })
    const tryOn = await advance(deps, UID, id)
    expect(tryOn).toMatchObject({ status: "failed", failure: "body_photo" })
    // No makeup is paid for after a failed outfit.
    await advance(deps, UID, id)
    expect(render.started).toHaveLength(1)
    expect(render.discarded).toContain("task-0")
  })

  it("fails the try-on when the face can't be read, and paints nothing after it", async () => {
    const id = await started()
    await advance(deps, UID, id)
    render.finish("task-0", picture(0))
    await advance(deps, UID, id)
    render.finish("task-1", {
      status: "error",
      reason: "face_photo",
      retry: false,
      detail: "error_face_angle_invalid",
    })
    const tryOn = await advance(deps, UID, id)
    expect(tryOn).toMatchObject({ status: "failed", failure: "face_photo" })
    await advance(deps, UID, id)
    expect(render.started).toHaveLength(2)
  })

  it("tries a hiccup again, and gives up after MAX_ATTEMPTS", async () => {
    const id = await started()
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      await advance(deps, UID, id)
      render.finish(`task-${attempt}`, {
        status: "error",
        reason: "failed",
        retry: true,
        detail: "unknown_internal_error",
      })
      const tryOn = await advance(deps, UID, id)
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

  it("closes the try-on when the service refuses (no units, no key)", async () => {
    const id = await started()
    render.failStarts(new ProviderError("401", "unavailable", false))
    const tryOn = await advance(deps, UID, id)
    expect(tryOn).toMatchObject({ status: "failed", failure: "unavailable" })
  })

  it("asks again next time when the service can't be reached", async () => {
    const id = await started()
    await advance(deps, UID, id)
    render.failChecks(new ProviderError("timeout", "failed", true))
    const tryOn = await advance(deps, UID, id)
    expect(tryOn?.steps[0]).toMatchObject({ status: "running", attempts: 0 })
    render.failChecks(null)
    render.finish("task-0", picture(0))
    expect((await advance(deps, UID, id))?.steps[0].status).toBe("done")
  })

  it("gives up on a render that runs too long, and sends it again", async () => {
    const id = await started()
    await advance(deps, UID, id)
    now += RUN_LIMIT_MS + 1
    let tryOn = await advance(deps, UID, id)
    expect(render.discarded).toContain("task-0")
    expect(tryOn?.steps[0]).toMatchObject({ status: "waiting", attempts: 1 })
    tryOn = await advance(deps, UID, id)
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
    await advance(deps, UID, id)
    expect(render.started).toHaveLength(0)
    now += LEASE_MS + 1
    await advance(deps, UID, id)
    expect(render.started).toHaveLength(1)
  })

  it("leaves a finished try-on alone", async () => {
    const id = await started()
    await store.finish(UID, id, "done", null)
    await advance(deps, UID, id)
    expect(render.started).toHaveLength(0)
  })

  it("knows no try-on of another account", async () => {
    const id = await started()
    expect(await advance(deps, "someone-else", id)).toBeNull()
  })
})
