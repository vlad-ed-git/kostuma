import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"
import { replace } from "@/test/navigation"

import { LocaleSwitcher } from "./locale-switcher"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

beforeEach(() => {
  replace.mockClear()
})

describe("LocaleSwitcher", () => {
  it("is a labelled select showing the current language", () => {
    renderInEnglish(<LocaleSwitcher />)
    expect(screen.getByLabelText("Language")).toHaveValue("en")
  })

  it("names each language in its own words and tags it", () => {
    renderInEnglish(<LocaleSwitcher />)
    const options = within(screen.getByLabelText("Language")).getAllByRole(
      "option"
    )
    expect(options.map((option) => [option.textContent, option.lang])).toEqual([
      ["English", "en"],
      ["Español", "es"],
      ["中文", "zh-Hans"],
    ])
  })

  it("shows the same page in the chosen language", async () => {
    const user = userEvent.setup()
    renderInEnglish(<LocaleSwitcher />)
    await user.selectOptions(screen.getByLabelText("Language"), "es")
    expect(replace).toHaveBeenCalledWith("/", { locale: "es" })
  })
})
