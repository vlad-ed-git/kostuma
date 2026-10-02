import { fireEvent, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { CostumeGallery } from "./costume-gallery"

// What Next.js' bundler makes of the placeholder's static import.
vi.mock("@/public/images/costume-placeholder.webp", () => ({
  default: {
    src: "/images/costume-placeholder.webp",
    width: 1200,
    height: 1500,
    blurDataURL: "data:image/webp;base64,UklGRg==",
  },
}))

const photo = (file: string) => ({
  file: `${file}.png`,
  url: `https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2F${file}.0123456789.webp?alt=media`,
  width: 1200,
  height: 2048,
})
const strangers = [
  photo("dollface"),
  photo("strangers_1"),
  photo("strangers_2"),
]

/** The large photo: the one described for screen readers. */
const mainPhoto = () => screen.getByRole("img", { name: "Dollface costume" })
const showing = (file: string) =>
  expect(mainPhoto().getAttribute("src")).toContain(`costumes%252F${file}.`)

describe("CostumeGallery", () => {
  it("shows a single photo large, described, with nothing to choose", () => {
    renderInEnglish(<CostumeGallery name="Dollface" photos={[strangers[0]]} />)
    showing("dollface")
    expect(mainPhoto()).toHaveAttribute("loading", "eager")
    expect(screen.queryByRole("group")).not.toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("offers every photo when there are several, the first one chosen", () => {
    renderInEnglish(<CostumeGallery name="Dollface" photos={strangers} />)
    const choices = within(
      screen.getByRole("group", { name: "Photos" })
    ).getAllByRole("button")
    expect(choices.map((choice) => choice.getAttribute("aria-label"))).toEqual([
      "Photo 1 of 3",
      "Photo 2 of 3",
      "Photo 3 of 3",
    ])
    expect(
      choices.map((choice) => choice.getAttribute("aria-pressed"))
    ).toEqual(["true", "false", "false"])
    showing("dollface")
  })

  it("shows the chosen photo large", () => {
    renderInEnglish(<CostumeGallery name="Dollface" photos={strangers} />)
    fireEvent.click(screen.getByRole("button", { name: "Photo 3 of 3" }))
    showing("strangers_2")
    expect(
      screen.getByRole("button", { name: "Photo 3 of 3" })
    ).toHaveAttribute("aria-pressed", "true")
    expect(
      screen.getByRole("button", { name: "Photo 1 of 3" })
    ).toHaveAttribute("aria-pressed", "false")

    fireEvent.click(screen.getByRole("button", { name: "Photo 1 of 3" }))
    showing("dollface")
  })

  it("brings each chosen photo in with a reveal of its own", () => {
    const { container } = renderInEnglish(
      <CostumeGallery name="Dollface" photos={strangers} />
    )
    const first = container.querySelector(".photo-reveal")
    fireEvent.click(screen.getByRole("button", { name: "Photo 2 of 3" }))
    const second = container.querySelector(".photo-reveal")
    expect(second).not.toBe(first)
    expect(second).not.toHaveAttribute("data-revealed")
  })

  it("keeps the thumbnails' pictures out of screen readers' way", () => {
    renderInEnglish(<CostumeGallery name="Dollface" photos={strangers} />)
    for (const choice of screen.getAllByRole("button")) {
      expect(within(choice).queryByRole("img")).not.toBeInTheDocument()
    }
  })

  it("loads the thumbnails at once, the large photo first", () => {
    const { container } = renderInEnglish(
      <CostumeGallery name="Dollface" photos={strangers} />
    )
    expect(mainPhoto()).toHaveAttribute("fetchpriority", "high")
    for (const choice of screen.getAllByRole("button")) {
      const img = choice.querySelector("img")
      expect(img).toHaveAttribute("loading", "eager")
      expect(img).not.toHaveAttribute("fetchpriority")
    }
    expect(container.querySelectorAll('img[loading="lazy"]')).toHaveLength(0)
  })

  it("shows the placeholder for a costume without a photo", () => {
    const { container } = renderInEnglish(
      <CostumeGallery name="Dollface" photos={[]} />
    )
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      "costume-placeholder"
    )
    expect(screen.queryByRole("group")).not.toBeInTheDocument()
  })
})
