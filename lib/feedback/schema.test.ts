import { describe, expect, it } from "vitest"

import { AuthErrorCodes as E } from "@/lib/auth/fireAuthError"
import { fieldErrorsOf } from "@/lib/auth/schemas"

import { feedbackSchema, kindOf, type FeedbackInput } from "./schema"

const valid: FeedbackInput = {
  kind: "costume",
  message: "Please add the Babadook.",
  email: "",
  recaptcha: "token",
}

const errorsOf = (input: Partial<FeedbackInput>) => {
  const result = feedbackSchema.safeParse({ ...valid, ...input })
  return result.success ? {} : fieldErrorsOf(result.error)
}

describe("kindOf", () => {
  it.each(["bug", "feedback", "costume"])("takes %s from a link", (type) => {
    expect(kindOf(type)).toBe(type)
  })

  it.each([undefined, "", "BUG", "other", ["bug"], 1])(
    "falls back to feedback for %j",
    (type) => {
      expect(kindOf(type)).toBe("feedback")
    }
  )
})

describe("feedbackSchema", () => {
  it("takes a message without an email", () => {
    expect(feedbackSchema.parse(valid)).toEqual(valid)
  })

  it("trims the message and the email", () => {
    const parsed = feedbackSchema.parse({
      ...valid,
      message: "  The countdown froze.  \n",
      email: " carrie@example.com ",
    })
    expect(parsed.message).toBe("The countdown froze.")
    expect(parsed.email).toBe("carrie@example.com")
  })

  it.each([
    ["", E.MESSAGE_REQUIRED],
    ["   \n  ", E.MESSAGE_REQUIRED],
    ["Too short", E.MESSAGE_TOO_SHORT],
    ["x".repeat(2001), E.MESSAGE_TOO_LONG],
  ])("names a message's problem (%j)", (message, code) => {
    expect(errorsOf({ message })).toEqual({ message: code })
  })

  it("takes 10 and 2,000 characters, counted after trimming", () => {
    expect(errorsOf({ message: " 0123456789 " })).toEqual({})
    expect(errorsOf({ message: "x".repeat(2000) })).toEqual({})
  })

  it.each(["not-an-email", "a@b", `${"x".repeat(250)}@example.com`])(
    "refuses an email that isn't one (%s)",
    (email) => {
      expect(errorsOf({ email })).toEqual({ email: E.INVALID_EMAIL })
    }
  )

  it("asks for the robot check", () => {
    expect(errorsOf({ recaptcha: "" })).toEqual({
      recaptcha: E.ROBOT_CHECK_REQUIRED,
    })
  })

  it("refuses a kind the form doesn't offer, in a code", () => {
    expect(errorsOf({ kind: "complaint" as FeedbackInput["kind"] })).toEqual({
      kind: E.UNKNOWN_AUTH_ERROR,
    })
  })
})
