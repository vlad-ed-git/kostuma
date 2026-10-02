/**
 * Firebase Auth failures as stable codes. Each value is also the key of its
 * message under `AuthErrors` in `messages/*.json`, so the UI shows
 * `t(\`AuthErrors.${code}\`)`.
 */
export enum AuthErrorCodes {
  INVALID_LOGIN_CREDENTIALS = "invalid_login_credentials",
  EMAIL_CHANGE_NEEDS_VERIFICATION = "email_change_needs_verification",
  EMAIL_EXISTS = "email_exists",
  INVALID_EMAIL = "invalid_email",
  INVALID_PASSWORD = "invalid_password",
  TOO_MANY_ATTEMPTS_TRY_LATER = "too_many_attempts_try_later",
  WEAK_PASSWORD = "weak_password",
  UNKNOWN_AUTH_ERROR = "unknown_auth_error",
  NETWORK_ERROR = "network_error",
}

// Firebase's `auth/…` codes. The browser SDK and the Admin SDK name some
// problems differently; both are listed.
const byFirebaseCode: Record<string, AuthErrorCodes> = {
  "auth/email-change-needs-verification":
    AuthErrorCodes.EMAIL_CHANGE_NEEDS_VERIFICATION,
  "auth/email-already-in-use": AuthErrorCodes.EMAIL_EXISTS,
  "auth/email-already-exists": AuthErrorCodes.EMAIL_EXISTS,
  "auth/invalid-email": AuthErrorCodes.INVALID_EMAIL,
  "auth/wrong-password": AuthErrorCodes.INVALID_PASSWORD,
  "auth/too-many-requests": AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER,
  "auth/weak-password": AuthErrorCodes.WEAK_PASSWORD,
  "auth/password-does-not-meet-requirements": AuthErrorCodes.WEAK_PASSWORD,
  // Admin SDK: a password of fewer than 6 characters.
  "auth/invalid-password": AuthErrorCodes.WEAK_PASSWORD,
  "auth/invalid-credential": AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
  "auth/invalid-login-credentials": AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
  "auth/user-not-found": AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
  "auth/network-request-failed": AuthErrorCodes.NETWORK_ERROR,
}

/**
 * The code in a Firebase error message. Matches on the `auth/…` code, not the
 * whole text: messages vary, e.g. "Firebase: Error (auth/invalid-email)." but
 * "Firebase: Password should be at least 6 characters (auth/weak-password).".
 */
export function mapAuthErrorToEnum(errorMessage: string): AuthErrorCodes {
  const code = /auth\/[a-z0-9-]+/.exec(errorMessage)?.[0]
  return (code && byFirebaseCode[code]) || AuthErrorCodes.UNKNOWN_AUTH_ERROR
}

/**
 * The code of any caught error: its `code` property (Admin SDK messages do
 * not contain one), else its message.
 */
export function authErrorOf(error: unknown): AuthErrorCodes {
  if (typeof error !== "object" || error === null) {
    return AuthErrorCodes.UNKNOWN_AUTH_ERROR
  }
  if ("code" in error && typeof error.code === "string") {
    const known = byFirebaseCode[error.code]
    if (known) return known
  }
  return "message" in error && typeof error.message === "string"
    ? mapAuthErrorToEnum(error.message)
    : AuthErrorCodes.UNKNOWN_AUTH_ERROR
}
