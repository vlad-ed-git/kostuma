// @vitest-environment node
import { fileURLToPath } from "node:url"

import sharp from "sharp"
import { describe, expect, it } from "vitest"

import { sampleTransformation } from "@/content/sample-transformation"

import { cues, STRIP } from "./film-strip"

describe("cues", () => {
  it("burns the motor cue into the second-last frame and the changeover into the last", () => {
    expect(cues(5)).toEqual({ 3: "motor", 4: "changeover" })
    expect(cues(2)).toEqual({ 0: "motor", 1: "changeover" })
  })

  it("has only the changeover for a single frame, and nothing for none", () => {
    expect(cues(1)).toEqual({ 0: "changeover" })
    expect(cues(0)).toEqual({})
  })
})

describe("the strip's image", () => {
  it("has a frame for every picture of the sample (npm run images draws it)", async () => {
    const image = fileURLToPath(
      new URL("../public/images/film-strip.webp", import.meta.url)
    )
    const { width, height } = await sharp(image).metadata()
    expect(width).toBe(sampleTransformation.frames.length * STRIP.frameWidth)
    expect(height).toBe(STRIP.height)
  })
})
