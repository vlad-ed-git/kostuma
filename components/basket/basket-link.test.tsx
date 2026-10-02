import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderWithBasket } from "@/test/basket"

import { BasketLink } from "./basket-link"
import { BasketToggle } from "./basket-toggle"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

describe("BasketLink", () => {
  it("is an unlit pumpkin, named, while the basket is empty", () => {
    const { container } = renderWithBasket(<BasketLink />)
    const link = screen.getByRole("link", { name: "My Pumpkin Basket" })
    expect(link).toHaveAttribute("href", "/basket")
    expect(container.querySelector("svg")).not.toHaveAttribute("data-lit")
    expect(link).toHaveTextContent(/^My Pumpkin Basket$/)
  })

  it("counts the costumes in its name and on the pumpkin", () => {
    const { container } = renderWithBasket(<BasketLink />, {
      stored: ["pearl", "ghostface", "carrie-white"],
    })
    const link = screen.getByRole("link", {
      name: "My Pumpkin Basket, 3 costumes",
    })
    expect(container.querySelector("svg")).toHaveAttribute("data-lit", "true")
    // The number is for the eyes; the name says it in words.
    const badge = link.querySelector(".tabular-nums")
    expect(badge).toHaveTextContent("3")
    expect(badge).toHaveAttribute("aria-hidden", "true")
  })

  it("says one costume, not one costumes", () => {
    renderWithBasket(<BasketLink />, { stored: ["pearl"] })
    expect(
      screen.getByRole("link", { name: "My Pumpkin Basket, 1 costume" })
    ).toBeInTheDocument()
  })

  it("ignites and rolls the count up when a costume is added anywhere", async () => {
    const { container } = renderWithBasket(
      <>
        <BasketLink />
        <BasketToggle slug="ghostface" name="Ghostface" />
      </>,
      { stored: ["pearl"] }
    )
    const pumpkin = () => container.querySelector("a svg")!
    expect(pumpkin()).not.toHaveClass("ignite")

    await userEvent.click(screen.getByRole("button"))
    expect(
      screen.getByRole("link", { name: "My Pumpkin Basket, 2 costumes" })
    ).toBeInTheDocument()
    expect(pumpkin()).toHaveClass("ignite")
    expect(container.querySelector(".basket-count-in")).toHaveTextContent("2")
    expect(container.querySelector(".basket-count-out")).toHaveTextContent("1")

    // Taken out: the count rolls down, nothing ignites.
    await userEvent.click(screen.getByRole("button"))
    expect(container.querySelector(".basket-count-in")).toHaveTextContent("1")
    expect(
      (
        container.querySelector(".basket-count-in") as HTMLElement
      ).style.getPropertyValue("--roll")
    ).toBe("-1")
  })
})
