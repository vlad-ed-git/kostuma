import type * as Browser from "./browser"
import { AuthErrorCodes } from "./fireAuthError"

/**
 * Signing in in the e2e test build only (E2E=1, see next.config.ts): no
 * Firebase. Every password is wrong, Google's window is blocked, and a reset
 * link always "goes out", so the tests see each answer the forms give. The
 * real ones run against the emulators (`npm run test:emulators`).
 */

export type BrowserSignIn = Browser.BrowserSignIn

export const prepareSignIn: typeof Browser.prepareSignIn = () => {}

export const signInWithPassword: typeof Browser.signInWithPassword =
  async () => ({ error: AuthErrorCodes.INVALID_LOGIN_CREDENTIALS })

export const signInWithGoogle: typeof Browser.signInWithGoogle = async () => ({
  error: AuthErrorCodes.POPUP_BLOCKED,
})

export const sendResetLink: typeof Browser.sendResetLink = async () => null
