import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LostInTheDark } from "./lost-in-the-dark"

describe("LostInTheDark", () => {
  it("is a title card: one heading, the code, the way back", () => {
    const { container } = render(
      <LostInTheDark
        code="404"
        title="Lost in the dark"
        description="This page does not exist."
        action={<a href="https://example.com/">Back to Kostuma</a>}
      />
    )
    expect(
      screen.getByRole("heading", { level: 1, name: "Lost in the dark" })
    ).toBeInTheDocument()
    expect(screen.getByText("404")).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Back to Kostuma" })
    ).toBeInTheDocument()
    // The header turns transparent over it; the tape effect is decoration.
    expect(container.querySelector("[data-title-card]")).not.toBeNull()
    expect(container.querySelector(".vhs-tracking")).toHaveAttribute(
      "aria-hidden",
      "true"
    )
  })
})
