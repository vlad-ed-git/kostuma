import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { SignOutButton } from "./sign-out-button"
import { UserMenu } from "./user-menu"

const endSession = vi.hoisted(() => vi.fn())
vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
vi.mock("@/lib/auth/actions", () => ({ endSession }))

describe("UserMenu", () => {
  it("shows the initials, and opens the account and Sign out", async () => {
    renderInEnglish(
      <UserMenu name="Wednesday Addams" email="wednesday@example.com" />
    )
    const trigger = screen.getByRole("button", { name: "Your account" })
    expect(trigger).toHaveTextContent("WA")
    await userEvent.click(trigger)
    expect(await screen.findByRole("menu")).toHaveTextContent(
      "wednesday@example.com"
    )
    expect(screen.getByRole("menuitem", { name: "Account" })).toHaveAttribute(
      "href",
      "/account"
    )
    await userEvent.click(screen.getByRole("menuitem", { name: "Sign out" }))
    await waitFor(() => expect(endSession).toHaveBeenCalledWith("en"))
  })
})

describe("SignOutButton", () => {
  it("is a form, so it works before the page's scripts load", () => {
    const { container } = renderInEnglish(<SignOutButton />)
    expect(container.querySelector("form")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveAttribute(
      "type",
      "submit"
    )
  })
})
