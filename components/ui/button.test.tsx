import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Button, buttonVariants } from "./button"

describe("buttonVariants", () => {
  it("gives outline buttons their control border, not the base's transparent one", () => {
    const classes = buttonVariants({ variant: "outline" }).split(" ")
    expect(classes).toContain("border-field-border")
    expect(classes).not.toContain("border-transparent")
  })

  it("merges the caller's classes last", () => {
    const classes = buttonVariants({ size: "lg", className: "h-14" }).split(" ")
    expect(classes).toContain("h-14")
    expect(classes).not.toContain("h-11")
  })
})

describe("Button", () => {
  it("renders an accessible button with the variant's classes", () => {
    render(<Button variant="outline">Sign in</Button>)
    const button = screen.getByRole("button", { name: "Sign in" })
    expect(button).toHaveClass("border-field-border")
    expect(button).not.toHaveClass("border-transparent")
  })
})
