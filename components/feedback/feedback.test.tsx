import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthErrorCodes as E } from "@/lib/auth/fireAuthError"
import { renderInEnglish } from "@/test/intl"

import { Feedback } from "./feedback"

const mocks = vi.hoisted(() => ({
  sendFeedback: vi.fn(),
  resetRecaptcha: vi.fn(),
}))

vi.mock("@/lib/feedback/actions", () => ({
  sendFeedback: mocks.sendFeedback,
}))
// Stands in for Google's box: a ticked box adds the same form field.
vi.mock("@/components/auth/recaptcha", async () => {
  const { useImperativeHandle } = await import("react")
  return {
    Recaptcha: ({ ref }: { ref?: React.Ref<{ reset(): void }> }) => {
      useImperativeHandle(ref, () => ({ reset: mocks.resetRecaptcha }))
      return <input type="hidden" name="g-recaptcha-response" value="token" />
    },
  }
})

beforeEach(() => mocks.sendFeedback.mockResolvedValue({ ok: true }))
afterEach(() => vi.clearAllMocks())

const message = "The countdown froze at midnight."

function renderForm(kind: "bug" | "feedback" | "costume" = "feedback") {
  return renderInEnglish(<Feedback kind={kind} recaptchaSiteKey="site-key" />)
}

describe("Feedback", () => {
  it("opens on the kind the link asked for", () => {
    renderForm("costume")
    expect(
      screen.getByRole("radio", { name: "Request a costume" })
    ).toBeChecked()
    expect(
      screen.getByLabelText("Which costume should we add?")
    ).toBeInTheDocument()
  })

  it("asks the question of the kind chosen", async () => {
    renderForm("feedback")
    expect(screen.getByLabelText("What's on your mind?")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("radio", { name: "Report a bug" }))
    const field = screen.getByLabelText("What went wrong?")
    expect(field).toHaveAccessibleDescription(
      expect.stringContaining(
        "What you did, what you expected, and what happened instead."
      )
    )
  })

  it("counts what is typed, up to 2,000 characters", async () => {
    renderForm()
    const field = screen.getByLabelText("What's on your mind?")
    expect(field).toHaveAttribute("maxlength", "2000")
    expect(screen.getByText("0 of 2,000 characters")).toBeInTheDocument()
    await userEvent.type(field, "Boo!")
    expect(screen.getByText("4 of 2,000 characters")).toBeInTheDocument()
  })

  it("names what is missing and starts at the message", async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText("Email"), "nope")
    await userEvent.click(screen.getByRole("button", { name: "Send" }))
    expect(await screen.findByText("Write your message.")).toBeInTheDocument()
    expect(
      screen.getByText("Enter a full email address, like you@example.com.")
    ).toBeInTheDocument()
    expect(screen.getByLabelText("What's on your mind?")).toHaveFocus()
    expect(mocks.sendFeedback).not.toHaveBeenCalled()
  })

  it("sends the kind, the message and the tick, then thanks", async () => {
    renderForm("feedback")
    await userEvent.click(screen.getByRole("radio", { name: "Report a bug" }))
    await userEvent.type(screen.getByLabelText("What went wrong?"), message)
    await userEvent.click(screen.getByRole("button", { name: "Send" }))

    const received = await screen.findByRole("heading", { name: "Received." })
    expect(received).toHaveFocus()
    expect(
      screen.getByText("Thank you. We read every message.")
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Send" })).toBeNull()
    expect(mocks.sendFeedback).toHaveBeenCalledWith(
      { kind: "bug", message, email: "", recaptcha: "token" },
      "en"
    )
  })

  it("brings back an empty form on the same kind", async () => {
    renderForm("feedback")
    await userEvent.click(
      screen.getByRole("radio", { name: "Request a costume" })
    )
    await userEvent.type(
      screen.getByLabelText("Which costume should we add?"),
      "The Babadook, please."
    )
    await userEvent.click(screen.getByRole("button", { name: "Send" }))
    await userEvent.click(
      await screen.findByRole("button", { name: "Send another" })
    )

    const field = screen.getByLabelText("Which costume should we add?")
    expect(field).toHaveValue("")
    await waitFor(() => expect(field).toHaveFocus())
    expect(
      screen.getByRole("radio", { name: "Request a costume" })
    ).toBeChecked()
  })

  it("says what the server refused, keeps the message and clears the tick", async () => {
    mocks.sendFeedback.mockResolvedValue({
      ok: false,
      error: E.TOO_MANY_MESSAGES,
    })
    renderForm()
    await userEvent.type(screen.getByLabelText("What's on your mind?"), message)
    await userEvent.click(screen.getByRole("button", { name: "Send" }))

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent(
      "You've sent several messages in the last hour. Wait a while, then try again."
    )
    expect(alert).toHaveFocus()
    expect(screen.getByLabelText("What's on your mind?")).toHaveValue(message)
    expect(mocks.resetRecaptcha).toHaveBeenCalled()
  })

  it("puts a failed robot check under the box", async () => {
    mocks.sendFeedback.mockResolvedValue({
      ok: false,
      fieldErrors: { recaptcha: E.ROBOT_CHECK_FAILED },
    })
    renderForm()
    await userEvent.type(screen.getByLabelText("What's on your mind?"), message)
    await userEvent.click(screen.getByRole("button", { name: "Send" }))
    expect(
      await screen.findByText(
        "The robot check didn't pass. Tick the box again."
      )
    ).toBeInTheDocument()
  })
})
