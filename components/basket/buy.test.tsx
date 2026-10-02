import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { Buy } from "./buy"

const spirit = {
  name: "Spirit Halloween",
  url: "https://shop.example/ghostface",
}
const party = {
  name: "Party City",
  url: "https://party.example/ghostface",
  affiliate: true,
}

describe("Buy", () => {
  it("says Soon, and offers nothing to press, while a costume has no shop", () => {
    renderInEnglish(<Buy name="Ghostface" shops={[]} />)
    expect(screen.getByText("Soon")).toBeInTheDocument()
    expect(screen.queryByRole("link")).toBeNull()
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("opens the shop in a new tab, and says so", () => {
    renderInEnglish(<Buy name="Ghostface" shops={[spirit]} />)
    const link = screen.getByRole("link", {
      name: "Buy Ghostface (opens in a new tab)",
    })
    expect(link).toHaveAttribute("href", spirit.url)
    expect(link).toHaveAttribute("target", "_blank")
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow")
  })

  it("marks an affiliate link as sponsored", () => {
    renderInEnglish(<Buy name="Ghostface" shops={[party]} />)
    expect(screen.getByRole("link")).toHaveAttribute(
      "rel",
      "noopener noreferrer nofollow sponsored"
    )
  })

  it("offers a menu of the shops when there are several", async () => {
    renderInEnglish(<Buy name="Ghostface" shops={[spirit, party]} />)
    await userEvent.click(
      screen.getByRole("button", { name: "Buy Ghostface: choose a shop" })
    )
    const items = await screen.findAllByRole("menuitem")
    expect(items.map((item) => item.textContent)).toEqual([
      "Buy at Spirit Halloween",
      "Buy at Party City",
    ])
    expect(items[0]).toHaveAccessibleName(
      "Buy at Spirit Halloween (opens in a new tab)"
    )
    expect(items[1]).toHaveAttribute("href", party.url)
    expect(items[1]).toHaveAttribute("target", "_blank")
    expect(items[1]).toHaveAttribute(
      "rel",
      "noopener noreferrer nofollow sponsored"
    )
  })
})
