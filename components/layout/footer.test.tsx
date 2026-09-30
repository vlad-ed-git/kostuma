import { screen, within } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { Footer } from "./footer"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

afterEach(() => {
  vi.useRealTimers()
})

const hrefs = (name: string) =>
  within(screen.getByRole("navigation", { name }))
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"))

describe("Footer", () => {
  it("has no sign-off (owner: removed)", () => {
    renderInEnglish(<Footer />)
    expect(screen.queryByText("The end?")).not.toBeInTheDocument()
  })

  it("links every help channel, each form preselected", () => {
    renderInEnglish(<Footer />)
    expect(hrefs("Help")).toEqual([
      "/feedback?type=bug",
      "/feedback?type=feedback",
      "/feedback?type=feature",
    ])
  })

  it("links what to explore and the fine print, still to come", () => {
    renderInEnglish(<Footer />)
    expect(hrefs("Explore")).toEqual(["/#costumes", "/basket"])
    expect(
      screen.getByRole("link", { name: "My Pumpkin Basket" })
    ).toHaveAttribute("href", "/basket")
    expect(hrefs("Fine print")).toEqual(["/terms", "/privacy"])
    const finePrint = screen.getByRole("navigation", { name: "Fine print" })
    expect(within(finePrint).getAllByText("Soon")).toHaveLength(2)
  })

  it("offers every language as a plain link", () => {
    renderInEnglish(<Footer />)
    expect(hrefs("Language")).toEqual(["/", "/es", "/zh"])
  })

  it("carries the legal lines and this year, without digit grouping", () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2031-06-01T12:00:00Z"))
    renderInEnglish(<Footer />)
    expect(
      screen.getByText("Horror imagery. Not intended for children.")
    ).toBeInTheDocument()
    expect(
      screen.getByText(/not affiliated with any studio/)
    ).toBeInTheDocument()
    expect(screen.getByText("© 2031 Kostuma")).toBeInTheDocument()
  })
})
