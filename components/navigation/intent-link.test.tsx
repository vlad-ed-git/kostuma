import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"

import { IntentLink } from "./intent-link"

// Shows the prefetch setting the app's link receives.
vi.mock("@/i18n/navigation", () => ({
  Link: ({
    prefetch,
    ...props
  }: ComponentProps<"a"> & { prefetch?: boolean | null }) => (
    <a data-prefetch={String(prefetch)} {...props} />
  ),
}))

const renderLink = (props: Partial<ComponentProps<typeof IntentLink>> = {}) =>
  render(
    <IntentLink href="/costumes/ghostface" {...props}>
      Ghostface
    </IntentLink>
  )

describe("IntentLink", () => {
  it("prefetches nothing while it merely sits on screen", () => {
    renderLink()
    const link = screen.getByRole("link", { name: "Ghostface" })
    expect(link).toHaveAttribute("data-prefetch", "false")
    expect(link).toHaveAttribute("href", "/costumes/ghostface")
  })

  it.each([
    ["hovered", fireEvent.mouseEnter],
    ["focused", fireEvent.focus],
    ["touched", fireEvent.touchStart],
  ])("prefetches as usual once %s", (_, showIntent) => {
    renderLink()
    const link = screen.getByRole("link", { name: "Ghostface" })
    showIntent(link)
    expect(link).toHaveAttribute("data-prefetch", "null")
  })

  it("still calls the caller's own handlers", () => {
    const onMouseEnter = vi.fn()
    const onFocus = vi.fn()
    const onTouchStart = vi.fn()
    renderLink({ onMouseEnter, onFocus, onTouchStart })
    const link = screen.getByRole("link", { name: "Ghostface" })
    fireEvent.mouseEnter(link)
    fireEvent.focus(link)
    fireEvent.touchStart(link)
    expect(onMouseEnter).toHaveBeenCalledOnce()
    expect(onFocus).toHaveBeenCalledOnce()
    expect(onTouchStart).toHaveBeenCalledOnce()
  })
})
