import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Wordmark } from "./wordmark"

describe("Wordmark", () => {
  it("reads as the brand name, not as spaced letters and a disc", () => {
    render(<Wordmark />)
    const mark = screen.getByRole("img", { name: "Kostuma" })
    expect(mark).toHaveTextContent("KSTUMA")
    for (const part of mark.children) {
      expect(part).toHaveAttribute("aria-hidden", "true")
    }
  })

  it("names a link it sits in", () => {
    render(
      <a href="https://example.com/">
        <Wordmark />
      </a>
    )
    expect(screen.getByRole("link", { name: "Kostuma" })).toBeInTheDocument()
  })
})
