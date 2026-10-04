import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Badge } from "./badge"

describe("Badge", () => {
  it("draws the basket's count on its pumpkin", () => {
    render(<Badge variant="count">3</Badge>)
    expect(screen.getByText("3")).toHaveClass("bg-ember", "tabular-nums")
  })

  it("lets the caller's classes win", () => {
    render(
      <Badge variant="secondary" className="text-foreground">
        Label
      </Badge>
    )
    const badge = screen.getByText("Label")
    expect(badge).toHaveClass("text-foreground")
    expect(badge).not.toHaveClass("text-muted-foreground")
  })

  it("renders as another element, such as a link", () => {
    const href = "https://example.com/terms"
    render(<Badge render={<a href={href} />}>Terms</Badge>)
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute(
      "href",
      href
    )
  })
})
