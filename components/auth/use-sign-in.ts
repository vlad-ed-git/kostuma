"use client"

import { useLocale } from "next-intl"
import { useEffect, useState } from "react"

import { startSession } from "@/lib/auth/actions"
import {
  prepareSignIn,
  signInWithGoogle,
  type BrowserSignIn,
} from "@/lib/auth/browser"
import { AuthErrorCodes } from "@/lib/auth/fireAuthError"

import type { FormState } from "@/components/form/fields"

/**
 * What every way of signing in shares: trading the browser's proof for the
 * server's session (which goes on to `next`), and, on a first sign-in, the
 * terms step before it.
 */
export function useSignIn(next: string) {
  const locale = useLocale()
  // The proof waiting on the terms step.
  const [termsFor, setTermsFor] = useState<string | null>(null)

  useEffect(() => prepareSignIn(), [])

  /** Starts the session; returns only when none was made. */
  async function finish(
    idToken: string,
    agreed = false
  ): Promise<FormState<unknown>> {
    const result = await startSession(idToken, next, locale, agreed)
    if ("needsTerms" in result) {
      setTermsFor(idToken)
      return {}
    }
    return { error: result.error }
  }

  /**
   * Opens Google's window. Call it in the click itself: browsers block a
   * window opened later. Hand what it returns to `afterGoogle`.
   */
  const openGoogle = () => signInWithGoogle(locale)

  async function afterGoogle(
    popup: Promise<BrowserSignIn>
  ): Promise<FormState<unknown>> {
    const signedIn = await popup
    if ("idToken" in signedIn) return finish(signedIn.idToken)
    // Closing the window is the visitor's choice, not a problem.
    return signedIn.error === AuthErrorCodes.POPUP_CLOSED
      ? {}
      : { error: signedIn.error }
  }

  return { locale, termsFor, finish, openGoogle, afterGoogle }
}
