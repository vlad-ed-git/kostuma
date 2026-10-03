import { AuthErrorCodes as E } from "@/lib/auth/fireAuthError"
import { z } from "@/lib/zod"

/**
 * The feedback form's rules (spec §11.7), shared by the browser (instant
 * feedback) and the server (the check that counts). Each message is a code,
 * translated by the form (`AuthErrors` in messages/*.json).
 */

/** What a message is about, in the order the form offers them. */
export const feedbackKinds = ["bug", "feedback", "costume"] as const

export type FeedbackKind = (typeof feedbackKinds)[number]

export const MESSAGE_MIN = 10
export const MESSAGE_MAX = 2000

/**
 * The kind a link asks for (`/feedback?type=bug`), else "feedback": the
 * footer's three links each open the form on theirs.
 */
export function kindOf(type: unknown): FeedbackKind {
  return feedbackKinds.find((kind) => kind === type) ?? "feedback"
}

const anEmail = z.email()

export const feedbackSchema = z.object({
  kind: z.enum(feedbackKinds, { error: E.UNKNOWN_AUTH_ERROR }),
  message: z
    .string()
    .trim()
    .min(1, E.MESSAGE_REQUIRED)
    .min(MESSAGE_MIN, E.MESSAGE_TOO_SHORT)
    .max(MESSAGE_MAX, E.MESSAGE_TOO_LONG),
  // Optional: only for a reply. Left empty, it is "".
  email: z
    .string()
    .trim()
    .max(254, E.INVALID_EMAIL)
    .refine((email) => email === "" || anEmail.safeParse(email).success, {
      error: E.INVALID_EMAIL,
    }),
  recaptcha: z.string().min(1, E.ROBOT_CHECK_REQUIRED),
})

export type FeedbackInput = z.input<typeof feedbackSchema>
