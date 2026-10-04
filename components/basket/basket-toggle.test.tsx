import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { announced, renderWithBasket, storedSlugs } from "@/test/basket"

import { BasketToggle } from "./basket-toggle"

describe("BasketToggle", () => {
  it("puts the costume in My Pumpkin Basket, and lights the pumpkin", async () => {
    const { container } = renderWithBasket(
      <BasketToggle slug="ghostface" name="Ghostface" />
    )
    const svg = () => container.querySelector("svg")!
    expect(svg()).not.toHaveAttribute("data-lit")

    await userEvent.click(
      screen.getByRole("button", { name: "Add Ghostface to My Pumpkin Basket" })
    )
    expect(storedSlugs()).toEqual(["ghostface"])
    expect(svg()).toHaveAttribute("data-lit", "true")
    expect(svg()).toHaveClass("ignite")
    expect(announced()).toBe("Ghostface added to My Pumpkin Basket.")
  })

  it("takes it out again", async () => {
    const { container } = renderWithBasket(
      <BasketToggle slug="ghostface" name="Ghostface" />,
      { stored: ["ghostface"] }
    )
    // Already in: lit, but not igniting (nothing was just added).
    expect(container.querySelector("svg")).toHaveAttribute("data-lit", "true")
    expect(container.querySelector("svg")).not.toHaveClass("ignite")

    await userEvent.click(
      screen.getByRole("button", {
        name: "Remove Ghostface from My Pumpkin Basket",
      })
    )
    expect(storedSlugs()).toEqual([])
    expect(
      screen.getByRole("button", { name: "Add Ghostface to My Pumpkin Basket" })
    ).toBeInTheDocument()
    expect(announced()).toBe("Ghostface removed from My Pumpkin Basket.")
  })

  it("announces again when the same thing happens twice", async () => {
    renderWithBasket(<BasketToggle slug="pearl" name="Pearl" />)
    const toggle = screen.getByRole("button")
    await userEvent.click(toggle)
    const first = document.querySelector("[aria-live] p")
    await userEvent.click(toggle)
    await userEvent.click(toggle)
    // A new node each time: screen readers hear it again.
    expect(document.querySelector("[aria-live] p")).not.toBe(first)
    expect(announced()).toBe("Pearl added to My Pumpkin Basket.")
  })

  it("shows its name over the pumpkin, for eyes only: screen readers hear the button's", async () => {
    const { container } = renderWithBasket(
      <BasketToggle slug="ghostface" name="Ghostface" />
    )
    const tip = () => container.querySelector('span[aria-hidden="true"]')!
    expect(tip()).toHaveTextContent("Add to My Pumpkin Basket")
    expect(tip().className).toContain("group-hover/toggle:opacity-100")
    expect(tip().className).toContain("group-focus-visible/toggle:opacity-100")
    await userEvent.click(
      screen.getByRole("button", { name: "Add Ghostface to My Pumpkin Basket" })
    )
    expect(tip()).toHaveTextContent("Remove from My Pumpkin Basket")
    // Brighter at rest than the muted text around it.
    expect(
      screen.getByRole("button", {
        name: "Remove Ghostface from My Pumpkin Basket",
      }).className
    ).toContain("text-foreground/80")
  })

  it("is hidden without JavaScript, where it could do nothing", () => {
    renderWithBasket(<BasketToggle slug="pearl" name="Pearl" />)
    expect(screen.getByRole("button")).toHaveClass(
      "[@media(scripting:none)]:hidden"
    )
  })

  it("is a 48 px target", () => {
    renderWithBasket(<BasketToggle slug="pearl" name="Pearl" />)
    expect(screen.getByRole("button")).toHaveClass("size-12")
  })
})
