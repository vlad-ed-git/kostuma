import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Pumpkin } from "./pumpkin"

describe("Pumpkin", () => {
  it("is decorative: hidden from assistive tech and never focusable", () => {
    const { container } = render(<Pumpkin />)
    const svg = container.querySelector("svg")
    expect(svg).toHaveAttribute("aria-hidden", "true")
    expect(svg).toHaveAttribute("focusable", "false")
  })

  it("is an unlit outline while the basket is empty", () => {
    const { container } = render(<Pumpkin />)
    const svg = container.querySelector("svg")
    expect(svg).not.toHaveAttribute("data-lit")
    expect(container.querySelector("[fill='currentColor']")).toBeNull()
  })

  it("lights up in pumpkin orange with its face carved out", () => {
    const { container } = render(<Pumpkin lit />)
    const svg = container.querySelector("svg")
    expect(svg).toHaveAttribute("data-lit", "true")
    expect(svg).toHaveClass("text-ember")
    // Even-odd fill: the eyes and mouth are holes in the lit body.
    const body = container.querySelector("[fill='currentColor']")
    expect(body).toHaveAttribute("fill-rule", "evenodd")
  })

  it("takes the caller's size", () => {
    const { container } = render(<Pumpkin lit className="size-10" />)
    expect(container.querySelector("svg")).toHaveClass("size-10", "text-ember")
  })
})
