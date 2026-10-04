// @vitest-environment node
import { describe, expect, it } from "vitest"

import { makeupGuides } from "@/content/makeup"

import { guideFor } from "./guides"

describe("guideFor", () => {
  it("finds a costume's guide, in English as written", () => {
    expect(guideFor("ghostface")).toBe(makeupGuides.ghostface)
  })

  it("finds nothing for a slug that is no costume's, even one every object has", () => {
    for (const slug of ["constructor", "__proto__", "toString", "nobody"])
      expect(guideFor(slug), slug).toBeUndefined()
    expect(guideFor("constructor", "es")).toBeUndefined()
  })

  it("translates the words and keeps the renders", () => {
    const spanish = guideFor("ghostface", "es")
    expect(spanish?.look).not.toBe(makeupGuides.ghostface.look)
    expect(spanish?.steps.map((step) => step.render)).toEqual(
      makeupGuides.ghostface.steps.map((step) => step.render)
    )
  })
})
