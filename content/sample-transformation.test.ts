// @vitest-environment node
import { describe, expect, it } from "vitest"

import { getCostume } from "@/lib/catalog"

import { makeupGuides } from "./makeup"
import { sampleTransformation } from "./sample-transformation"

const { slug, frames } = sampleTransformation

describe("the home page's sample transformation", () => {
  it("is a costume of the collection, with a makeup guide", () => {
    expect(getCostume(slug)).toBeDefined()
    expect(makeupGuides[slug]).toBeDefined()
  })

  it("has the photo, the outfit, then the makeup's first, middle and last steps", () => {
    const guide = makeupGuides[slug]
    const first = guide.allMakeup
      ? ["00-your-face.jpg"]
      : ["00-your-body.jpg", "00-outfit.jpg"]
    const count = guide.steps.length
    const picked = [
      ...new Set([1, Math.floor(count / 2) + 1, count].filter((n) => n > 0)),
    ]
    // The picture's name, whether the frame is its cut-out or not.
    const names = frames.map((frame) =>
      frame.file.replace(/^cut-out\//, "").replace(/\.png$/, ".jpg")
    )
    expect(names.slice(0, first.length)).toEqual(first)
    expect(
      names.slice(first.length).map((name) => Number(name.slice(0, 2)))
    ).toEqual(picked)
  })

  it("loads each frame's web copy from the public folder, named by its place and content", () => {
    frames.forEach((frame, index) => {
      const name = `sample-${slug}-${String(index).padStart(2, "0")}`
      expect(frame.url).toMatch(
        new RegExp(
          `^https://firebasestorage\\.googleapis\\.com/v0/b/kostuma-73f77\\.firebasestorage\\.app/o/costumes%2F${name}\\.[a-f0-9]{10}\\.webp\\?alt=media$`
        )
      )
    })
    expect(new Set(frames.map((frame) => frame.url)).size).toBe(frames.length)
  })

  it("has portrait frames no larger than a web copy", () => {
    for (const { width, height } of frames) {
      expect(width).toBeGreaterThan(0)
      expect(height).toBeGreaterThan(width)
      expect(height).toBeLessThanOrEqual(1400)
    }
  })
})
