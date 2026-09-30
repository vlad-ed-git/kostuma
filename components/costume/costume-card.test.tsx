import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { CostumeCard } from "./costume-card"

vi.mock("@/i18n/navigation", () => import("@/test/navigation"))
// What Next.js' bundler makes of the placeholder's static import.
vi.mock("@/public/images/costume-placeholder.webp", () => ({
  default: {
    src: "/images/costume-placeholder.webp",
    width: 1200,
    height: 1500,
    blurDataURL: "data:image/webp;base64,UklGRg==",
  },
}))

const ghostface = {
  slug: "ghostface",
  name: "Ghostface",
  films: [{ title: "Scream", year: 1996 }],
}

describe("CostumeCard", () => {
  it("is one link, named after the character, to the costume's page", () => {
    render(<CostumeCard costume={ghostface} />)
    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName("Ghostface")
    expect(links[0]).toHaveAttribute("href", "/costumes/ghostface")
  })

  it("heads with the name, at the level the page needs", () => {
    const { unmount } = render(<CostumeCard costume={ghostface} />)
    expect(
      screen.getByRole("heading", { level: 2, name: "Ghostface" })
    ).toBeInTheDocument()
    unmount()
    render(<CostumeCard costume={ghostface} heading="h3" />)
    expect(
      screen.getByRole("heading", { level: 3, name: "Ghostface" })
    ).toBeInTheDocument()
  })

  it("shows the name and the film, and nothing else: no rank, no badge", () => {
    render(<CostumeCard costume={ghostface} />)
    expect(screen.getByRole("article")).toHaveTextContent(
      /^GhostfaceScream \(1996\)$/
    )
  })

  it("names every film a character comes from", () => {
    render(
      <CostumeCard
        costume={{
          slug: "pearl",
          name: "Pearl",
          films: [
            { title: "Pearl", year: 2022 },
            { title: "X", year: 2022 },
          ],
        }}
      />
    )
    expect(screen.getByText("Pearl (2022) / X (2022)")).toBeInTheDocument()
  })

  it("keeps the placeholder picture out of the way of screen readers", () => {
    const { container } = render(<CostumeCard costume={ghostface} />)
    expect(container.querySelector("img")).toHaveAttribute("alt", "")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("loads its picture lazily, since most cards start off screen", () => {
    const { container } = render(<CostumeCard costume={ghostface} />)
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy")
  })
})
