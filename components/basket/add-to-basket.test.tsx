import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { announced, renderWithBasket, storedSlugs } from "@/test/basket"

import { AddToBasket } from "./add-to-basket"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

describe("AddToBasket", () => {
  it("adds the costume, then leads to the basket, keeping the visitor's place", async () => {
    renderWithBasket(<AddToBasket slug="pearl" name="Pearl" />)
    await userEvent.click(
      screen.getByRole("button", { name: "Add to My Pumpkin Basket" })
    )
    expect(storedSlugs()).toEqual(["pearl"])
    const link = screen.getByRole("link", { name: "In My Pumpkin Basket" })
    expect(link).toHaveAttribute("href", "/basket")
    expect(link).toHaveFocus()
    expect(link.querySelector("svg")).toHaveClass("ignite")
    expect(announced()).toBe("Pearl added to My Pumpkin Basket.")
  })

  it("never moves the visitor's focus for a change made in another tab", async () => {
    renderWithBasket(<AddToBasket slug="pearl" name="Pearl" />)
    await userEvent.click(screen.getByRole("button"))
    const other = () =>
      act(() => {
        localStorage.setItem(
          "kostuma.basket",
          JSON.stringify({ v: 1, slugs: storedSlugs().length ? [] : ["pearl"] })
        )
        window.dispatchEvent(
          new StorageEvent("storage", { key: "kostuma.basket" })
        )
      })
    other() // Taken out over there,
    screen.getByRole("button").focus()
    other() // and put back.
    expect(screen.getByRole("link")).not.toHaveFocus()
  })

  it("is already the way to the basket when the costume is in it", () => {
    renderWithBasket(<AddToBasket slug="pearl" name="Pearl" />, {
      stored: ["pearl"],
    })
    const link = screen.getByRole("link", { name: "In My Pumpkin Basket" })
    expect(link).not.toHaveFocus()
    expect(link.querySelector("svg")).not.toHaveClass("ignite")
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
