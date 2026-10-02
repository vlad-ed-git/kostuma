import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { LanguageLinks } from "./language-links"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

describe("LanguageLinks", () => {
  it("links this page in every language, without a popup", () => {
    renderInEnglish(<LanguageLinks />)
    const nav = screen.getByRole("navigation", { name: "Language" })
    const links = within(nav).getAllByRole("link")
    expect(
      links.map((link) => [
        link.textContent,
        link.getAttribute("href"),
        link.getAttribute("hreflang"),
      ])
    ).toEqual([
      ["English", "/", "en"],
      ["Español", "/es", "es"],
      ["中文", "/zh", "zh-Hans"],
    ])
  })

  it("names each language in its own words and language", () => {
    renderInEnglish(<LanguageLinks />)
    expect(screen.getByRole("link", { name: "中文" })).toHaveAttribute(
      "lang",
      "zh-Hans"
    )
  })

  it("marks the current language", () => {
    renderInEnglish(<LanguageLinks />)
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute(
      "aria-current",
      "true"
    )
    expect(screen.getByRole("link", { name: "Español" })).not.toHaveAttribute(
      "aria-current"
    )
  })
})
