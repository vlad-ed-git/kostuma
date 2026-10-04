import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { FittingRoomPanel } from "./fitting-room-panel"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
vi.mock("@/lib/waitlist/actions", () => ({
  joinWaitlist: vi.fn(),
  updateWaitlistEmail: vi.fn(),
}))

describe("FittingRoomPanel", () => {
  it("says what it is and that one costume is free, with no price and no badge", () => {
    renderInEnglish(<FittingRoomPanel signedIn source="basket" />)
    const panel = screen.getByRole("region", { name: "The Fitting Room" })
    expect(panel).toHaveTextContent(
      "Try on the outfits in your basket, then see the character's makeup on your own face, step by step."
    )
    expect(panel).toHaveTextContent("One costume is free with every account.")
    expect(panel).not.toHaveTextContent(/\$|premium|per costume/i)
    expect(screen.getByRole("link", { name: "Step inside" })).toHaveAttribute(
      "href",
      "/basket/fitting-room"
    )
    expect(
      screen.getByRole("button", { name: "Get Kostuma Pro" })
    ).toBeInTheDocument()
  })

  it("asks a visitor signed out to sign in for Kostuma Pro, then come back", () => {
    renderInEnglish(<FittingRoomPanel signedIn={false} source="basket" />)
    expect(
      screen.getByRole("link", { name: "Get Kostuma Pro" })
    ).toHaveAttribute("href", "/sign-in?next=%2Fbasket")
  })

  it("tells an account whether its free costume is still waiting", () => {
    const { rerender } = renderInEnglish(
      <FittingRoomPanel signedIn free source="account" />
    )
    expect(screen.getByText("Your free costume is waiting.")).toBeVisible()
    rerender(<FittingRoomPanel signedIn free={false} source="account" />)
    expect(screen.getByText("You've used your free costume.")).toBeVisible()
  })
})
