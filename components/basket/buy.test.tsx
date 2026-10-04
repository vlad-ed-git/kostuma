import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { Buy } from "./buy"

const amazon = {
  name: "Amazon",
  url: "https://www.amazon.com/s?k=Ghostface+costume",
}
const etsy = {
  name: "Etsy",
  url: "https://www.etsy.com/search?q=Ghostface",
}

describe("Buy", () => {
  it("opens the one shop in a new tab, and says so", () => {
    renderInEnglish(<Buy name="Ghostface" shops={[amazon]} />)
    const link = screen.getByRole("link", {
      name: "Buy Ghostface (opens in a new tab)",
    })
    expect(link).toHaveAttribute("href", amazon.url)
    expect(link).toHaveAttribute("target", "_blank")
    // Another site, never one Kostuma is paid to send visitors to.
    expect(link).toHaveAttribute("rel", "noopener noreferrer nofollow")
  })

  it("offers a menu of the shops when there are several", async () => {
    renderInEnglish(<Buy name="Ghostface" shops={[amazon, etsy]} />)
    await userEvent.click(
      screen.getByRole("button", { name: "Buy Ghostface: choose a shop" })
    )
    const items = await screen.findAllByRole("menuitem")
    expect(items.map((item) => item.textContent)).toEqual([
      "Buy at Amazon",
      "Buy at Etsy",
    ])
    expect(items[0]).toHaveAccessibleName("Buy at Amazon (opens in a new tab)")
    expect(items[1]).toHaveAttribute("href", etsy.url)
    expect(items[1]).toHaveAttribute("target", "_blank")
    expect(items[1]).toHaveAttribute("rel", "noopener noreferrer nofollow")
  })
})
