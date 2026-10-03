import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { AuthErrorCodes as E } from "@/lib/auth/fireAuthError"
import { renderInEnglish } from "@/test/intl"

import { GetPro } from "./get-pro"

const mocks = vi.hoisted(() => ({
  joinWaitlist: vi.fn(),
  updateWaitlistEmail: vi.fn(),
}))

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
vi.mock("@/lib/waitlist/actions", () => ({
  joinWaitlist: mocks.joinWaitlist,
  updateWaitlistEmail: mocks.updateWaitlistEmail,
}))

const EMAIL = "wednesday@example.com"

beforeEach(() => {
  mocks.joinWaitlist.mockResolvedValue({ ok: true, email: EMAIL })
  mocks.updateWaitlistEmail.mockImplementation(async ({ email }) => ({
    ok: true,
    email: email.trim(),
  }))
})
afterEach(() => vi.clearAllMocks())

async function press() {
  renderInEnglish(<GetPro source="fitting-room" />)
  await userEvent.click(screen.getByRole("button", { name: "Get Kostuma Pro" }))
  return screen.findByRole("dialog", {
    name: "You have been added to the premium feature waitlist.",
  })
}

describe("GetPro", () => {
  it("puts the account on the waitlist, then says so in the owner's words, with its email", async () => {
    const popup = await press()
    expect(mocks.joinWaitlist).toHaveBeenCalledWith("fitting-room", "en")
    expect(popup).toHaveAccessibleDescription(
      "We will get back to you in 24 hours with an awesome deal."
    )
    expect(within(popup).getByLabelText("Email")).toHaveValue(EMAIL)
  })

  it("sends nothing when Update finds the same email", async () => {
    const popup = await press()
    await userEvent.click(within(popup).getByRole("button", { name: "Update" }))
    expect(mocks.updateWaitlistEmail).not.toHaveBeenCalled()
    expect(within(popup).getByRole("status")).toBeEmptyDOMElement()
  })

  it("keeps another email the visitor gives", async () => {
    const popup = await press()
    const field = within(popup).getByLabelText("Email")
    await userEvent.clear(field)
    await userEvent.type(field, "morticia@example.com")
    await userEvent.click(within(popup).getByRole("button", { name: "Update" }))
    expect(mocks.updateWaitlistEmail).toHaveBeenCalledWith(
      { email: "morticia@example.com" },
      "fitting-room",
      "en"
    )
    await waitFor(() =>
      expect(within(popup).getByRole("status")).toHaveTextContent(
        "Email updated."
      )
    )
    expect(field).toHaveValue("morticia@example.com")
    // The same again: nothing more to send.
    await userEvent.click(within(popup).getByRole("button", { name: "Update" }))
    expect(mocks.updateWaitlistEmail).toHaveBeenCalledTimes(1)
  })

  it("says what's wrong with an email the server refuses", async () => {
    mocks.updateWaitlistEmail.mockResolvedValue({
      ok: false,
      fieldErrors: { email: E.INVALID_EMAIL },
    })
    const popup = await press()
    const field = within(popup).getByLabelText("Email")
    await userEvent.clear(field)
    await userEvent.type(field, "not an email")
    await userEvent.click(within(popup).getByRole("button", { name: "Update" }))
    await waitFor(() => expect(field).toHaveAttribute("aria-invalid", "true"))
    expect(field).toHaveAccessibleDescription(
      "Enter a full email address, like you@example.com."
    )
  })

  it("closes, and opens again with the email on record", async () => {
    let popup = await press()
    await userEvent.click(within(popup).getByRole("button", { name: "Close" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    mocks.joinWaitlist.mockResolvedValue({
      ok: true,
      email: "morticia@example.com",
    })
    await userEvent.click(
      screen.getByRole("button", { name: "Get Kostuma Pro" })
    )
    popup = await screen.findByRole("dialog")
    expect(within(popup).getByLabelText("Email")).toHaveValue(
      "morticia@example.com"
    )
    expect(mocks.joinWaitlist).toHaveBeenCalledTimes(2)
  })

  it("says so when the session ended, without a pop-up", async () => {
    mocks.joinWaitlist.mockResolvedValue({ ok: false, error: "signed_out" })
    renderInEnglish(<GetPro source="account" />)
    await userEvent.click(
      screen.getByRole("button", { name: "Get Kostuma Pro" })
    )
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Your session ended. Sign in again to join the waitlist."
    )
    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("says something went wrong when the waitlist can't be reached", async () => {
    mocks.joinWaitlist.mockRejectedValue(new Error("offline"))
    renderInEnglish(<GetPro source="basket" />)
    await userEvent.click(
      screen.getByRole("button", { name: "Get Kostuma Pro" })
    )
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Something went wrong. Try again."
    )
  })

  it("leads a visitor signed out to sign in first", () => {
    renderInEnglish(<GetPro source="basket" signedIn={false} back="/basket" />)
    expect(
      screen.getByRole("link", { name: "Get Kostuma Pro" })
    ).toHaveAttribute("href", "/sign-in?next=%2Fbasket")
    expect(mocks.joinWaitlist).not.toHaveBeenCalled()
  })
})
