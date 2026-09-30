import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Badge } from "./badge"

describe("Badge", () => {
  it("stamps the soon badge with a border and padding", () => {
    render(<Badge variant="soon">Label</Badge>)
    const badge = screen.getByText("Label")
    // The stamp must win over the preset's borderless, unpadded base.
    expect(badge).toHaveClass("border", "px-1.5", "py-0.5")
    expect(badge).not.toHaveClass("border-0", "px-0", "py-0")
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
    const href = "https://example.com/terms"
    render(<Badge render={<a href={href} />}>Soon</Badge>)
    expect(screen.getByRole("link", { name: "Soon" })).toHaveAttribute(
      "href",
      href
    )
  })
})
