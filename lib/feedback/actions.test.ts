// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthErrorCodes as E } from "@/lib/auth/fireAuthError"

import type { FeedbackInput } from "./schema"

vi.mock("server-only", () => ({}))

const mocks = vi.hoisted(() => ({
  verifyRecaptcha: vi.fn(),
  getUser: vi.fn(),
  headers: vi.fn(),
  withinLimit: vi.fn(),
  sweepRateLimits: vi.fn(),
  saveFeedback: vi.fn(),
  // Work left for after the answer, run by `answerSent`.
  afterwards: [] as (() => Promise<unknown>)[],
}))

vi.mock("@/lib/auth/recaptcha", () => ({
  verifyRecaptcha: mocks.verifyRecaptcha,
}))
vi.mock("@/lib/auth/session", () => ({ getUser: mocks.getUser }))
vi.mock("next/headers", () => ({ headers: mocks.headers }))
vi.mock("next/server", async (original) => ({
  ...(await original<typeof import("next/server")>()),
  after: (task: () => Promise<unknown>) => mocks.afterwards.push(task),
}))
vi.mock("@/lib/rate-limit", async (original) => ({
  ...(await original<typeof import("@/lib/rate-limit")>()),
  withinLimit: mocks.withinLimit,
  sweepRateLimits: mocks.sweepRateLimits,
}))
vi.mock("./store", () => ({ saveFeedback: mocks.saveFeedback }))

const { sendFeedback } = await import("./actions")

async function answerSent() {
  await Promise.all(mocks.afterwards.splice(0).map((task) => task()))
}

const iPhone =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"

const input: FeedbackInput = {
  kind: "bug",
  message: "  The countdown froze at midnight.  ",
  email: "",
  recaptcha: "token",
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  mocks.verifyRecaptcha.mockResolvedValue(true)
  mocks.getUser.mockResolvedValue(null)
  mocks.headers.mockResolvedValue(
    new Headers({ "user-agent": iPhone, "x-real-ip": "203.0.113.7" })
  )
  mocks.withinLimit.mockResolvedValue(true)
  mocks.sweepRateLimits.mockResolvedValue(undefined)
  mocks.saveFeedback.mockResolvedValue(undefined)
})
afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
  mocks.afterwards.length = 0
})

describe("sendFeedback", () => {
  it("keeps the message, trimmed, with what the request says about the device", async () => {
    expect(await sendFeedback(input, "es")).toEqual({ ok: true })
    expect(mocks.saveFeedback).toHaveBeenCalledWith({
      kind: "bug",
      message: "The countdown froze at midnight.",
      email: null,
      uid: null,
      locale: "es",
      device: "mobile",
      os: "iOS",
      browser: "Mobile Safari",
    })
  })

  it("keeps an email given for a reply, and the account when signed in", async () => {
    mocks.getUser.mockResolvedValue({
      uid: "u1",
      name: "Laurie",
      email: "laurie@example.com",
    })
    await sendFeedback({ ...input, email: "carrie@example.com" }, "en")
    expect(mocks.saveFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ email: "carrie@example.com", uid: "u1" })
    )
  })

  it("counts a signed-in sender by account, others by connection", async () => {
    await sendFeedback(input, "en")
    expect(mocks.withinLimit).toHaveBeenLastCalledWith(
      { name: "feedback", max: 5, windowMs: 3_600_000 },
      "address:203.0.113.7"
    )

    mocks.getUser.mockResolvedValue({ uid: "u1", name: "", email: "" })
    await sendFeedback(input, "en")
    expect(mocks.withinLimit).toHaveBeenLastCalledWith(
      expect.anything(),
      "account:u1"
    )
  })

  it("counts every sender without an address together", async () => {
    mocks.headers.mockResolvedValue(new Headers())
    await sendFeedback(input, "en")
    expect(mocks.withinLimit).toHaveBeenLastCalledWith(
      expect.anything(),
      "address:unknown"
    )
    // No user agent: nothing known about the device.
    expect(mocks.saveFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ device: null, os: null, browser: null })
    )
  })

  it("never keeps the address or the raw user agent", async () => {
    await sendFeedback(input, "en")
    const kept = JSON.stringify(mocks.saveFeedback.mock.calls[0][0])
    expect(kept).not.toContain("203.0.113.7")
    expect(kept).not.toContain("Mozilla")
  })

  it("answers an invalid form field by field, asking nothing of Google", async () => {
    expect(
      await sendFeedback({ ...input, message: "short", recaptcha: "" }, "en")
    ).toEqual({
      ok: false,
      fieldErrors: {
        message: E.MESSAGE_TOO_SHORT,
        recaptcha: E.ROBOT_CHECK_REQUIRED,
      },
    })
    expect(mocks.verifyRecaptcha).not.toHaveBeenCalled()
    expect(mocks.saveFeedback).not.toHaveBeenCalled()
  })

  it("refuses a failed robot check before it uses up a turn", async () => {
    mocks.verifyRecaptcha.mockResolvedValue(false)
    expect(await sendFeedback(input, "en")).toEqual({
      ok: false,
      fieldErrors: { recaptcha: E.ROBOT_CHECK_FAILED },
    })
    expect(mocks.withinLimit).not.toHaveBeenCalled()
    expect(mocks.saveFeedback).not.toHaveBeenCalled()
  })

  it("stops a sender over the limit, keeping nothing", async () => {
    mocks.withinLimit.mockResolvedValue(false)
    expect(await sendFeedback(input, "en")).toEqual({
      ok: false,
      error: E.TOO_MANY_MESSAGES,
    })
    expect(mocks.saveFeedback).not.toHaveBeenCalled()
  })

  it("says something went wrong when the message can't be kept", async () => {
    mocks.saveFeedback.mockRejectedValue(new Error("unavailable"))
    expect(await sendFeedback(input, "en")).toEqual({
      ok: false,
      error: E.UNKNOWN_AUTH_ERROR,
    })
    expect(console.error).toHaveBeenCalled()
  })

  it("takes English for a language the site doesn't have", async () => {
    await sendFeedback(input, "fr")
    expect(mocks.saveFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ locale: "en" })
    )
  })

  it("sweeps spent limits after answering, never failing the send", async () => {
    mocks.sweepRateLimits.mockRejectedValue(new Error("unavailable"))
    expect(await sendFeedback(input, "en")).toEqual({ ok: true })
    expect(mocks.sweepRateLimits).not.toHaveBeenCalled()
    await answerSent()
    expect(mocks.sweepRateLimits).toHaveBeenCalledTimes(1)
    expect(console.error).toHaveBeenCalledWith(
      "Could not sweep the rate limits.",
      expect.any(Error)
    )
  })
})
