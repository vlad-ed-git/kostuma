import type { TryOn } from "./try-on"

/**
 * One costume free per account (owner, 2026-10-04): one try-on, its outfit
 * and its whole makeup guide. A try-on holds it from the moment it starts;
 * once one is done, the account has used it, and no other try-on starts:
 * not of another costume, not with other photos. Seeing a try-on already
 * made is always free. A try-on that fails gives it back, so the visitor
 * can try again with other photos, but only FAILED_TRIES times once YouCam
 * had made pictures for them (its units spent): then it is gone too. The
 * server decides (FittingRoomStore `begin`); the page only reflects it.
 */

/** Try-ons that may fail after pictures were made, before none can start. */
export const FAILED_TRIES = 2

/** Whether the account may start a try-on; if not, which costume has it. */
export type Allowance =
  | { free: true }
  | {
      free: false
      /** The costume tried on with it; null when failed tries used it up. */
      costume: string | null
    }

/**
 * The account's free costume, from its try-ons (the newest first) and its
 * failed tries. Only try-ons of `renderer` count: a test build's fake never
 * uses up a real one.
 */
export function allowanceOf(
  tryOns: readonly Pick<TryOn, "slug" | "renderer" | "status">[],
  failedTries: number,
  renderer: TryOn["renderer"]
): Allowance {
  const holder = tryOns.find(
    (each) => each.renderer === renderer && each.status !== "failed"
  )
  if (holder) return { free: false, costume: holder.slug }
  if (failedTries >= FAILED_TRIES) return { free: false, costume: null }
  return { free: true }
}

/** Whether YouCam made any picture for a try-on: its units were spent. */
export const madePictures = (tryOn: Pick<TryOn, "steps">) =>
  tryOn.steps.some((step) => step.status === "done")
