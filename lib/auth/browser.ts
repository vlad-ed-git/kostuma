import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth"

import { clientAuth } from "@/lib/firebase/client"

import { AuthErrorCodes, authErrorOf } from "./fireAuthError"

/**
 * Signing in in the browser, with Firebase. Only the account pages import
 * this: other pages never download Firebase. Each gives the ID token the
 * server trades for a session (`startSession`), or the code of what went
 * wrong.
 */
export type BrowserSignIn = { idToken: string } | { error: AuthErrorCodes }

/** Gets Firebase and Google's window ready while the page shows. */
export function prepareSignIn() {
  try {
    clientAuth({ popups: true })
  } catch (error) {
    // Not configured: the forms say something went wrong when used.
    console.error(error)
  }
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<BrowserSignIn> {
  try {
    const { user } = await signInWithEmailAndPassword(
      clientAuth(),
      email,
      password
    )
    return { idToken: await user.getIdToken() }
  } catch (error) {
    return { error: authErrorOf(error) }
  }
}

/**
 * Google's window. Call it straight from the click, before any `await`:
 * browsers block a window opened later.
 */
export async function signInWithGoogle(locale: string): Promise<BrowserSignIn> {
  try {
    const auth = clientAuth({ popups: true })
    // Google's window speaks the page's language.
    auth.languageCode = locale
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    const { user } = await signInWithPopup(
      auth,
      provider,
      browserPopupRedirectResolver
    )
    return { idToken: await user.getIdToken() }
  } catch (error) {
    return { error: authErrorOf(error) }
  }
}

/**
 * Sends a reset link. Says nothing about whether an account uses the email:
 * only problems the visitor can fix (a malformed email, no connection, too
 * many tries) come back.
 */
export async function sendResetLink(
  email: string,
  locale: string
): Promise<AuthErrorCodes | null> {
  try {
    const auth = clientAuth()
    auth.languageCode = locale
    await sendPasswordResetEmail(auth, email)
    return null
  } catch (error) {
    const problem = authErrorOf(error)
    return problem === AuthErrorCodes.INVALID_LOGIN_CREDENTIALS ? null : problem
  }
}
