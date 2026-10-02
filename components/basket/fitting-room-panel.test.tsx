import { render, screen } from "@testing-library/react"
import { NextIntlClientProvider } from "next-intl"
import { describe, expect, it, vi } from "vitest"

import messages from "@/messages/en.json"
import { renderInEnglish } from "@/test/intl"

import { FittingRoomPanel } from "./fitting-room-panel"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

describe("FittingRoomPanel", () => {
  it("says what it is, and its price", () => {
    renderInEnglish(<FittingRoomPanel />)
    const panel = screen.getByRole("region", { name: "The Fitting Room" })
    expect(panel).not.toHaveTextContent("Soon")
    expect(panel).toHaveTextContent("Premium")
    expect(panel).toHaveTextContent(
      "Try on the outfits in your basket, special-effects makeup included."
    )
    expect(panel).toHaveTextContent("2 free try-ons, then $5 per costume.")
    expect(screen.getByRole("link", { name: "Step inside" })).toHaveAttribute(
      "href",
      "/basket/fitting-room"
    )
  })

  it("writes the price the way the visitor's language does", () => {
    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <FittingRoomPanel />
      </NextIntlClientProvider>
    )
    expect(screen.getByText(/per costume/)).toHaveTextContent(
      /then 5\sUS\$ per costume/
    )
  })
})
