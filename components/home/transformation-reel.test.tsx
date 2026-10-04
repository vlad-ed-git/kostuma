import { screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { sampleTransformation } from "@/content/sample-transformation"
import { renderInEnglish } from "@/test/intl"

import { TransformationReel } from "./transformation-reel"

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl")
  const messages = (await import("@/messages/en.json")).default
  return {
    getTranslations: async (namespace: string) =>
      createTranslator({
        locale: "en",
        messages,
        namespace: namespace as never,
      }),
  }
})

const { frames } = sampleTransformation

async function renderReel(className?: string) {
  const reel = await TransformationReel({ className })
  if (!reel) throw new Error("No strip for the sample")
  return renderInEnglish(reel)
}

describe("TransformationReel", () => {
  it("is one picture for screen readers, named for the costume and what it shows", async () => {
    await renderReel()
    const reel = screen.getByRole("img", {
      name: "A real transformation into Longlegs, frame by frame: the photo, the outfit tried on, then the first, middle and last steps of the makeup.",
    })
    // Its frames are part of the picture, not pictures of their own.
    expect(reel.querySelectorAll("img")).toHaveLength(frames.length)
    for (const image of reel.querySelectorAll("img"))
      expect(image).toHaveAttribute("alt", "")
  })

  it("shows every frame in order, numbered on the film's edge", async () => {
    const { container } = await renderReel()
    const shown = [...container.querySelectorAll(".home-reel-frame")]
    expect(shown).toHaveLength(frames.length)
    shown.forEach((frame, index) => {
      expect(frame.querySelector(".home-reel-number")).toHaveTextContent(
        String(index + 1)
      )
      // Through the image optimizer, from Storage.
      const src = frame.querySelector("img")?.getAttribute("src") ?? ""
      expect(new URL(src, "http://localhost").searchParams.get("url")).toBe(
        frames[index].url
      )
    })
  })

  it("loads every frame at once: the strip is in the first screen on phones", async () => {
    const { container } = await renderReel()
    for (const image of container.querySelectorAll("img")) {
      expect(image).toHaveAttribute("loading", "eager")
      expect(image).toHaveAttribute("fetchpriority", "high")
    }
  })

  it("burns the motor cue into the second-last frame and the changeover into the last", async () => {
    const { container } = await renderReel()
    const burns = [...container.querySelectorAll(".home-reel-burn")]
    expect(burns.map((burn) => burn.getAttribute("data-cue"))).toEqual([
      "motor",
      "changeover",
    ])
    const shown = [...container.querySelectorAll(".home-reel-frame")]
    expect(shown.at(-2)?.querySelector(".home-reel-burn")).toBe(burns[0])
    expect(shown.at(-1)?.querySelector(".home-reel-burn")).toBe(burns[1])
  })

  it("keeps the strip's shape for its frames, and takes its place from the page", async () => {
    await renderReel("lg:col-start-1")
    const reel = screen.getByRole("img")
    expect(reel).toHaveClass("home-reel", "lg:col-start-1")
    expect(reel.style.aspectRatio).toBe(`${frames.length * 279} / 444`)
    expect(reel.style.getPropertyValue("--frames")).toBe(String(frames.length))
  })
})
