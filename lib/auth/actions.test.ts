// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthErrorCodes as E } from "./fireAuthError"

vi.mock("server-only", () => ({}))

const now = () => Math.floor(Date.now() / 1000)

const mocks = vi.hoisted(() => ({
  auth: {
    verifyIdToken: vi.fn(),
    getUser: vi.fn(),
    createSessionCookie: vi.fn(),
    createUser: vi.fn(),
    deleteUser: vi.fn(),
    createCustomToken: vi.fn(),
  },
  hasProfile: vi.fn(),
  createProfile: vi.fn(),
  saveSession: vi.fn(),
  deleteSession: vi.fn(),
  getUser: vi.fn(),
  verifyRecaptcha: vi.fn(),
  redirect: vi.fn((target: unknown) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { target })
  }),
}))

vi.mock("@/lib/firebase/admin", () => ({ adminAuth: () => mocks.auth }))
vi.mock("@/lib/users", () => ({
  hasProfile: mocks.hasProfile,
  createProfile: mocks.createProfile,
}))
vi.mock("@/lib/auth/session", () => ({
  saveSession: mocks.saveSession,
  deleteSession: mocks.deleteSession,
  getUser: mocks.getUser,
  SESSION_SECONDS: 14 * 24 * 60 * 60,
}))
vi.mock("./recaptcha", () => ({ verifyRecaptcha: mocks.verifyRecaptcha }))
vi.mock("@/i18n/navigation", () => ({ redirect: mocks.redirect }))

const { endSession, firebaseToken, register, startSession } =
  await import("./actions")

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  mocks.auth.verifyIdToken.mockResolvedValue({ uid: "u1", auth_time: now() })
  mocks.auth.createSessionCookie.mockResolvedValue("cookie")
  mocks.auth.getUser.mockResolvedValue({
    uid: "u1",
    displayName: "Carrie White",
    email: "carrie@example.com",
  })
  mocks.hasProfile.mockResolvedValue(true)
  mocks.createProfile.mockResolvedValue(undefined)
})
afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

/** Runs an action that redirects on success: where it went. */
async function redirected(action: Promise<unknown>) {
  const error = await action.then(
    () => undefined,
    (thrown: { target?: unknown }) => thrown
  )
  return error?.target
}

describe("startSession", () => {
  it("trades a fresh sign-in for a session, then goes on in the language", async () => {
    expect(await redirected(startSession("token", "/basket", "es"))).toEqual({
      href: "/basket",
      locale: "es",
    })
    expect(mocks.auth.createSessionCookie).toHaveBeenCalledWith("token", {
      expiresIn: 14 * 24 * 60 * 60 * 1000,
    })
    expect(mocks.saveSession).toHaveBeenCalledWith("cookie")
  })

  it("never goes to another site, nor to a made-up language", async () => {
    expect(
      await redirected(startSession("token", "//evil.example", "xx"))
    ).toEqual({ href: "/", locale: "en" })
  })

  it("refuses a sign-in older than five minutes", async () => {
    mocks.auth.verifyIdToken.mockResolvedValue({
      uid: "u1",
      auth_time: now() - 6 * 60,
    })
    expect(await startSession("token", "/", "en")).toEqual({
      error: E.SIGN_IN_AGAIN,
    })
    expect(mocks.saveSession).not.toHaveBeenCalled()
  })

  it("asks a first sign-in to agree to the terms, making nothing yet", async () => {
    mocks.hasProfile.mockResolvedValue(false)
    expect(await startSession("token", "/", "en")).toEqual({
      needsTerms: true,
    })
    expect(mocks.createProfile).not.toHaveBeenCalled()
    expect(mocks.saveSession).not.toHaveBeenCalled()
  })

  it("makes the profile once the terms are agreed to", async () => {
    mocks.hasProfile.mockResolvedValue(false)
    await redirected(startSession("token", "/", "zh", true))
    expect(mocks.createProfile).toHaveBeenCalledWith({
      uid: "u1",
      name: "Carrie White",
      email: "carrie@example.com",
      locale: "zh",
    })
    expect(mocks.saveSession).toHaveBeenCalled()
  })

  it("takes a profile made a moment ago in another tab", async () => {
    mocks.hasProfile.mockResolvedValue(false)
    mocks.createProfile.mockRejectedValue(
      Object.assign(new Error(), { code: 6 })
    )
    expect(await redirected(startSession("token", "/", "en", true))).toEqual({
      href: "/",
      locale: "en",
    })
  })

  it("answers with a code, never the error, when Firebase fails", async () => {
    mocks.auth.verifyIdToken.mockRejectedValue(
      Object.assign(new Error("Firebase ID token has expired."), {
        code: "auth/id-token-expired",
      })
    )
    expect(await startSession("token", "/", "en")).toEqual({
      error: E.UNKNOWN_AUTH_ERROR,
    })
    expect(await startSession("", "/", "en")).toEqual({
      error: E.UNKNOWN_AUTH_ERROR,
    })
  })
})

describe("endSession", () => {
  it("forgets the session and goes home, in the language", async () => {
    expect(await redirected(endSession("es"))).toEqual({
      href: "/",
      locale: "es",
    })
    expect(mocks.deleteSession).toHaveBeenCalled()
  })
})

describe("register", () => {
  const input = {
    name: "Carrie White",
    email: "carrie@example.com",
    password: "prom night 1976",
    confirmPassword: "prom night 1976",
    terms: "on" as const,
    recaptcha: "token",
  }

  beforeEach(() => {
    mocks.verifyRecaptcha.mockResolvedValue(true)
    mocks.auth.createUser.mockResolvedValue({ uid: "u1" })
  })

  it("makes the account and its profile, in the visitor's language", async () => {
    expect(await register(input, "es")).toEqual({ ok: true })
    expect(mocks.auth.createUser).toHaveBeenCalledWith({
      email: "carrie@example.com",
      password: "prom night 1976",
      displayName: "Carrie White",
    })
    expect(mocks.createProfile).toHaveBeenCalledWith({
      uid: "u1",
      name: "Carrie White",
      email: "carrie@example.com",
      locale: "es",
    })
  })

  it("checks the form again: the browser can't be trusted", async () => {
    expect(await register({ ...input, terms: "" as "on" }, "en")).toEqual({
      ok: false,
      fieldErrors: { terms: E.TERMS_REQUIRED },
    })
    expect(mocks.verifyRecaptcha).not.toHaveBeenCalled()
  })

  it("makes nothing when the robot check fails", async () => {
    mocks.verifyRecaptcha.mockResolvedValue(false)
    expect(await register(input, "en")).toEqual({
      ok: false,
      fieldErrors: { recaptcha: E.ROBOT_CHECK_FAILED },
    })
    expect(mocks.auth.createUser).not.toHaveBeenCalled()
  })

  it("says an email is taken, on the email", async () => {
    mocks.auth.createUser.mockRejectedValue(
      Object.assign(new Error(), { code: "auth/email-already-exists" })
    )
    expect(await register(input, "en")).toEqual({
      ok: false,
      fieldErrors: { email: E.EMAIL_EXISTS },
    })
  })

  it("removes the account again when its profile can't be made", async () => {
    mocks.createProfile.mockRejectedValue(new Error("Firestore is down"))
    mocks.auth.deleteUser.mockResolvedValue(undefined)
    expect(await register(input, "en")).toEqual({
      ok: false,
      error: E.UNKNOWN_AUTH_ERROR,
    })
    expect(mocks.auth.deleteUser).toHaveBeenCalledWith("u1")
  })
})

describe("firebaseToken", () => {
  it("gives the session's account a token, and nobody else one", async () => {
    mocks.getUser.mockResolvedValue({ uid: "u1", name: "", email: "" })
    mocks.auth.createCustomToken.mockResolvedValue("custom")
    expect(await firebaseToken()).toBe("custom")
    expect(mocks.auth.createCustomToken).toHaveBeenCalledWith("u1")

    mocks.getUser.mockResolvedValue(null)
    expect(await firebaseToken()).toBeNull()
  })
})
