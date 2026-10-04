import { describe, expect, it } from "vitest"

import { makeupGuides } from "@/content/makeup"

import { minutesOf, productsOf } from "./guide-kit"
import { guideText } from "./guides"

const step = (...names: string[]) => ({
  title: "A step",
  howTo: "Do it.",
  products: names.map((name) => ({ name, search: name })),
})

describe("what a guide needs", () => {
  it("lists every product once, in the order the steps need them", () => {
    expect(
      productsOf({
        steps: [
          step("white cream face paint", "white setting powder"),
          step("white cream face paint", "setting powder"),
          step("black eyeshadow"),
        ],
      }).map(({ name }) => name)
    ).toEqual([
      "white cream face paint",
      "white setting powder",
      "setting powder",
      "black eyeshadow",
    ])
  })

  it("knows a product by its English name, in every language", () => {
    const spanish = guideText("ghostface", "es")!
    const english = guideText("ghostface")!
    expect(productsOf(spanish).map(({ search }) => search)).toEqual(
      productsOf(english).map(({ search }) => search)
    )
    expect(productsOf(spanish)[0]).toEqual({
      name: "pintura facial en crema blanca",
      search: "white cream face paint",
    })
  })

  it("takes about 8 minutes a step, to the nearest 5", () => {
    const steps = (count: number) => ({
      steps: Array.from({ length: count }, () => step("a")),
    })
    expect(minutesOf(steps(4))).toBe(30)
    expect(minutesOf(steps(5))).toBe(40)
    expect(minutesOf(steps(6))).toBe(50)
    expect(minutesOf(steps(7))).toBe(55)
    expect(minutesOf(steps(8))).toBe(65)
  })

  it("gives every guide a short list and a time to plan for", () => {
    for (const slug of Object.keys(makeupGuides)) {
      const guide = guideText(slug)!
      expect(productsOf(guide).length, slug).toBeGreaterThan(0)
      expect(productsOf(guide).length, slug).toBeLessThanOrEqual(16)
      expect(minutesOf(guide) % 5, slug).toBe(0)
    }
  })
})
