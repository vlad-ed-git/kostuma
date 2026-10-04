// @vitest-environment node
import { describe, expect, it } from "vitest"

import { makeupGuides } from "@/content/makeup"

import { guideFor, guideText } from "./guides"

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

describe("guideText", () => {
  it("shows each product in the visitor's language and searches it in English", () => {
    const spanish = guideText("freddy-krueger", "es")
    const lips = spanish?.steps.at(-1)?.products[0]
    expect(lips).toEqual({
      name: "labial rojo ladrillo",
      search: "brick red lipstick",
    })
    const english = guideText("freddy-krueger")
    expect(english?.steps.at(-1)?.products[0]).toEqual({
      name: "brick red lipstick",
      search: "brick red lipstick",
    })
  })

  it("keeps the words only: no renders reach the page", () => {
    const text = guideText("ghostface")
    expect(text?.steps[0]).not.toHaveProperty("render")
    expect(guideText("nobody")).toBeUndefined()
  })
})
