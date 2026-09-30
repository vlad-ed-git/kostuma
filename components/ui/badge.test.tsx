import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Badge } from "./badge"

describe("Badge", () => {
  it.each(["soon", "premium", "newBlood"] as const)(
    "stamps the %s variant with a border and padding",
    (variant) => {
      render(<Badge variant={variant}>Label</Badge>)
      const badge = screen.getByText("Label")
      // The stamp must win over the preset's borderless, unpadded base.
      expect(badge).toHaveClass("border", "px-1.5", "py-0.5")
      expect(badge).not.toHaveClass("border-0", "px-0", "py-0")
    }
  )

  it("fills the basket count with sodium orange", () => {
    render(<Badge variant="count">3</Badge>)
    expect(screen.getByText("3")).toHaveClass("bg-ember", "text-background")
  })

  it("lets the caller's classes win", () => {
    render(
      <Badge variant="soon" className="text-foreground">
        Soon
      </Badge>
    )
    const badge = screen.getByText("Soon")
    expect(badge).toHaveClass("text-foreground")
    expect(badge).not.toHaveClass("text-muted-foreground")
  })

  it("renders as another element, such as a link", () => {
    const href = "https://example.com/premium"
    render(<Badge render={<a href={href} />}>Premium</Badge>)
    expect(screen.getByRole("link", { name: "Premium" })).toHaveAttribute(
      "href",
      href
    )
  })
})
