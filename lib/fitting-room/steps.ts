import { createHash } from "node:crypto"

import type { MakeupGuide } from "@/lib/makeup"

import { admits, unitsOfGuide } from "./budget"
import { BUSY_LIMIT_MS, busyDelay, checkEvery } from "./calls"
import type { Consent } from "./consent"
import {
  ProviderError,
  type RenderFailure,
  type RenderImages,
  type RenderProvider,
  type Started,
} from "./provider"
import {
  dressesFace,
  PIPELINE_VERSION,
  renderPlan,
  type Render,
} from "./render-plan"
import type {
  Begun,
  FacePhoto,
  FittingRoomStore,
  Photo,
  StepStatus,
  StoredStep,
  TryOn,
} from "./try-on"

type Renderer = RenderProvider["name"]

/**
 * Drives a try-on, one small move per call (`advance`): each sends the steps
 * whose picture can start, looks in on those running, and keeps the
 * pictures that are done. YouCam's webhook calls it when a render finishes
 * (app/api/youcam/webhook, `drive`), so a try-on goes on with its page
 * closed; the page asks too, every couple of seconds, which is all there
 * is where webhooks can't reach (localhost). Whoever asks, YouCam is asked
 * about a running render at most every few seconds (calls.ts `checkEvery`),
 * and a busy YouCam makes a render wait, never fail. Two requests at once
 * never send a render twice: every move first claims its step
 * (FittingRoomStore `updateStep`).
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
  /** Waits (`drive`); a test's clock moves instead. */
  sleep?: (ms: number) => Promise<void>
}

/**
 * What a try-on is made of: no body photo and no garment for a costume that
 * is all makeup.
 */
export type Fitting = {
  slug: string
  guide: MakeupGuide
  face: FacePhoto
  body: Photo | null
  /** The outfit picture tried on: its URL, which changes with its content. */
  garment: string | null
}

/**
 * A try-on's id: its photos, costume, renderer, pipeline version and the
 * outfit picture tried on (a fake try-on never stands in for a real one,
 * nor a try-on of an outfit picture since replaced for the new one).
 */
export function tryOnId(
  face: string,
  body: string | null,
  slug: string,
  renderer: Renderer,
  garment: string | null
) {
  return createHash("sha256")
    .update(
      `${face}\n${body ?? "-"}\n${slug}\n${renderer}\n${PIPELINE_VERSION}\n${garment ?? "-"}`
    )
    .digest("hex")
    .slice(0, 32)
}

/** A try-on, before anything is sent, with the consent it starts on. */
export function newTryOn(
  { slug, guide, face, body, garment }: Fitting,
  now: number,
  renderer: Renderer,
  consent?: Consent
): TryOn {
  return {
    ...(consent && { consent }),
    id: tryOnId(face.id, body?.id ?? null, slug, renderer, garment),
    slug,
    renderer,
    face: face.id,
    body: body?.id ?? null,
    garment,
    version: PIPELINE_VERSION,
    status: "running",
    steps: renderPlan(slug, guide, face).map((render) => ({
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

/**
 * Starts a try-on, unless the same one exists already (then that one), or
 * the account's free costume is used (lib/fitting-room/free-costume.ts).
 */
export async function begin(
  { store, provider, now = Date.now }: Pick<Deps, "store" | "provider" | "now">,
  uid: string,
  fitting: Fitting,
  consent?: Consent
): Promise<Begun> {
  return store.begin(uid, newTryOn(fitting, now(), provider.name, consent))
}

/**
 * Whether `begin` would give a try-on ("ok"): the one already made, or a
 * new one the free costume allows ("out_of_units" if not), while the
 * Fitting Room is open with its units left in the day's budget ("closed"
 * if not). Asked before the photos are kept, so a try-on that can't start
 * keeps nothing; `begin` decides for good.
 */
export async function mayBegin(
  { store, provider, now = Date.now }: Pick<Deps, "store" | "provider" | "now">,
  uid: string,
  fitting: Fitting
): Promise<"ok" | "out_of_units" | "closed"> {
  const { slug, face, body, garment } = fitting
  const id = tryOnId(face.id, body?.id ?? null, slug, provider.name, garment)
  const existing = await store.tryOn(uid, id)
  if (existing && existing.status !== "failed") return "ok"
  const [allowance, capacity] = await Promise.all([
    store.allowance(uid, provider.name),
    store.capacity(now()),
  ])
  if (!allowance.free) return "out_of_units"
  const units = unitsOfGuide(fitting.guide)
  return admits(capacity.controls, capacity.reserved, units) ? "ok" : "closed"
}

/**
 * Moves a try-on along; the try-on as it now stands (null if none). `due`:
 * the step whose render YouCam says has finished (its webhook), asked about
 * at once.
 */
export async function advance(
  deps: Deps,
  uid: string,
  id: string,
  { due }: { due?: number } = {}
): Promise<TryOn | null> {
  const { store } = deps
  let tryOn = await store.tryOn(uid, id)
  if (!tryOn || tryOn.status !== "running") return tryOn

  // A picture kept in this pass may free the steps that wait on it: they
  // are sent in a second pass, not on the next ask.
  for (let pass = 0; pass < 2; pass++) {
    const current: TryOn = tryOn
    const kept = await Promise.all(
      current.steps.map((_, index) =>
        advanceStep(deps, uid, current, index, index === due && pass === 0)
      )
    )
    const next = await store.tryOn(uid, id)
    if (!next) return null
    tryOn = next
    if (!kept.includes(true) || tryOn.status !== "running") break
  }

  if (tryOn.status !== "running") return tryOn
  if (await releaseGarment(deps, uid, tryOn)) {
    const next = await store.tryOn(uid, id)
    if (!next) return null
    tryOn = next
  }
  // A face YouCam couldn't dress is made up as it is: not a failure.
  const failed = tryOn.steps.find(
    (step) => step.status === "failed" && !dressesFace(step.render)
  )
  if (failed) {
    if (await store.finish(uid, id, "failed", failed.failure ?? "failed")) {
      // The rest would be paid for nothing: stop what still runs, and let go
      // of what was kept for later.
      await Promise.all(
        tryOn.steps.map((step) =>
          (step.status === "running" || step.status === "done") && step.task
            ? discardTask(deps, step.task)
            : undefined
        )
      )
    }
  } else if (
    tryOn.steps.every(
      (step) =>
        step.status === "done" ||
        (step.status === "failed" && dressesFace(step.render))
    )
  ) {
    await store.finish(uid, id, "done", null)
  } else {
    return tryOn
  }
  return store.tryOn(uid, id)
}

/**
 * Moves a try-on along without a page asking (a webhook, the daily check)
 * until `until`: waits out the renders a busy YouCam keeps waiting, and a
 * finished render read a moment before its start was noted.
 */
export async function drive(
  deps: Deps,
  uid: string,
  id: string,
  { due, until }: { due?: number; until: number }
): Promise<TryOn | null> {
  const { now = Date.now, sleep = wait } = deps
  let tryOn = await advance(deps, uid, id, { due })
  for (let round = 0; round < 30 && tryOn?.status === "running"; round++) {
    const at = now()
    const status = due === undefined ? null : tryOn.steps[due]?.status
    const pending = status === "starting" || status === "running"
    const waiting = tryOn.steps
      .filter((step) => step.status === "waiting" && (step.busy ?? 0) > 0)
      .map((step) => step.notBefore ?? at)
    const next = pending ? at + 1_000 : Math.min(...waiting)
    if (!Number.isFinite(next) || next > until) break
    await sleep(Math.max(0, next - at))
    if (!pending) due = undefined
    tryOn = await advance(deps, uid, id, { due })
  }
  return tryOn
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

/** A step's state when it was read: a later change must find it unchanged. */
type Seen = { status: StepStatus; since: number }

const unchanged = (seen: Seen) => (step: StoredStep) =>
  step.status === seen.status && step.since === seen.since

/** Moves one step along; true when it kept the step's picture. */
async function advanceStep(
  deps: Deps,
  uid: string,
  tryOn: TryOn,
  index: number,
  due: boolean
): Promise<boolean> {
  const now = deps.now ?? Date.now
  const step = tryOn.steps[index]
  const stale = now() - step.since > LEASE_MS
  if (step.status === "waiting") {
    // Kept waiting by a busy YouCam: not before its time.
    if ((step.notBefore ?? 0) > now()) return false
    await send(deps, uid, tryOn, index)
    return false
  }
  if (step.status === "starting" && stale) {
    await send(deps, uid, tryOn, index)
    return false
  }
  if (step.status === "running") return collect(deps, uid, tryOn, index, due)
  // A request that died keeping a picture: asked again.
  if (step.status === "saving" && stale)
    return collect(deps, uid, tryOn, index, true)
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

  let started: Started
  try {
    started = await provider.start(step.render, {
      source,
      ...(await inputsOf(deps, tryOn, step.render)),
    })
  } catch (error) {
    if (error instanceof ProviderError && error.busy)
      return holdBack(deps, uid, tryOn.id, index, claim, step, error)
    const { reason, retry } = failureOf(error)
    console.error(`Try-on ${tryOn.id}: step ${index} could not start.`, error)
    await closeFor(store, error)
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
  const { task, garmentFile } = started
  // Noted first: its webhook may come any time now.
  await store.trackTask(task, { uid, id: tryOn.id, index }, now())
  const running = await store.updateStep(
    uid,
    tryOn.id,
    index,
    unchanged(claim),
    {
      status: "running",
      task,
      since: now(),
      notBefore: now() + checkEvery(step.render),
      busy: 0,
      busySince: 0,
      ...(garmentFile && { files: { garment: garmentFile } }),
    }
  )
  // Another request took the step over meanwhile: this render isn't needed.
  if (!running) await discardTask(deps, task)
}

/**
 * Looks in on a running render (unless asked too recently: `due` asks at
 * once), and keeps its picture once it's done.
 */
async function collect(
  deps: Deps,
  uid: string,
  tryOn: TryOn,
  index: number,
  due: boolean
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
  if (step.status === "running") {
    if (!due && !overdue && (step.notBefore ?? 0) > now()) return false
    // This request asks; another asking now waits its turn.
    const asking = await store.updateStep(
      uid,
      tryOn.id,
      index,
      (current) =>
        unchanged(step)(current) && current.notBefore === step.notBefore,
      { notBefore: now() + checkEvery(step.render) }
    )
    if (!asking) return false
  }

  let state
  try {
    state = await provider.check(task, step.render)
  } catch (error) {
    if (error instanceof ProviderError && error.busy) {
      const busy = (step.busy ?? 0) + 1
      await store.updateStep(uid, tryOn.id, index, unchanged(step), {
        notBefore: now() + busyDelay(busy),
        busy,
      })
      return false
    }
    const { reason, retry } = failureOf(error)
    // A hiccup asking: the next ask tries again, unless it has gone on too long.
    if (retry && !overdue) return false
    console.error(
      `Try-on ${tryOn.id}: step ${index} could not be checked.`,
      error
    )
    await closeFor(store, error)
    await back(reason, retry)
    return false
  }

  if (state.status === "running") {
    if (!overdue) return false
    console.error(`Try-on ${tryOn.id}: step ${index} ran too long.`)
    await discardTask(deps, task)
    await back("failed", true)
    return false
  }
  if (state.status === "error") {
    console.error(`Try-on ${tryOn.id}: step ${index} failed: ${state.detail}`)
    await discardTask(deps, task)
    await back(state.reason, state.retry)
    return false
  }

  const claim: Seen = { status: "saving", since: now() }
  if (!(await store.updateStep(uid, tryOn.id, index, unchanged(step), claim)))
    return false
  await store.saveStepImage(uid, tryOn.id, index, state.image)
  // The body's outfit keeps its task (and so the garment it uploaded) while
  // the face's outfit may still use it.
  const keep = needsGarment(tryOn, index)
  const kept = await store.updateStep(uid, tryOn.id, index, unchanged(claim), {
    status: "done",
    task: keep ? task : null,
    since: now(),
    notBefore: 0,
    busy: 0,
    busySince: 0,
  })
  if (!keep) await discardTask(deps, task)
  return kept
}

/**
 * Whether the task of step `index` must outlive its render: a body's
 * outfit whose garment (uploaded with it, deleted with it) the face's
 * outfit may still need.
 */
function needsGarment(tryOn: TryOn, index: number) {
  const step = tryOn.steps[index]
  if (step.render.tool !== "clothes" || step.render.from !== "body")
    return false
  return tryOn.steps.some(
    (other) =>
      dressesFace(other.render) &&
      other.status !== "done" &&
      other.status !== "failed"
  )
}

/**
 * Deletes the tasks done steps kept for the garment once no step needs it
 * (YouCam deletes a task with every file it used); true if it did.
 */
async function releaseGarment(deps: Deps, uid: string, tryOn: TryOn) {
  const released = await Promise.all(
    tryOn.steps.map(async (step, index) => {
      if (step.status !== "done" || !step.task) return false
      if (needsGarment(tryOn, index)) return false
      const { task } = step
      const mine = await deps.store.updateStep(
        uid,
        tryOn.id,
        index,
        (current) => current.status === "done" && current.task === task,
        { task: null }
      )
      if (mine) await discardTask(deps, task)
      return mine
    })
  )
  return released.includes(true)
}

/** Deletes a task at YouCam and forgets whose it was. */
async function discardTask({ store, provider }: Deps, task: string) {
  await provider.discard(task)
  await store.forgetTask(task).catch((error: unknown) => {
    console.warn("Could not forget a YouCam task.", error)
  })
}

/**
 * What a render needs besides its source picture: an outfit, its garment,
 * or the file of it the body's outfit uploaded (the face's outfit).
 */
async function inputsOf(
  deps: Deps,
  tryOn: TryOn,
  render: Render
): Promise<Omit<RenderImages, "source">> {
  if (render.tool !== "clothes") return {}
  const shared = tryOn.steps.find(
    (step) =>
      step.status === "done" && step.task && step.files?.garment !== undefined
  )?.files?.garment
  if (render.from === "face" && shared) return { garmentFile: shared }
  return { garment: await deps.garment(render.garment) }
}

/**
 * A render YouCam was too busy to take (or the call budget was spent):
 * back to waiting, not counted as an attempt, asked again after a while
 * that grows each time; given up (Kostuma's failure, never the visitor's)
 * once it has waited BUSY_LIMIT_MS.
 */
async function holdBack(
  deps: Deps,
  uid: string,
  id: string,
  index: number,
  seen: Seen,
  step: StoredStep,
  error: ProviderError
) {
  const { store, now = Date.now } = deps
  const at = now()
  const busySince = step.busySince || at
  if (at - busySince > BUSY_LIMIT_MS) {
    console.error(`Try-on ${id}: step ${index} waited too long.`, error)
    return setBack(deps, uid, id, index, seen, step.attempts, "failed", false)
  }
  const busy = (step.busy ?? 0) + 1
  await store.updateStep(uid, id, index, unchanged(seen), {
    status: "waiting",
    task: null,
    since: at,
    notBefore: at + busyDelay(busy),
    busy,
    busySince,
  })
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
      ? {
          status: "waiting",
          task: null,
          attempts: tries,
          since: now(),
          notBefore: 0,
        }
      : {
          status: "failed",
          task: null,
          attempts: tries,
          failure: reason,
          since: now(),
          notBefore: 0,
        }
  )
}

/**
 * The picture a render starts from: one of the visitor's photos, or an
 * earlier step's picture (the face photo, when that step couldn't dress
 * it). "Not yet" while the step it follows works; null if the picture is
 * gone.
 */
async function sourceOf(
  store: FittingRoomStore,
  uid: string,
  tryOn: TryOn,
  render: Render
): Promise<Uint8Array | null | "not yet"> {
  const done = (index: number) => tryOn.steps[index]?.status === "done"
  if (render.after !== null && !done(render.after)) return "not yet"
  if (render.from === "body")
    return tryOn.body ? store.photo(uid, "body", tryOn.body) : null
  if (render.from === "face") return store.photo(uid, "face", tryOn.face)
  if (done(render.from)) return store.stepImage(uid, tryOn.id, render.from)
  const before = tryOn.steps[render.from]
  if (before?.status === "failed" && dressesFace(before.render))
    return store.photo(uid, "face", tryOn.face)
  return "not yet"
}

/**
 * YouCam can't render for anyone (no units left, its key refused): the
 * Fitting Room closes at once (budget.ts), instead of failing each try-on
 * that starts.
 */
async function closeFor(store: FittingRoomStore, error: unknown) {
  if (!(error instanceof ProviderError) || !error.closes) return
  console.error(`The Fitting Room closes: YouCam's ${error.closes}.`)
  await store.close(error.closes).catch((failure: unknown) => {
    console.error("The Fitting Room could not be closed.", failure)
  })
}

function failureOf(error: unknown): { reason: RenderFailure; retry: boolean } {
  return error instanceof ProviderError
    ? { reason: error.reason, retry: error.retry }
    : { reason: "failed", retry: true }
}
