"use server"

import { hasLocale } from "next-intl"

import { routing } from "@/i18n/routing"
import { fieldErrorsOf, type FieldErrors } from "@/lib/auth/schemas"
// By their aliases: the e2e build swaps in stand-ins (*.e2e.ts).
import { getUser } from "@/lib/auth/session"
import { addToWaitlist, changeWaitlistEmail } from "@/lib/waitlist/store"

import {
  waitlistEmailSchema,
  waitlistSourceSchema,
  type WaitlistSource,
} from "./schema"

/** The email the waitlist has for the account, or why not (codes). */
export type WaitlistResult =
  | { ok: true; email: string }
  | {
      ok: false
      /** The session ended, or anything else went wrong. */
      error?: "signed_out" | "unknown"
      fieldErrors?: FieldErrors<{ email: string }>
    }

const languageOf = (locale: unknown) =>
  hasLocale(routing.locales, locale) ? locale : routing.defaultLocale

/**
 * "Get Kostuma Pro" (owner, 2026-10-04): puts the signed-in account on the
 * waitlist with its email, once; pressed again, the entry as it is. A
 * server action is a public endpoint: everything is checked here.
 */
export async function joinWaitlist(
  source: WaitlistSource,
  locale: string
): Promise<WaitlistResult> {
  const where = waitlistSourceSchema.safeParse(source)
  if (!where.success) return { ok: false, error: "unknown" }
  try {
    const user = await getUser()
    if (!user) return { ok: false, error: "signed_out" }
    const email = await addToWaitlist({
      uid: user.uid,
      email: user.email,
      accountEmail: user.email,
      locale: languageOf(locale),
      source: where.data,
    })
    return { ok: true, email }
  } catch (error) {
    console.error("Could not put an account on the waitlist.", error)
    return { ok: false, error: "unknown" }
  }
}

/**
 * The pop-up's Update: the email to reach the account at, when the visitor
 * gives another (some sign in with an address they don't read). Kept only
 * when it differs from the one the waitlist has.
 */
export async function updateWaitlistEmail(
  input: { email: string },
  source: WaitlistSource,
  locale: string
): Promise<WaitlistResult> {
  const form = waitlistEmailSchema.safeParse(input)
  if (!form.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(form.error) }
  }
  const where = waitlistSourceSchema.safeParse(source)
  if (!where.success) return { ok: false, error: "unknown" }
  try {
    const user = await getUser()
    if (!user) return { ok: false, error: "signed_out" }
    const email = await changeWaitlistEmail({
      uid: user.uid,
      email: form.data.email,
      accountEmail: user.email,
      locale: languageOf(locale),
      source: where.data,
    })
    return { ok: true, email }
  } catch (error) {
    console.error("Could not change a waitlist email.", error)
    return { ok: false, error: "unknown" }
  }
}
