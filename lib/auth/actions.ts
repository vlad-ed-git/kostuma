"use server"

import { hasLocale } from "next-intl"

import { redirect } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"
import { adminAuth } from "@/lib/firebase/admin"
import { createProfile, hasProfile } from "@/lib/users"

import { AuthErrorCodes, authErrorOf } from "./fireAuthError"
import { safeNext } from "./next-path"
import { verifyRecaptcha } from "./recaptcha"
import {
  fieldErrorsOf,
  registerSchema,
  type FieldErrors,
  type RegisterInput,
} from "./schemas"
// By its alias: the e2e build swaps in a stand-in (session.e2e.ts).
import {
  deleteSession,
  getUser,
  saveSession,
  SESSION_SECONDS,
} from "@/lib/auth/session"

// Server actions are public endpoints: every input is checked here again.
// They answer with codes the forms translate, never with words.

/** A session may only start from a sign-in this recent. */
const MAX_SIGN_IN_AGE_SECONDS = 5 * 60

const languageOf = (locale: unknown): Locale =>
  hasLocale(routing.locales, locale) ? locale : routing.defaultLocale

/** Firestore's "already exists" (gRPC code 6). */
const alreadyExists = (error: unknown) =>
  typeof error === "object" && error !== null && "code" in error
    ? error.code === 6
    : false

export type SessionResult =
  | { error: AuthErrorCodes }
  /** A first sign-in: the visitor must agree to the terms first. */
  | { needsTerms: true }

/**
 * Swaps the ID token of a fresh sign-in for a session cookie, then goes to
 * `next`. An account without a profile (a first Google sign-in) must agree
 * to the terms (`agreed`); its profile is made then. Returns only when no
 * session was made.
 */
export async function startSession(
  idToken: string,
  next: string,
  locale: string,
  agreed = false
): Promise<SessionResult> {
  const language = languageOf(locale)
  if (typeof idToken !== "string" || idToken.length === 0) {
    return { error: AuthErrorCodes.UNKNOWN_AUTH_ERROR }
  }

  try {
    const auth = adminAuth()
    // No revocation check: a token from a sign-in minutes ago cannot predate
    // one. Every request checks the session cookie for revocation instead.
    const token = await auth.verifyIdToken(idToken)
    if (Date.now() / 1000 - token.auth_time > MAX_SIGN_IN_AGE_SECONDS) {
      return { error: AuthErrorCodes.SIGN_IN_AGAIN }
    }
    if (!(await hasProfile(token.uid))) {
      if (agreed !== true) return { needsTerms: true }
      const user = await auth.getUser(token.uid)
      await createProfile({
        uid: user.uid,
        name: user.displayName ?? "",
        email: user.email ?? "",
        locale: language,
      }).catch((error: unknown) => {
        // Made a moment ago, in another tab: that one counts.
        if (!alreadyExists(error)) throw error
      })
    }
    await saveSession(
      await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_SECONDS * 1000,
      })
    )
  } catch (error) {
    console.error("Could not start a session.", error)
    return { error: authErrorOf(error) }
  }

  // Not inside the try: the redirect must reach Next.js.
  redirect({ href: safeNext(next), locale: language })
  return { error: AuthErrorCodes.UNKNOWN_AUTH_ERROR }
}

/** Signs out on this device, then goes home. */
export async function endSession(locale: string) {
  await deleteSession()
  redirect({ href: "/", locale: languageOf(locale) })
}

export type RegisterResult =
  | { ok: true }
  | {
      ok: false
      error?: AuthErrorCodes
      fieldErrors?: FieldErrors<RegisterInput>
    }

/**
 * Creates an account and its profile once the form is valid and reCAPTCHA
 * passes. The browser then signs in with the same email and password.
 */
export async function register(
  input: RegisterInput,
  locale: string
): Promise<RegisterResult> {
  const form = registerSchema.safeParse(input)
  if (!form.success) {
    return { ok: false, fieldErrors: fieldErrorsOf(form.error) }
  }

  const { name, email, password, recaptcha } = form.data
  try {
    if (!(await verifyRecaptcha(recaptcha))) {
      return {
        ok: false,
        fieldErrors: { recaptcha: AuthErrorCodes.ROBOT_CHECK_FAILED },
      }
    }
    const { uid } = await adminAuth().createUser({
      email,
      password,
      displayName: name,
    })
    await createProfileOrUndo(uid, name, email, languageOf(locale))
    return { ok: true }
  } catch (error) {
    const problem = authErrorOf(error)
    switch (problem) {
      case AuthErrorCodes.EMAIL_EXISTS:
      case AuthErrorCodes.INVALID_EMAIL:
        return { ok: false, fieldErrors: { email: problem } }
      // The project's password policy can ask for more than the form does.
      case AuthErrorCodes.WEAK_PASSWORD:
        return { ok: false, fieldErrors: { password: problem } }
    }
    console.error("Could not create an account.", error)
    return { ok: false, error: AuthErrorCodes.UNKNOWN_AUTH_ERROR }
  }
}

/**
 * An account without a profile is incomplete: if the profile cannot be
 * made, remove the account too, so the visitor can simply register again.
 */
async function createProfileOrUndo(
  uid: string,
  name: string,
  email: string,
  locale: Locale
) {
  try {
    await createProfile({ uid, name, email, locale })
  } catch (error) {
    await adminAuth()
      .deleteUser(uid)
      .catch((undo) =>
        console.error("Could not remove an account without a profile.", undo)
      )
    throw error
  }
}

/**
 * A token that signs this browser in to Firebase as the session's account,
 * so My Pumpkin Basket can listen to it (Firestore's rules know only
 * Firebase's sign-in, not the session cookie). Null without a session.
 */
export async function firebaseToken(): Promise<string | null> {
  const user = await getUser()
  if (!user) return null
  return adminAuth().createCustomToken(user.uid)
}
