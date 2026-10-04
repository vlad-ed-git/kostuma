import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import ErrorPage from "./error"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))

describe("the error page", () => {
  it("says what happened and what to do, in the visitor's language", async () => {
    const retry = vi.fn()
    renderInEnglish(<ErrorPage retry={retry} />)
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Something went wrong in the dark.",
      })
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        "Something on this page failed. Try again, or head back to Kostuma."
      )
    ).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Back to Kostuma" })
    ).toHaveAttribute("href", "/")
    await userEvent.click(screen.getByRole("button", { name: "Try again" }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
