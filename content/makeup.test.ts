// @vitest-environment node
import { describe, expect, it } from "vitest"

import { lipShapes, type MakeupEffect, patterns } from "@/lib/makeup"

import { costumes } from "./costumes"
import { makeupGuides } from "./makeup"

// The guides are written by hand, and each step goes to YouCam as it is:
// these checks hold every effect to YouCam's schema (docs.perfectcorp.com,
// makeup_vto and ai_hair_color), so a typo fails here, not in a paid render.

type Values = Record<string, unknown>

const HEX = /^#[0-9A-F]{6}$/

/** What is wrong with these fields: integers in the range, hex colors. */
function check(
  values: Values,
  numbers: string[],
  colors: string[] = [],
  min = 0
): string[] {
  const problems: string[] = []
  for (const key of numbers) {
    const value = values[key]
    if (
      !Number.isInteger(value) ||
      (value as number) < min ||
      (value as number) > 100
    )
      problems.push(`${key} is ${String(value)}`)
  }
  for (const key of colors)
    if (typeof values[key] !== "string" || !HEX.test(values[key] as string))
      problems.push(`${key} is ${String(values[key])}`)
  return problems
}

/** The numbers a texture asks for, besides the color's own (YouCam's rules). */
const textureNeeds: Record<string, Record<string, string[]>> = {
  eye: {
    matte: [],
    shimmer: ["shimmerIntensity"],
    metallic: ["shimmerIntensity", "metallicIntensity"],
  },
  lips: {
    matte: [],
    satin: [],
    gloss: ["gloss", "transparencyIntensity"],
  },
}

/** What is wrong with one effect, by YouCam's makeup schema (version 1.0). */
function problemsOf(effect: MakeupEffect): string[] {
  const { category } = effect
  const fields = effect as unknown as Values
  if (category === "skin_smooth")
    return check(fields, ["skinSmoothStrength", "skinSmoothColorIntensity"])

  const palettes = fields.palettes as Values[]
  const problems: string[] = []
  const pattern = fields.pattern as Values | undefined
  let colors = 1
  if (category in patterns && category !== "eyebrows") {
    const known: Record<string, number> =
      patterns[category as keyof typeof patterns]
    const name = pattern?.name as string
    if (!(name in known)) problems.push(`unknown pattern ${name}`)
    else colors = known[name]
  }
  if (palettes.length !== colors)
    problems.push(`${palettes.length} palettes, the pattern takes ${colors}`)

  for (const palette of palettes) {
    // A foundation may take its color from the visitor's skin (the renderer
    // fills in the hex): 0–4 shades lighter.
    const fromSkin =
      category === "foundation" && typeof palette.color === "object"
    if (fromSkin) {
      const { lighterThanSkin } = palette.color as Values
      if (
        !Number.isInteger(lighterThanSkin) ||
        (lighterThanSkin as number) < 0 ||
        (lighterThanSkin as number) > 4
      )
        problems.push(`lighterThanSkin is ${String(lighterThanSkin)}`)
    }
    problems.push(
      ...check(palette, ["colorIntensity"], fromSkin ? [] : ["color"])
    )
    switch (category) {
      case "foundation":
        problems.push(...check(palette, ["glowIntensity", "coverageIntensity"]))
        break
      case "highlighter":
        problems.push(
          ...check(palette, [
            "glowIntensity",
            "shimmerIntensity",
            "shimmerDensity",
            "shimmerSize",
          ])
        )
        break
      case "blush":
      case "eyebrows":
        if (palette.texture !== "matte") problems.push(`${palette.texture}`)
        break
      case "eye_shadow":
      case "eye_liner": {
        const needs = textureNeeds.eye[palette.texture as string]
        if (!needs) problems.push(`texture ${palette.texture}`)
        else if (palette.texture !== "matte")
          problems.push(...check(palette, needs, ["shimmerColor"]))
        break
      }
      case "lip_color": {
        const needs = textureNeeds.lips[palette.texture as string]
        if (!needs) problems.push(`texture ${palette.texture}`)
        else problems.push(...check(palette, needs))
        break
      }
      case "lip_liner":
        if (palette.texture !== "matte") problems.push(`${palette.texture}`)
        problems.push(...check(palette, ["thickness", "smoothness"]))
        break
    }
  }

  if (category === "eyebrows" && pattern?.type === "shape") {
    if (!((pattern.name as string) in patterns.eyebrows))
      problems.push(`unknown brow ${pattern.name}`)
    problems.push(...check(pattern, ["curvature", "thickness"], [], -100))
    problems.push(...check(pattern, ["definition"]))
  }
  if (category === "lip_color") {
    const shape = (fields.shape as Values).name as (typeof lipShapes)[number]
    if (!lipShapes.includes(shape)) problems.push(`lip shape ${shape}`)
    if ((fields.style as Values).type !== "full") problems.push("lip style")
  }
  return problems
}

const guides = Object.entries(makeupGuides)

describe("the makeup guides", () => {
  it("give every costume a guide, and no other", () => {
    expect(Object.keys(makeupGuides).sort()).toEqual(
      costumes.map((costume) => costume.slug).sort()
    )
  })

  it.each(guides)("%s reads well", (_, guide) => {
    const sentences = [guide.look, ...(guide.finish ? [guide.finish] : [])]
    for (const text of [
      ...sentences,
      ...guide.steps.flatMap((step) => [step.title, step.howTo]),
    ]) {
      expect(text.trim()).toBe(text)
      expect(text).not.toMatch(/\s{2,}/)
    }
    for (const sentence of sentences) expect(sentence).toMatch(/[.!?'"]$/)
    expect(guide.look.length).toBeLessThanOrEqual(160)
    for (const step of guide.steps) {
      expect(step.title.length).toBeGreaterThan(0)
      expect(step.title.length).toBeLessThanOrEqual(30)
      expect(step.title).not.toMatch(/\.$/)
      expect(step.howTo).toMatch(/\.$/)
      expect(step.howTo.length).toBeLessThanOrEqual(240)
      // Shop search words: lowercase, each once.
      expect(step.products.length).toBeGreaterThan(0)
      expect(step.products.length).toBeLessThanOrEqual(3)
      expect(new Set(step.products).size).toBe(step.products.length)
      for (const words of step.products)
        expect(words).toMatch(/^[a-z0-9]+( [a-z0-9]+)*$/)
    }
  })

  it.each(guides)("%s takes 3 to 6 renders, hair last", (_, guide) => {
    // One render per step, one unit each.
    expect(guide.steps.length).toBeGreaterThanOrEqual(3)
    expect(guide.steps.length).toBeLessThanOrEqual(6)
    const tools = guide.steps.map((step) => step.render.tool)
    expect(tools.filter((tool) => tool === "hair").length).toBeLessThanOrEqual(
      1
    )
    if (tools.includes("hair")) expect(tools.at(-1)).toBe("hair")
  })

  it.each(guides)("%s makes a whole face: base, eyes and lips", (_, guide) => {
    // The owner (2026-10-03): guides that left a feature alone stopped at
    // about 70 % of the character (the visitor's own lipstick showed
    // through). Every guide sets the skin, the eyes and the mouth.
    const categories = new Set(
      guide.steps.flatMap((step) =>
        step.render.tool === "makeup"
          ? step.render.effects.map((effect) => effect.category)
          : []
      )
    )
    expect(categories).toContain("foundation")
    expect(categories).toContain("lip_color")
    expect(categories.has("eye_shadow") || categories.has("eye_liner")).toBe(
      true
    )
  })

  it.each(guides)("%s adds each kind of makeup once", (_, guide) => {
    // A step adds to the previous picture: painting the same feature twice
    // would stack on it.
    const categories = guide.steps.flatMap((step) =>
      step.render.tool === "makeup"
        ? step.render.effects.map((effect) => effect.category)
        : []
    )
    expect(new Set(categories).size).toBe(categories.length)
  })

  it.each(guides)("%s keeps the face the visitor's own", (_, guide) => {
    // Makeup close to the character, not a film's face paint (owner): the
    // base is a foundation (from the skin, or a tint mixed into it, never an
    // opaque color), and nothing needs a makeup department. Strong enough to
    // read at a glance: YouCam shows shading only from about 70.
    for (const step of guide.steps) {
      if (step.render.tool === "hair") continue
      for (const effect of step.render.effects) {
        const where = `${step.title}: ${effect.category}`
        if (effect.category === "foundation") {
          const [palette] = effect.palettes
          const fromSkin = typeof palette.color === "object"
          expect(palette.coverageIntensity, where).toBeLessThanOrEqual(
            fromSkin ? 95 : 60
          )
        }
        if (effect.category === "eye_shadow" || effect.category === "eye_liner")
          for (const palette of effect.palettes)
            expect(palette.colorIntensity, where).toBeLessThanOrEqual(95)
        if (effect.category === "contour" || effect.category === "bronzer") {
          const strength = effect.palettes[0].colorIntensity
          expect(strength, where).toBeGreaterThanOrEqual(70)
          expect(strength, where).toBeLessThanOrEqual(95)
        }
        if (effect.category === "lip_liner")
          expect(effect.palettes[0].thickness, where).toBeLessThanOrEqual(70)
      }
    }
    const texts = [
      ...guide.steps.map((step) => step.howTo),
      ...(guide.finish ? [guide.finish] : []),
    ]
    for (const text of texts)
      expect(text).not.toMatch(
        /latex|prosthetic|bald cap|contact lens|scar wax|spirit gum|glue/i
      )
  })

  it.each(guides)("%s is renderable as it is", (_, guide) => {
    for (const step of guide.steps) {
      const { render } = step
      if (render.tool === "hair") {
        expect(render.pattern.name).toBe("full")
        expect(render.palettes).toHaveLength(1)
        expect(
          check(
            render.palettes[0],
            ["color_intensity", "shine_intensity"],
            ["color"]
          ),
          step.title
        ).toEqual([])
      } else {
        expect(render.effects.length, step.title).toBeGreaterThan(0)
        for (const effect of render.effects)
          expect(
            problemsOf(effect),
            `${step.title}: ${effect.category}`
          ).toEqual([])
      }
    }
  })
})

describe("the effect check", () => {
  // The checker itself must catch what YouCam would refuse.
  it("refuses an unknown pattern, a wrong palette count and out-of-range values", () => {
    expect(
      problemsOf({
        category: "eye_shadow",
        pattern: { name: "1color999" as "1color8" },
        palettes: [],
      })
    ).toContain("unknown pattern 1color999")
    expect(
      problemsOf({
        category: "eye_shadow",
        pattern: { name: "2colors25" },
        palettes: [{ color: "#000000", texture: "matte", colorIntensity: 50 }],
      })
    ).toContain("1 palettes, the pattern takes 2")
    expect(
      problemsOf({
        category: "foundation",
        palettes: [
          {
            color: "#fff",
            colorIntensity: 120,
            glowIntensity: 0,
            coverageIntensity: 100,
          },
        ],
      })
    ).toEqual(["colorIntensity is 120", "color is #fff"])
  })

  it("takes a foundation color from the skin, at most 4 shades lighter", () => {
    const fromSkin = (lighterThanSkin: number): MakeupEffect => ({
      category: "foundation",
      palettes: [
        {
          color: { lighterThanSkin },
          colorIntensity: 100,
          glowIntensity: 0,
          coverageIntensity: 80,
        },
      ],
    })
    expect(problemsOf(fromSkin(4))).toEqual([])
    expect(problemsOf(fromSkin(5))).toEqual(["lighterThanSkin is 5"])
  })

  it("asks a shimmer or gloss texture for its extra values", () => {
    expect(
      problemsOf({
        category: "eye_liner",
        pattern: { name: "FullRim7" },
        palettes: [
          { color: "#000000", texture: "shimmer", colorIntensity: 50 } as never,
        ],
      })
    ).toEqual(["shimmerIntensity is undefined", "shimmerColor is undefined"])
    expect(
      problemsOf({
        category: "lip_color",
        shape: { name: "original" },
        palettes: [
          { color: "#AA0000", texture: "gloss", colorIntensity: 50 } as never,
        ],
        style: { type: "full" },
      })
    ).toEqual(["gloss is undefined", "transparencyIntensity is undefined"])
  })
})
