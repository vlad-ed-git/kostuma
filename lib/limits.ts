import type { Limit } from "@/lib/rate-limit"

/**
 * How often visitors may do what costs Kostuma (lib/rate-limit.ts). Here, not
 * beside the server actions using them: a "use server" file exports async
 * functions only.
 */

/** Feedback messages per account, or connection, an hour. */
export const FEEDBACK_LIMIT: Limit = {
  name: "feedback",
  max: 5,
  windowMs: 60 * 60_000,
}

/**
 * Try-ons an account may start an hour: far more than anyone trying photos
 * needs, few enough that no account makes the server open photos in a loop.
 */
export const START_LIMIT: Limit = {
  name: "try-on-start",
  max: 10,
  windowMs: 60 * 60_000,
}

/** Every limit an account is counted by (deleting an account forgets them). */
export const ACCOUNT_LIMITS = [FEEDBACK_LIMIT, START_LIMIT]
