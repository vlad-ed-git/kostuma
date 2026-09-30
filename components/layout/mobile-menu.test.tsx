import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { MobileMenu } from "./mobile-menu"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

async function openMenu() {
  const user = userEvent.setup()
  renderInEnglish(<MobileMenu />)
  const trigger = screen.getByRole("button", { name: "Open the menu" })
  await user.click(trigger)
  const dialog = await screen.findByRole("dialog", { name: "Menu" })
  return { user, trigger, dialog }
}

describe("MobileMenu", () => {
  it("is closed until the menu button is pressed", () => {
    renderInEnglish(<MobileMenu />)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Open the menu" })
    ).toHaveAttribute("aria-expanded", "false")
  })

  it("opens a named dialog with the site's sections", async () => {
    const { dialog } = await openMenu()
    const nav = within(dialog).getByRole("navigation", { name: "Main" })
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href"))
    ).toEqual(["/#costumes", "/basket"])
    expect(
      within(dialog).getByRole("navigation", { name: "Language" })
    ).toBeInTheDocument()
    expect(within(dialog).getByRole("link", { name: "Sign in" })).toBeVisible()
  })

  it("keeps focus inside while open", async () => {
    const { dialog } = await openMenu()
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement)
    )
  })

  it("closes on Escape and hands focus back to the menu button", async () => {
    const { user, trigger } = await openMenu()
    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it("closes from its close button", async () => {
    const { user, dialog } = await openMenu()
    await user.click(
      within(dialog).getByRole("button", { name: "Close the menu" })
    )
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  })

  it("closes when a link is followed", async () => {
    const { user, dialog } = await openMenu()
    await user.click(within(dialog).getByRole("link", { name: "Costumes" }))
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    )
  })
})
