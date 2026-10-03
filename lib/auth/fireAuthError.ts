/**
 * Every problem a form can meet (the account forms and the feedback form),
 * as stable codes: Firebase Auth's failures, the server's, and each form
 * field's rule. Each value is also the
 * key of its message under `AuthErrors` in `messages/*.json`, so the UI
 * shows `t(\`AuthErrors.${code}\`)`: a visitor never reads an error's own
 * text, in any language.
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
  // Google's window.
  POPUP_CLOSED = "popup_closed",
  POPUP_BLOCKED = "popup_blocked",
  ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL = "account_exists_with_different_credential",
  USER_DISABLED = "user_disabled",
  // The server's.
  SIGN_IN_AGAIN = "sign_in_again",
  ROBOT_CHECK_FAILED = "robot_check_failed",
  ACCOUNT_READY = "account_ready",
  // The forms' rules.
  NAME_REQUIRED = "name_required",
  NAME_TOO_LONG = "name_too_long",
  EMAIL_REQUIRED = "email_required",
  PASSWORD_REQUIRED = "password_required",
  PASSWORD_TOO_SHORT = "password_too_short",
  PASSWORD_TOO_LONG = "password_too_long",
  CONFIRM_REQUIRED = "confirm_required",
  PASSWORDS_DIFFER = "passwords_differ",
  TERMS_REQUIRED = "terms_required",
  ROBOT_CHECK_REQUIRED = "robot_check_required",
  // The feedback form's.
  MESSAGE_REQUIRED = "message_required",
  MESSAGE_TOO_SHORT = "message_too_short",
  MESSAGE_TOO_LONG = "message_too_long",
  TOO_MANY_MESSAGES = "too_many_messages",
}

// Firebase's `auth/…` codes. The browser SDK and the Admin SDK name some
// problems differently; both are listed.
const byFirebaseCode: Record<string, AuthErrorCodes> = {
  "auth/email-change-needs-verification":
    AuthErrorCodes.EMAIL_CHANGE_NEEDS_VERIFICATION,
  "auth/email-already-in-use": AuthErrorCodes.EMAIL_EXISTS,
  "auth/email-already-exists": AuthErrorCodes.EMAIL_EXISTS,
  "auth/invalid-email": AuthErrorCodes.INVALID_EMAIL,
  // Signing in never says which of the email or the password was wrong:
  // that would tell anyone whether an account uses an email.
  "auth/wrong-password": AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
  "auth/too-many-requests": AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER,
  "auth/weak-password": AuthErrorCodes.WEAK_PASSWORD,
  "auth/password-does-not-meet-requirements": AuthErrorCodes.WEAK_PASSWORD,
  // Admin SDK: a password of fewer than 6 characters.
  "auth/invalid-password": AuthErrorCodes.WEAK_PASSWORD,
  "auth/invalid-credential": AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
  "auth/invalid-login-credentials": AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
  "auth/user-not-found": AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
  "auth/network-request-failed": AuthErrorCodes.NETWORK_ERROR,
  "auth/popup-closed-by-user": AuthErrorCodes.POPUP_CLOSED,
  "auth/cancelled-popup-request": AuthErrorCodes.POPUP_CLOSED,
  "auth/user-cancelled": AuthErrorCodes.POPUP_CLOSED,
  "auth/popup-blocked": AuthErrorCodes.POPUP_BLOCKED,
  "auth/account-exists-with-different-credential":
    AuthErrorCodes.ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL,
  "auth/user-disabled": AuthErrorCodes.USER_DISABLED,
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
