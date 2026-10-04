// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthErrorCodes as E } from "@/lib/auth/fireAuthError"

vi.mock("server-only", () => ({}))

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  addToWaitlist: vi.fn(),
  changeWaitlistEmail: vi.fn(),
}))

vi.mock("@/lib/auth/session", () => ({ getUser: mocks.getUser }))
vi.mock("@/lib/waitlist/store", () => ({
  addToWaitlist: mocks.addToWaitlist,
  changeWaitlistEmail: mocks.changeWaitlistEmail,
}))

const { joinWaitlist, updateWaitlistEmail } = await import("./actions")

const user = {
  uid: "u1",
  name: "Wednesday",
  email: "wednesday@example.com",
  emailVerified: true,
}

beforeEach(() => {
  mocks.getUser.mockResolvedValue(user)
  mocks.addToWaitlist.mockImplementation(async (entry) => entry.email)
  mocks.changeWaitlistEmail.mockImplementation(async (entry) => entry.email)
  vi.spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe("joinWaitlist", () => {
  it("puts the signed-in account on the waitlist with its email", async () => {
    expect(await joinWaitlist("basket", "es")).toEqual({
      ok: true,
      email: user.email,
    })
    expect(mocks.addToWaitlist).toHaveBeenCalledWith({
      uid: "u1",
      email: user.email,
      accountEmail: user.email,
      emailVerified: true,
      locale: "es",
      source: "basket",
    })
  })

  it("never marks an unverified account's email verified", async () => {
    mocks.getUser.mockResolvedValue({ ...user, emailVerified: false })
    await joinWaitlist("basket", "en")
    expect(mocks.addToWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ emailVerified: false })
    )
  })

  it("gives the email on record when the account is on it already", async () => {
    mocks.addToWaitlist.mockResolvedValue("morticia@example.com")
    expect(await joinWaitlist("account", "en")).toEqual({
      ok: true,
      email: "morticia@example.com",
    })
  })

  it("keeps the site's language only when it is one", async () => {
    await joinWaitlist("fitting-room", "fr")
    expect(mocks.addToWaitlist).toHaveBeenCalledWith(
      expect.objectContaining({ locale: "en" })
    )
  })

  it("refuses a visitor signed out", async () => {
    mocks.getUser.mockResolvedValue(null)
    expect(await joinWaitlist("basket", "en")).toEqual({
      ok: false,
      error: "signed_out",
    })
    expect(mocks.addToWaitlist).not.toHaveBeenCalled()
  })

  it("refuses a place it doesn't know", async () => {
    expect(
      await joinWaitlist("elsewhere" as unknown as "basket", "en")
    ).toEqual({ ok: false, error: "unknown" })
    expect(mocks.addToWaitlist).not.toHaveBeenCalled()
  })

  it("says something went wrong when the waitlist can't be written", async () => {
    mocks.addToWaitlist.mockRejectedValue(new Error("unavailable"))
    expect(await joinWaitlist("basket", "en")).toEqual({
      ok: false,
      error: "unknown",
    })
  })
})

describe("updateWaitlistEmail", () => {
  it("keeps the email the visitor gives, trimmed", async () => {
    expect(
      await updateWaitlistEmail(
        { email: "  morticia@example.com " },
        "account",
        "zh"
      )
    ).toEqual({ ok: true, email: "morticia@example.com" })
    expect(mocks.changeWaitlistEmail).toHaveBeenCalledWith({
      uid: "u1",
      email: "morticia@example.com",
      accountEmail: user.email,
      // Not the account's own: unconfirmed.
      emailVerified: false,
      locale: "zh",
      source: "account",
    })
  })

  it("keeps the account's own verified email verified", async () => {
    await updateWaitlistEmail({ email: user.email }, "account", "en")
    expect(mocks.changeWaitlistEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: user.email, emailVerified: true })
    )
  })

  it.each([
    ["", E.EMAIL_REQUIRED],
    ["   ", E.EMAIL_REQUIRED],
    ["not an email", E.INVALID_EMAIL],
    [`${"a".repeat(250)}@example.com`, E.INVALID_EMAIL],
  ])("refuses %j with %s", async (email, code) => {
    expect(await updateWaitlistEmail({ email }, "basket", "en")).toEqual({
      ok: false,
      fieldErrors: { email: code },
    })
    expect(mocks.changeWaitlistEmail).not.toHaveBeenCalled()
  })

  it("refuses a visitor signed out", async () => {
    mocks.getUser.mockResolvedValue(null)
    expect(
      await updateWaitlistEmail(
        { email: "morticia@example.com" },
        "basket",
        "en"
      )
    ).toEqual({ ok: false, error: "signed_out" })
  })

  it("says something went wrong when the waitlist can't be written", async () => {
    mocks.changeWaitlistEmail.mockRejectedValue(new Error("unavailable"))
    expect(
      await updateWaitlistEmail(
        { email: "morticia@example.com" },
        "basket",
        "en"
      )
    ).toEqual({ ok: false, error: "unknown" })
  })
})
