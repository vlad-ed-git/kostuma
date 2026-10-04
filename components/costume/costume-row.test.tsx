import { screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish as render } from "@/test/intl"

import { CostumeRow } from "./costume-row"

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
  photo: {
    file: "ghostface.png",
    url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fghostface.09f63e341a.webp?alt=media",
    width: 1985,
    height: 2048,
  },
}

describe("CostumeRow", () => {
  it("is one link to the costume's page, named after the character", () => {
    render(<CostumeRow costume={ghostface} />)
    const links = screen.getAllByRole("link")
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute("href", "/costumes/ghostface")
    expect(links[0]).toHaveAccessibleName(/^Ghostface/)
  })

  it("shows the thumbnail, the name and the film, and nothing else", () => {
    const { container } = render(<CostumeRow costume={ghostface} />)
    expect(container.querySelector("img")).toBeInTheDocument()
    expect(screen.getByRole("link")).toHaveTextContent(
      /^GhostfaceScream \(1996\)$/
    )
  })

  it("names every film a character comes from", () => {
    render(
      <CostumeRow
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

  it("shows the costume's photo", () => {
    const { container } = render(<CostumeRow costume={ghostface} />)
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      encodeURIComponent(ghostface.photo.url)
    )
  })

  it("keeps the thumbnail out of the way of screen readers: the name is there", () => {
    const { container } = render(<CostumeRow costume={ghostface} />)
    expect(container.querySelector("img")).toHaveAttribute("alt", "")
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("shows the placeholder for a costume without a photo", () => {
    const { container } = render(
      <CostumeRow costume={{ ...ghostface, photo: undefined }} />
    )
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      "costume-placeholder"
    )
  })

  it("ends with the pumpkin that puts it in My Pumpkin Basket, outside the link", () => {
    render(<CostumeRow costume={ghostface} />)
    const toggle = screen.getByRole("button", {
      name: "Add Ghostface to My Pumpkin Basket",
    })
    expect(within(screen.getByRole("link")).queryByRole("button")).toBeNull()
    expect(toggle.parentElement?.lastElementChild).toBe(toggle)
  })

  it("loads its thumbnail lazily, since most rows start off screen", () => {
    const { container } = render(<CostumeRow costume={ghostface} />)
    expect(container.querySelector("img")).toHaveAttribute("loading", "lazy")
  })

  it("skips rendering its picture off screen, in a frame that keeps its size", () => {
    const { container } = render(<CostumeRow costume={ghostface} />)
    const frame = container.querySelector("img")?.closest(".aspect-4\\/5")
    expect(frame?.className).toContain("[content-visibility:auto]")
  })
})
