import { screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { LanguageMenu } from "./language-menu"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

async function openMenu() {
  const user = userEvent.setup()
  renderInEnglish(<LanguageMenu />)
  const trigger = screen.getByRole("button", { name: "Language: English" })
  await user.click(trigger)
  const menu = await screen.findByRole("menu")
  return { user, trigger, menu }
}

describe("LanguageMenu", () => {
  it("shows the current language, closed", () => {
    renderInEnglish(<LanguageMenu />)
    const trigger = screen.getByRole("button", { name: "Language: English" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  it("lists every language as a link to this page in that language", async () => {
    const { menu } = await openMenu()
    const items = within(menu).getAllByRole("menuitem")
    expect(
      items.map((item) => [
        item.textContent,
        item.getAttribute("href"),
        item.getAttribute("hreflang"),
        item.getAttribute("lang"),
      ])
    ).toEqual([
      ["English", "/", "en", "en"],
      ["Español", "/es", "es", "es"],
      ["中文", "/zh", "zh-Hans", "zh-Hans"],
    ])
  })

  it("marks the current language", async () => {
    const { menu } = await openMenu()
    expect(
      within(menu).getByRole("menuitem", { name: "English" })
    ).toHaveAttribute("aria-current", "true")
    expect(
      within(menu).getByRole("menuitem", { name: "Español" })
    ).not.toHaveAttribute("aria-current")
  })

  it("moves through the languages with the arrow keys", async () => {
    const { user, menu } = await openMenu()
    await user.keyboard("{ArrowDown}")
    const focused = () => document.activeElement?.textContent
    const first = focused()
    await user.keyboard("{ArrowDown}")
    expect(focused()).not.toBe(first)
    expect(menu).toContainElement(document.activeElement as HTMLElement)
  })

  it("closes on Escape and hands focus back", async () => {
    const { user, trigger } = await openMenu()
    await user.keyboard("{Escape}")
    await waitFor(() =>
      expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    )
    await waitFor(() => expect(trigger).toHaveFocus())
  })
})
