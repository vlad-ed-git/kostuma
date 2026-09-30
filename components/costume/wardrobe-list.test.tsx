import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { WardrobeList } from "./wardrobe-list"

describe("WardrobeList", () => {
  it("lists every piece of the look, in order", () => {
    render(
      <WardrobeList
        look={{ pieces: ["Black hooded robe", "White mask", "Prop knife"] }}
      />
    )
    const items = within(screen.getByRole("list")).getAllByRole("listitem")
    expect(items.map((item) => item.textContent)).toEqual([
      "Black hooded robe",
      "White mask",
      "Prop knife",
    ])
  })

  it("adds the other way to wear it, when there is one", () => {
    render(
      <WardrobeList
        look={{
          pieces: ["White nightgown"],
          alternative: "Or the red wedding dress.",
        }}
      />
    )
    expect(screen.getByText("Or the red wedding dress.")).toBeInTheDocument()
    expect(screen.getAllByRole("listitem")).toHaveLength(1)
  })

  it("says nothing more when there is no other way", () => {
    const { container } = render(
      <WardrobeList look={{ pieces: ["White mask"] }} />
    )
    expect(container.querySelectorAll("p")).toHaveLength(0)
  })
})
