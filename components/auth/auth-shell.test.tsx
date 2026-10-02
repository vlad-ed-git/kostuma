import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { AuthShell } from "./auth-shell"

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl")
  const messages = (await import("@/messages/en.json")).default
  return {
    getTranslations: async (namespace: string) =>
      createTranslator({
        locale: "en",
        messages,
        namespace: namespace as never,
      }),
  }
})

async function renderShell(wide?: boolean) {
  return renderInEnglish(
    await AuthShell({
      title: "Sign in",
      wide,
      children: <form aria-label="The form" />,
    })
  )
}

describe("AuthShell", () => {
  it("titles the page, split into the 404's red and bone ghosts", async () => {
    await renderShell()
    expect(
      screen.getByRole("heading", { level: 1, name: "Sign in" })
    ).toHaveClass("vhs-ghost-title")
  })

  it("rolls the tape through the night, never over the form", async () => {
    const { container } = await renderShell()
    const tape = container.querySelector(".vhs-tracking")
    // In the night: decoration, hidden from screen readers.
    expect(tape?.closest("[aria-hidden='true']")).toHaveTextContent(
      "Are you ready for the dark?"
    )
    expect(tape?.parentElement?.contains(screen.getByRole("form"))).toBe(false)
  })

  it("makes room for two fields side by side when wide", async () => {
    const narrow = (await renderShell()).container
    expect(narrow.querySelector(".lg\\:max-w-140")).toBeNull()
    const wide = (await renderShell(true)).container
    expect(wide.querySelector(".lg\\:max-w-140")).toContainElement(
      wide.querySelector("form")
    )
  })
})
