import { createHash } from "node:crypto"

import type { MakeupGuide } from "@/lib/makeup"

import {
  ProviderError,
  type RenderFailure,
  type RenderProvider,
} from "./provider"
import { PIPELINE_VERSION, renderPlan, type Render } from "./render-plan"
import type {
  Begun,
  FacePhoto,
  FittingRoomStore,
  Photo,
  StepStatus,
  StoredStep,
  TryOn,
} from "./try-on"

/**
 * Drives a try-on, one small move per call: the page asks every couple of
 * seconds (`advance`), and each ask sends the steps whose picture can start,
 * looks in on those running, and keeps the pictures that are done. Nothing
 * needs to run in the background, and two tabs asking at once never send a
 * render twice: every move first claims its step (FittingRoomStore
 * `updateStep`).
 */

/** A claim ("starting", "saving") whose request died is taken over after this. */
export const LEASE_MS = 60_000
/** A render still running after this is given up and tried again. */
export const RUN_LIMIT_MS = 5 * 60_000
/** Tries per step before the try-on fails. */
export const MAX_ATTEMPTS = 3

export type Deps = {
  store: FittingRoomStore
  provider: RenderProvider
  /** A costume's garment picture for the outfit's render (garment.ts). */
  garment: (slug: string) => Promise<Uint8Array>
  now?: () => number
}

/** What a try-on is made of. */
export type Fitting = {
  slug: string
  guide: MakeupGuide
  face: FacePhoto
  body: Photo
}

/** A try-on's id: its photos, costume and pipeline version. */
export function tryOnId(face: string, body: string, slug: string) {
  return createHash("sha256")
    .update(`${face}\n${body}\n${slug}\n${PIPELINE_VERSION}`)
    .digest("hex")
    .slice(0, 32)
}

/** A try-on, before anything is sent. */
export function newTryOn(
  { slug, guide, face, body }: Fitting,
  now: number
): TryOn {
  return {
    id: tryOnId(face.id, body.id, slug),
    slug,
    face: face.id,
    body: body.id,
    version: PIPELINE_VERSION,
    status: "running",
    steps: renderPlan(slug, guide, face.skin).map((render) => ({
      render,
      status: "waiting",
      task: null,
      since: now,
      attempts: 0,
      failure: null,
    })),
    failure: null,
    createdAt: now,
    updatedAt: now,
  }
}

/** Starts a try-on, unless the same one exists already (then that one). */
export async function begin(
  { store, now = Date.now }: Pick<Deps, "store" | "now">,
  uid: string,
  fitting: Fitting
): Promise<Begun> {
  return store.begin(uid, newTryOn(fitting, now()))
}

/** Moves a try-on along; the try-on as it now stands (null if none). */
export async function advance(
  deps: Deps,
  uid: string,
  id: string
): Promise<TryOn | null> {
  const { store, provider } = deps
  let tryOn = await store.tryOn(uid, id)
  if (!tryOn || tryOn.status !== "running") return tryOn

  // A picture kept in this pass may free the steps that wait on it: they
  // are sent in a second pass, not on the next ask.
  for (let pass = 0; pass < 2; pass++) {
    const current: TryOn = tryOn
    const kept = await Promise.all(
      current.steps.map((_, index) => advanceStep(deps, uid, current, index))
    )
    const next = await store.tryOn(uid, id)
    if (!next) return null
    tryOn = next
    if (!kept.includes(true) || tryOn.status !== "running") break
  }

  if (tryOn.status !== "running") return tryOn
  const failed = tryOn.steps.find((step) => step.status === "failed")
  if (failed) {
    if (await store.finish(uid, id, "failed", failed.failure ?? "failed")) {
      // The rest would be paid for nothing: stop what still runs.
      await Promise.all(
        tryOn.steps.map((step) =>
          step.status === "running" && step.task
            ? provider.discard(step.task)
            : undefined
        )
      )
    }
  } else if (tryOn.steps.every((step) => step.status === "done")) {
    await store.finish(uid, id, "done", null)
  } else {
    return tryOn
  }
  return store.tryOn(uid, id)
}

/** A step's state when it was read: a later change must find it unchanged. */
type Seen = { status: StepStatus; since: number }

const unchanged = (seen: Seen) => (step: StoredStep) =>
  step.status === seen.status && step.since === seen.since

/** Moves one step along; true when it kept the step's picture. */
async function advanceStep(
  deps: Deps,
  uid: string,
  tryOn: TryOn,
  index: number
): Promise<boolean> {
  const now = deps.now ?? Date.now
  const step = tryOn.steps[index]
  const stale = now() - step.since > LEASE_MS
  if (step.status === "waiting" || (step.status === "starting" && stale)) {
    await send(deps, uid, tryOn, index)
    return false
  }
  if (step.status === "running" || (step.status === "saving" && stale))
    return collect(deps, uid, tryOn, index)
  return false
}

/** Sends a step's render, once the picture it starts from exists. */
async function send(deps: Deps, uid: string, tryOn: TryOn, index: number) {
  const { store, provider, now = Date.now } = deps
  const step = tryOn.steps[index]
  const source = await sourceOf(store, uid, tryOn, step.render)
  if (source === "not yet") return

  const claim: Seen = { status: "starting", since: now() }
  const claimed = await store.updateStep(
    uid,
    tryOn.id,
    index,
    unchanged(step),
    claim
  )
  if (!claimed) return
  if (source === null) {
    console.error(
      `Try-on ${tryOn.id}: the picture step ${index} starts from is gone.`
    )
    return setBack(
      deps,
      uid,
      tryOn.id,
      index,
      claim,
      step.attempts,
      "failed",
      false
    )
  }

  let task: string
  try {
    const garment =
      step.render.tool === "clothes"
        ? await deps.garment(step.render.garment)
        : undefined
    task = await provider.start(step.render, { source, garment })
  } catch (error) {
    const { reason, retry } = failureOf(error)
    console.error(`Try-on ${tryOn.id}: step ${index} could not start.`, error)
    return setBack(
      deps,
      uid,
      tryOn.id,
      index,
      claim,
      step.attempts,
      reason,
      retry
    )
  }
  const running = await store.updateStep(
    uid,
    tryOn.id,
    index,
    unchanged(claim),
    {
      status: "running",
      task,
      since: now(),
    }
  )
  // Another request took the step over meanwhile: this render isn't needed.
  if (!running) await provider.discard(task)
}

/** Looks in on a running render, and keeps its picture once it's done. */
async function collect(
  deps: Deps,
  uid: string,
  tryOn: TryOn,
  index: number
): Promise<boolean> {
  const { store, provider, now = Date.now } = deps
  const step = tryOn.steps[index]
  const { task } = step
  const back = (reason: RenderFailure, retry: boolean) =>
    setBack(deps, uid, tryOn.id, index, step, step.attempts, reason, retry)
  if (!task) {
    await back("failed", true)
    return false
  }
  const overdue = now() - step.since > RUN_LIMIT_MS

  let state
  try {
    state = await provider.check(task, step.render.tool)
  } catch (error) {
    const { reason, retry } = failureOf(error)
    // A hiccup asking: the next ask tries again, unless it has gone on too long.
    if (retry && !overdue) return false
    console.error(
      `Try-on ${tryOn.id}: step ${index} could not be checked.`,
      error
    )
    await back(reason, retry)
    return false
  }

  if (state.status === "running") {
    if (!overdue) return false
    console.error(`Try-on ${tryOn.id}: step ${index} ran too long.`)
    await provider.discard(task)
    await back("failed", true)
    return false
  }
  if (state.status === "error") {
    console.error(`Try-on ${tryOn.id}: step ${index} failed: ${state.detail}`)
    await provider.discard(task)
    await back(state.reason, state.retry)
    return false
  }

  const claim: Seen = { status: "saving", since: now() }
  if (!(await store.updateStep(uid, tryOn.id, index, unchanged(step), claim)))
    return false
  await store.saveStepImage(uid, tryOn.id, index, state.image)
  const kept = await store.updateStep(uid, tryOn.id, index, unchanged(claim), {
    status: "done",
    task: null,
    since: now(),
  })
  await provider.discard(task)
  return kept
}

/** A step that didn't work: tried again, or failed for good. */
async function setBack(
  { store, now = Date.now }: Deps,
  uid: string,
  id: string,
  index: number,
  seen: Seen,
  attempts: number,
  reason: RenderFailure,
  retry: boolean
) {
  const tries = attempts + 1
  const again = retry && tries < MAX_ATTEMPTS
  await store.updateStep(
    uid,
    id,
    index,
    unchanged(seen),
    again
      ? { status: "waiting", task: null, attempts: tries, since: now() }
      : {
          status: "failed",
          task: null,
          attempts: tries,
          failure: reason,
          since: now(),
        }
  )
}

/**
 * The picture a render starts from: one of the visitor's photos, or an
 * earlier step's picture. "Not yet" while the step it follows works; null
 * if the picture is gone.
 */
async function sourceOf(
  store: FittingRoomStore,
  uid: string,
  tryOn: TryOn,
  render: Render
): Promise<Uint8Array | null | "not yet"> {
  const done = (index: number) => tryOn.steps[index]?.status === "done"
  if (render.after !== null && !done(render.after)) return "not yet"
  if (render.from === "body") return store.photo(uid, "body", tryOn.body)
  if (render.from === "face") return store.photo(uid, "face", tryOn.face)
  if (!done(render.from)) return "not yet"
  return store.stepImage(uid, tryOn.id, render.from)
}

function failureOf(error: unknown): { reason: RenderFailure; retry: boolean } {
  return error instanceof ProviderError
    ? { reason: error.reason, retry: error.retry }
    : { reason: "failed", retry: true }
}
