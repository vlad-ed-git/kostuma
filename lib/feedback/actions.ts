"use server"

import { hasLocale } from "next-intl"
import { headers } from "next/headers"
import { after } from "next/server"

import { routing } from "@/i18n/routing"
import { AuthErrorCodes } from "@/lib/auth/fireAuthError"
import { verifyRecaptcha } from "@/lib/auth/recaptcha"
import { fieldErrorsOf, type FieldErrors } from "@/lib/auth/schemas"
// By its alias: the e2e build swaps in a stand-in (session.e2e.ts).
import { getUser } from "@/lib/auth/session"
import { addressOf, sweepRateLimits, withinLimit } from "@/lib/rate-limit"
import { visitorFrom } from "@/lib/visitor"

import { feedbackSchema, type FeedbackInput } from "./schema"
import { saveFeedback } from "./store"

/**
 * Per hour, per account (signed in) or per connection: plenty for anyone
 * with something to say, too few to flood the form.
 */
const FEEDBACK_LIMIT = { name: "feedback", max: 5, windowMs: 60 * 60 * 1000 }

export type FeedbackResult =
  | { ok: true }
  | {
      ok: false
      error?: AuthErrorCodes
      fieldErrors?: FieldErrors<FeedbackInput>
    }

/**
 * Keeps a message from the feedback form (spec §11.7) once it is valid,
 * reCAPTCHA passes and its sender is within the limit. A server action is
 * a public endpoint: everything is checked here again, and the answer is
 * codes the form translates.
 */
export async function sendFeedback(
  input: FeedbackInput,
  locale: string
): Promise<FeedbackResult> {
  const form = feedbackSchema.safeParse(input)
  if (!form.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(form.error) }
  }

  const { kind, message, email } = form.data
  try {
    // First: a sender without a real tick never uses up a turn.
    if (!(await verifyRecaptcha(form.data.recaptcha))) {
      return {
        ok: false,
        fieldErrors: { recaptcha: AuthErrorCodes.ROBOT_CHECK_FAILED },
      }
    }
    const request = await headers()
    const user = await getUser()
    const sender = user
      ? `account:${user.uid}`
      : `address:${addressOf(request) ?? "unknown"}`
    if (!(await withinLimit(FEEDBACK_LIMIT, sender))) {
      return { ok: false, error: AuthErrorCodes.TOO_MANY_MESSAGES }
    }

    const { device, os, browser } = visitorFrom(request)
    await saveFeedback({
      kind,
      message,
      email: email || null,
      uid: user?.uid ?? null,
      locale: hasLocale(routing.locales, locale)
        ? locale
        : routing.defaultLocale,
      device,
      os,
      browser,
    })
    // Once the answer is on its way: tidying never slows or fails a send.
    after(() =>
      sweepRateLimits().catch((error: unknown) =>
        console.error("Could not sweep the rate limits.", error)
      )
    )
    return { ok: true }
  } catch (error) {
    console.error("Could not keep a feedback message.", error)
    return { ok: false, error: AuthErrorCodes.UNKNOWN_AUTH_ERROR }
  }
}
