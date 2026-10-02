import { describe, expect, it } from "vitest"

import en from "@/messages/en.json"

import {
  AuthErrorCodes,
  authErrorOf,
  mapAuthErrorToEnum,
} from "./fireAuthError"

describe("mapAuthErrorToEnum", () => {
  it.each([
    [
      "Firebase: Error (auth/invalid-credential).",
      AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
    ],
    [
      "Firebase: Error (auth/email-already-in-use).",
      AuthErrorCodes.EMAIL_EXISTS,
    ],
    ["Firebase: Error (auth/invalid-email).", AuthErrorCodes.INVALID_EMAIL],
    // Never which of the two was wrong: that would reveal the account.
    [
      "Firebase: Error (auth/wrong-password).",
      AuthErrorCodes.INVALID_LOGIN_CREDENTIALS,
    ],
    [
      "Firebase: Error (auth/too-many-requests).",
      AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER,
    ],
    [
      "Firebase: Error (auth/email-change-needs-verification).",
      AuthErrorCodes.EMAIL_CHANGE_NEEDS_VERIFICATION,
    ],
    [
      "Firebase: Error (auth/network-request-failed).",
      AuthErrorCodes.NETWORK_ERROR,
    ],
  ])("maps %s", (message, code) => {
    expect(mapAuthErrorToEnum(message)).toBe(code)
  })

  it("reads the code inside messages worded differently", () => {
    expect(
      mapAuthErrorToEnum(
        "Firebase: Password should be at least 6 characters (auth/weak-password)."
      )
    ).toBe(AuthErrorCodes.WEAK_PASSWORD)
  })

  it("falls back to unknown for codes it does not know", () => {
    expect(mapAuthErrorToEnum("Firebase: Error (auth/brand-new).")).toBe(
      AuthErrorCodes.UNKNOWN_AUTH_ERROR
    )
  })

  it("falls back to unknown for text without a code", () => {
    expect(mapAuthErrorToEnum("Something odd")).toBe(
      AuthErrorCodes.UNKNOWN_AUTH_ERROR
    )
  })
})

describe("authErrorOf", () => {
  it("uses an Admin SDK error's code, whose message has none", () => {
    const error = Object.assign(
      new Error("The email address is already in use by another account."),
      { code: "auth/email-already-exists" }
    )
    expect(authErrorOf(error)).toBe(AuthErrorCodes.EMAIL_EXISTS)
  })

  it("falls back to the message when the code is unknown", () => {
    expect(
      authErrorOf({
        code: "app/other",
        message: "Firebase: Error (auth/invalid-email).",
      })
    ).toBe(AuthErrorCodes.INVALID_EMAIL)
  })

  it.each([null, undefined, "text", 42, {}])(
    "treats %s as unknown",
    (value) => {
      expect(authErrorOf(value)).toBe(AuthErrorCodes.UNKNOWN_AUTH_ERROR)
    }
  )
})

describe("messages", () => {
  it("has an English message for every code", () => {
    for (const code of Object.values(AuthErrorCodes)) {
      expect(en.AuthErrors[code], code).toEqual(expect.any(String))
    }
  })
})
