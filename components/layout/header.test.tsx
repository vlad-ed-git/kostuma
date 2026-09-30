import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { Header } from "./header"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

describe("Header", () => {
  it("leads home from the wordmark", () => {
    renderInEnglish(<Header />)
    expect(screen.getByRole("link", { name: "Kostuma" })).toHaveAttribute(
      "href",
      "/"
    )
  })

  it("lists the main sections, marking the ones still to come", () => {
    renderInEnglish(<Header />)
    const nav = screen.getByRole("navigation", { name: "Main" })
    const links = within(nav).getAllByRole("link")
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/costumes",
      "/try-on",
      "/pricing",
    ])
    expect(links.map((link) => link.textContent)).toEqual([
      "Costumes",
      "The MirrorSoon",
      "PricingSoon",
    ])
  })

  it("names the Pumpkin Basket, whose icon alone says nothing", () => {
    renderInEnglish(<Header />)
    expect(
      screen.getByRole("link", { name: "Pumpkin Basket" })
    ).toHaveAttribute("href", "/basket")
  })

  it("offers sign-in, the language and the menu", () => {
    renderInEnglish(<Header />)
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in"
    )
    expect(screen.getByLabelText("Language")).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Open the menu" })
    ).toBeInTheDocument()
  })
})
