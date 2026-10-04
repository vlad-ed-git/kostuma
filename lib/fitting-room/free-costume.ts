import type { RenderFailure } from "./provider"
import type { StoredStep, TryOn } from "./try-on"

/**
 * One costume free per account (owner, 2026-10-04): one try-on, its outfit
 * and its whole makeup guide. A try-on holds it from the moment it starts;
 * once one is done, the account has used it, and no other try-on starts:
 * not of another costume, not with other photos. Seeing a try-on already
 * made is always free. A try-on that fails gives it back, so the visitor
 * can try again with other photos, but only FAILED_TRIES times once their
 * own photos failed after YouCam had made pictures for them (its units
 * spent): then it is gone too. Kostuma's failures and YouCam's (an outage,
 * no units left, a timeout) never count (todo ENG-03). The server decides
 * (FittingRoomStore `begin`); the page only reflects it.
 *
 * It is kept per account apart from the photos and try-ons
 * (`allowances/{uid}`): deleting them, or their expiry after 12 months,
 * never gives it back (todo SEC-04). Accounts from before it was kept
 * (2026-10-04) have theirs worked out from their try-ons (`recordOf`).
 */

/**
 * Try-ons whose photos may fail after pictures were made, before none can
 * start.
 */
export const FAILED_TRIES = 2

type Renderer = TryOn["renderer"]

/** The try-on holding the free costume: its costume, and whether it's done. */
export type Holder = { tryOn: string; costume: string; done: boolean }

/** An account's free costume, as kept. */
export type AllowanceRecord = {
  /** Per renderer (a test build's fake never uses up a real one). */
  held: Partial<Record<Renderer, Holder>>
  /** Try-ons whose photos failed after pictures were made. */
  failedTries: number
}

/** Whether the account may start a try-on; if not, which costume has it. */
export type Allowance =
  | {
      free: true
      /** Try-ons whose photos may still fail after pictures were made. */
      triesLeft: number
    }
  | {
      free: false
      /** The costume tried on with it; null when failed tries used it up. */
      costume: string | null
      /** Its try-on; null when failed tries used it up. */
      tryOn: string | null
    }

/** A new account's: free. */
export const NO_RECORD: AllowanceRecord = { held: {}, failedTries: 0 }

/** The account's free costume, for `renderer`, from its record. */
export function allowanceFrom(
  record: AllowanceRecord,
  renderer: Renderer
): Allowance {
  const holder = record.held[renderer]
  if (holder)
    return { free: false, costume: holder.costume, tryOn: holder.tryOn }
  if (record.failedTries >= FAILED_TRIES)
    return { free: false, costume: null, tryOn: null }
  return { free: true, triesLeft: FAILED_TRIES - record.failedTries }
}

/**
 * The record of an account from before records were kept: from its
 * try-ons (the newest first) and its failed tries.
 */
export function recordOf(
  tryOns: readonly Pick<TryOn, "id" | "slug" | "renderer" | "status">[],
  failedTries: number
): AllowanceRecord {
  const held: AllowanceRecord["held"] = {}
  for (const tryOn of tryOns) {
    if (tryOn.status === "failed" || held[tryOn.renderer]) continue
    held[tryOn.renderer] = {
      tryOn: tryOn.id,
      costume: tryOn.slug,
      done: tryOn.status === "done",
    }
  }
  return { held, failedTries }
}

/**
 * The account's free costume, from its try-ons and failed tries (an
 * account from before records were kept).
 */
export function allowanceOf(
  tryOns: readonly Pick<TryOn, "id" | "slug" | "renderer" | "status">[],
  failedTries: number,
  renderer: Renderer
): Allowance {
  return allowanceFrom(recordOf(tryOns, failedTries), renderer)
}

/** A stored record; null when there is none (or it's malformed). */
export function readRecord(data: unknown): AllowanceRecord | null {
  if (typeof data !== "object" || data === null) return null
  const { held, failedTries } = data as Record<string, unknown>
  const record: AllowanceRecord = {
    held: {},
    failedTries:
      typeof failedTries === "number" && failedTries > 0 ? failedTries : 0,
  }
  if (typeof held === "object" && held !== null) {
    for (const renderer of ["youcam", "fake"] as const) {
      const holder = (held as Record<string, unknown>)[renderer]
      if (typeof holder !== "object" || holder === null) continue
      const { tryOn, costume, done } = holder as Record<string, unknown>
      if (typeof tryOn === "string" && typeof costume === "string")
        record.held[renderer] = { tryOn, costume, done: done === true }
    }
  }
  return record
}

/** The record once `tryOn` starts: it holds the free costume. */
export function holding(
  record: AllowanceRecord,
  tryOn: Pick<TryOn, "id" | "slug" | "renderer">
): AllowanceRecord {
  return {
    ...record,
    held: {
      ...record.held,
      [tryOn.renderer]: { tryOn: tryOn.id, costume: tryOn.slug, done: false },
    },
  }
}

/**
 * The record once `tryOn` ends: done, it keeps the free costume for good;
 * failed, it gives it back, and the visitor's photo failures after
 * pictures were made count.
 */
export function ended(
  record: AllowanceRecord,
  tryOn: Pick<TryOn, "id" | "renderer" | "steps">,
  status: "done" | "failed",
  failure: RenderFailure | null
): AllowanceRecord {
  const held = { ...record.held }
  const holder = held[tryOn.renderer]
  if (holder?.tryOn === tryOn.id) {
    if (status === "done") held[tryOn.renderer] = { ...holder, done: true }
    else delete held[tryOn.renderer]
  }
  const counted = status === "failed" && countsAsFailedTry(tryOn, failure)
  return {
    held,
    failedTries: record.failedTries + (counted ? 1 : 0),
  }
}

/**
 * The record once the account's try-ons are deleted (its photos deleted, or
 * expired): one that was still running keeps the free costume used if
 * pictures were made for it (its units spent), else gives it back.
 */
export function erased(
  record: AllowanceRecord,
  tryOns: readonly Pick<TryOn, "id" | "renderer" | "status" | "steps">[]
): AllowanceRecord {
  const held = { ...record.held }
  for (const tryOn of tryOns) {
    const holder = held[tryOn.renderer]
    if (holder?.tryOn !== tryOn.id || tryOn.status !== "running") continue
    if (madePictures(tryOn)) held[tryOn.renderer] = { ...holder, done: true }
    else delete held[tryOn.renderer]
  }
  return { ...record, held }
}

/** Whether YouCam made any picture for a try-on: its units were spent. */
export const madePictures = (tryOn: {
  steps: readonly Pick<StoredStep, "status">[]
}) => tryOn.steps.some((step) => step.status === "done")

/** The failures that are the visitor's photos': theirs to retake. */
export const photoFailure = (failure: RenderFailure | null) =>
  failure === "face_photo" ||
  failure === "body_photo" ||
  failure === "photo_rejected"

/**
 * Whether a try-on that failed for `failure` uses up one of the account's
 * FAILED_TRIES: its photos failed, after pictures were made.
 */
export const countsAsFailedTry = (
  tryOn: { steps: readonly Pick<StoredStep, "status">[] },
  failure: RenderFailure | null
) => photoFailure(failure) && madePictures(tryOn)
