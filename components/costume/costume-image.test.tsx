import { act, fireEvent, render } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CostumeImage, RETRIES, retryDelay } from "./costume-image"

// What Next.js' bundler makes of the placeholder's static import.
vi.mock("@/public/images/costume-placeholder.webp", () => ({
  default: {
    src: "/images/costume-placeholder.webp",
    width: 1200,
    height: 1500,
    blurDataURL: "data:image/webp;base64,UklGRg==",
  },
}))

// The window, played by the test: `seeAll()` brings every photo into view.
const watching = new Map<Element, () => void>()
vi.mock("@/lib/in-view", () => ({
  onceInView: (element: Element, callback: () => void) => {
    watching.set(element, callback)
    return () => watching.delete(element)
  },
}))
const seeAll = () =>
  act(() => {
    for (const callback of watching.values()) callback()
    watching.clear()
  })

const ghostface = {
  file: "ghostface.png",
  url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fghostface.09f63e341a.webp?alt=media",
  width: 1985,
  height: 2048,
}

const photoOf = (container: HTMLElement) => {
  const img = container.querySelector("img")
  if (!img) throw new Error("No image")
  return img
}

/** The browser finished loading the image (with real pixels, or none). */
const finishLoading = async (img: HTMLImageElement, width = 600) => {
  Object.defineProperty(img, "naturalWidth", { value: width })
  fireEvent.load(img)
  // next/image waits for the image to decode before it reports the load.
  await act(() => Promise.resolve())
}

const revealed = (container: HTMLElement) =>
  container.querySelector(".photo-reveal")?.hasAttribute("data-revealed")

beforeEach(() => watching.clear())
afterEach(() => vi.useRealTimers())

describe("CostumeImage", () => {
  it("shows the photo through the image optimizer, with its description", () => {
    const { container } = render(
      <CostumeImage photo={ghostface} alt="Ghostface costume" sizes="156px" />
    )
    const img = photoOf(container)
    expect(img.getAttribute("src")).toContain(
      `/_next/image?url=${encodeURIComponent(ghostface.url)}`
    )
    expect(img).toHaveAttribute("alt", "Ghostface costume")
    expect(img).toHaveAttribute("sizes", "156px")
  })

  it("contains the whole photo, never crops it, standing on the floor", () => {
    const { container } = render(
      <CostumeImage photo={ghostface} alt="" sizes="156px" />
    )
    expect(photoOf(container)).toHaveClass("object-contain", "object-bottom")
    expect(photoOf(container)).not.toHaveClass("object-cover")
  })

  it("loads lazily, or first and eagerly for the page's main photo", () => {
    const { container, rerender } = render(
      <CostumeImage photo={ghostface} alt="" sizes="156px" />
    )
    expect(photoOf(container)).toHaveAttribute("loading", "lazy")
    expect(photoOf(container)).not.toHaveAttribute("fetchpriority")
    rerender(
      <CostumeImage
        photo={ghostface}
        alt=""
        sizes="156px"
        loading="eager"
        fetchPriority="high"
      />
    )
    expect(photoOf(container)).toHaveAttribute("loading", "eager")
    expect(photoOf(container)).toHaveAttribute("fetchpriority", "high")
  })

  it("waits in the dark until it is both loaded and seen", async () => {
    const { container } = render(
      <CostumeImage photo={ghostface} alt="" sizes="156px" />
    )
    expect(revealed(container)).toBe(false)
    await finishLoading(photoOf(container))
    expect(revealed(container)).toBe(false)
    seeAll()
    expect(revealed(container)).toBe(true)
  })

  it("reveals a photo seen before it loaded once it loads", async () => {
    const { container } = render(
      <CostumeImage photo={ghostface} alt="" sizes="156px" />
    )
    seeAll()
    expect(revealed(container)).toBe(false)
    await finishLoading(photoOf(container))
    expect(revealed(container)).toBe(true)
  })

  it("never reveals a broken image reported as loaded", async () => {
    const { container } = render(
      <CostumeImage photo={ghostface} alt="" sizes="156px" />
    )
    seeAll()
    await finishLoading(photoOf(container), 0)
    expect(revealed(container)).toBe(false)
  })

  it("asks again for a photo that failed, then gives up for the placeholder", () => {
    vi.useFakeTimers()
    const { container } = render(
      <CostumeImage photo={ghostface} alt="Ghostface costume" sizes="156px" />
    )
    for (let attempt = 0; attempt < RETRIES; attempt++) {
      fireEvent.error(photoOf(container))
      // While waiting, no image (no broken-image icon).
      expect(container.querySelector("img")).toBeNull()
      act(() => vi.advanceTimersByTime(retryDelay(attempt, () => 1)))
      expect(photoOf(container).getAttribute("src")).toContain(
        encodeURIComponent(ghostface.url)
      )
    }
    fireEvent.error(photoOf(container))
    const fallback = photoOf(container)
    expect(fallback.getAttribute("src")).toContain("costume-placeholder")
    expect(fallback).toHaveAttribute("alt", "")
    expect(fallback).toHaveClass("object-contain")
  })

  it("stops waiting to ask again when it goes away", () => {
    vi.useFakeTimers()
    const { container, unmount } = render(
      <CostumeImage photo={ghostface} alt="" sizes="156px" />
    )
    fireEvent.error(photoOf(container))
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })

  it("shows the placeholder, out of screen readers' way, without a photo", () => {
    const { container } = render(
      <CostumeImage alt="Ghostface costume" sizes="156px" />
    )
    const img = photoOf(container)
    expect(img.getAttribute("src")).toContain("costume-placeholder")
    expect(img).toHaveAttribute("alt", "")
    expect(container.querySelector(".photo-reveal")).toBeNull()
  })

  it("skips the reveal where asked (small controls)", async () => {
    const { container } = render(
      <CostumeImage photo={ghostface} alt="" sizes="72px" reveal={false} />
    )
    expect(container.querySelector(".photo-reveal")).toBeNull()
    expect(watching.size).toBe(0)
    await finishLoading(photoOf(container))
    expect(container.querySelector("[data-revealed]")).toBeNull()
  })
})

describe("retryDelay", () => {
  it("waits longer each time", () => {
    expect(retryDelay(0, () => 0)).toBe(1500)
    expect(retryDelay(1, () => 0)).toBe(3000)
  })

  it("spreads the photos that failed together over a second", () => {
    expect(retryDelay(0, () => 0.999)).toBeLessThan(2500)
    expect(retryDelay(0, () => 0.5)).toBe(2000)
  })
})
