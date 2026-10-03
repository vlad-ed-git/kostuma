// @vitest-environment node
import { describe, expect, it } from "vitest"

import { makeupGuides } from "@/content/makeup"
import {
  brows,
  facePaint,
  hair,
  lips,
  makeup,
  type MakeupGuide,
  matte,
  paler,
  smooth,
} from "@/lib/makeup"

import {
  DRESSED_FACE,
  dressesFace,
  fromHex,
  lighter,
  OUTFIT,
  renderPlan,
  toHex,
} from "./render-plan"
import type { FacePhoto } from "./try-on"

const LIGHT_SKIN = "#E8C4A8"
const DEEP_SKIN = "#5A3A28"

/** A face photo of this skin, 768 × 1024. */
const face = (skin: FacePhoto["skin"]): FacePhoto => ({
  id: "f".repeat(32),
  width: 768,
  height: 1024,
  skin,
})

const guide: MakeupGuide = {
  look: "A test face.",
  steps: [
    {
      title: "Pale base",
      howTo: "Foundation.",
      products: ["light foundation"],
      render: makeup(paler(2)),
    },
    {
      title: "Lips",
      howTo: "Lipstick.",
      products: ["lipstick"],
      render: makeup(lips(matte("#2A2A2A")), brows("#1E1E1E", 100)),
    },
    {
      title: "Hair",
      howTo: "Hair.",
      products: ["black hair color spray"],
      render: hair("#151515", 100, 20),
    },
  ],
}

/** The relative luminance-ish lightness of a hex: the mean of its channels. */
const brightness = (hex: string) =>
  fromHex(hex).reduce((sum, channel) => sum + channel, 0) / 3

/** The makeup step at `index` of a plan. */
function makeupAt(plan: ReturnType<typeof renderPlan>, index: number) {
  const render = plan[index]
  if (render?.tool !== "makeup") throw new Error(`no makeup at ${index}`)
  return render
}

describe("renderPlan", () => {
  it("tries the outfit on first, on the body photo", () => {
    const [outfit] = renderPlan(
      "frankensteins-monster",
      guide,
      face(LIGHT_SKIN)
    )
    expect(outfit).toEqual({
      tool: "clothes",
      garment: "frankensteins-monster",
      category: "full_body",
      from: "body",
      after: null,
    })
  })

  it("then tries it on the face photo, once the body has it: the dressed face", () => {
    const plan = renderPlan("ghostface", guide, face(LIGHT_SKIN))
    expect(plan[DRESSED_FACE]).toEqual({
      tool: "clothes",
      garment: "ghostface",
      category: "full_body",
      from: "face",
      after: OUTFIT,
    })
    expect(plan.map(dressesFace)).toEqual([false, true, false, false, false])
  })

  it("paints each step on the picture of the one before, from the dressed face, at the photo's size", () => {
    const plan = renderPlan("ghostface", guide, face(LIGHT_SKIN))
    expect(plan.map((render) => render.tool)).toEqual([
      "clothes",
      "clothes",
      "makeup",
      "makeup",
      "hair",
    ])
    expect(plan.slice(2).map((render) => render.from)).toEqual([
      DRESSED_FACE,
      2,
      3,
    ])
    for (const render of plan.slice(2)) {
      expect(render.after).toBe(OUTFIT)
      if (render.tool !== "clothes") expect(render.size).toEqual([768, 1024])
    }
    // Each makeup step sends only its own effects: the ones before are
    // already on the picture it paints on.
    expect(makeupAt(plan, 3).effects.map((effect) => effect.category)).toEqual([
      "skin_smooth",
      "lip_color",
      "eyebrows",
    ])
    expect(plan[4]).toMatchObject({
      tool: "hair",
      pattern: { name: "full" },
      palettes: [
        { color: "#151515", color_intensity: 100, shine_intensity: 20 },
      ],
    })
  })

  it("starts a costume that is all makeup on the face photo, with no outfit to wait for", () => {
    const plan = renderPlan(
      "nikki-freaky-nikki-freeman",
      { ...guide, allMakeup: true },
      face(LIGHT_SKIN)
    )
    expect(plan.map((render) => render.tool)).toEqual([
      "makeup",
      "makeup",
      "hair",
    ])
    expect(plan.map((render) => render.from)).toEqual(["face", 0, 1])
    for (const render of plan) expect(render.after).toBeNull()
  })

  it("lets a later step put the same makeup on again, as a second coat", () => {
    const coats: MakeupGuide = {
      ...guide,
      steps: [0, 1].map(() => ({
        title: "Coat",
        howTo: "White.",
        products: ["white cream face paint"],
        render: makeup(...facePaint("#FFFFFF")),
      })),
    }
    const plan = renderPlan("pennywise", coats, face(LIGHT_SKIN))
    expect(makeupAt(plan, 3).effects).toEqual(makeupAt(plan, 2).effects)
    expect(plan[3].from).toBe(2)
  })

  it("turns off YouCam's own smoothing, unless the step smooths", () => {
    const first = makeupAt(renderPlan("ghostface", guide, face(LIGHT_SKIN)), 2)
    expect(first.effects[0]).toEqual({
      category: "skin_smooth",
      skinSmoothStrength: 0,
      skinSmoothColorIntensity: 0,
    })

    const smoothed: MakeupGuide = {
      ...guide,
      steps: [{ ...guide.steps[0], render: makeup(smooth(40), paler(1)) }],
    }
    const only = makeupAt(
      renderPlan("ghostface", smoothed, face(LIGHT_SKIN)),
      2
    )
    const smoothing = only.effects.filter(
      (effect) => effect.category === "skin_smooth"
    )
    expect(smoothing).toEqual([smooth(40)])
  })

  it("makes a pale foundation from the visitor's own skin", () => {
    for (const skin of [LIGHT_SKIN, DEEP_SKIN] as const) {
      const first = makeupAt(renderPlan("ghostface", guide, face(skin)), 2)
      const foundation = first.effects[1]
      if (foundation.category !== "foundation")
        throw new Error("foundation expected")
      expect(foundation.palettes[0].color).toBe(lighter(skin, 2))
      expect(foundation.palettes[0].coverageIntensity).toBe(100)
    }
  })

  it("keeps face paint's color as it is, on every skin", () => {
    const painted: MakeupGuide = {
      ...guide,
      steps: [{ ...guide.steps[0], render: makeup(...facePaint("#9EAA92")) }],
    }
    for (const skin of [LIGHT_SKIN, DEEP_SKIN] as const) {
      const first = makeupAt(renderPlan("ghostface", painted, face(skin)), 2)
      expect(first.effects.slice(1)).toEqual(facePaint("#9EAA92"))
    }
  })

  it("never changes the guide it plans", () => {
    const before = JSON.stringify(guide)
    renderPlan("ghostface", guide, face(DEEP_SKIN))
    expect(JSON.stringify(guide)).toBe(before)
  })

  it.each(Object.entries(makeupGuides))(
    "plans %s with every color a hex",
    (slug, costumeGuide) => {
      for (const skin of [LIGHT_SKIN, DEEP_SKIN] as const) {
        const plan = renderPlan(slug, costumeGuide, face(skin))
        const outfits = costumeGuide.allMakeup ? 0 : 2
        expect(plan).toHaveLength(costumeGuide.steps.length + outfits)
        if (outfits) {
          expect(plan[OUTFIT]).toMatchObject({ tool: "clothes", from: "body" })
          expect(plan[DRESSED_FACE]).toMatchObject({
            tool: "clothes",
            from: "face",
          })
        }
        const colors = JSON.stringify(plan).match(/"color":"[^"]*"/g) ?? []
        for (const color of colors)
          expect(color).toMatch(/^"color":"#[0-9A-F]{6}"$/)
      }
    }
  )
})

describe("lighter", () => {
  it("keeps the skin's own shade at 0", () => {
    expect(lighter("#c08a6a", 0)).toBe("#C08A6A")
  })

  it("gets lighter with every shade, on light and deep skin", () => {
    for (const skin of [LIGHT_SKIN, DEEP_SKIN, "#8D5524", "#F1D3C2"] as const) {
      const shades = [0, 1, 2, 3].map((n) => brightness(lighter(skin, n)))
      for (let n = 1; n < shades.length; n++)
        expect(shades[n]).toBeGreaterThanOrEqual(shades[n - 1])
      expect(shades[3]).toBeGreaterThan(shades[0])
    }
  })

  it("stays a skin color: three shades lighter is not white", () => {
    expect(lighter(DEEP_SKIN, 3)).not.toBe("#FFFFFF")
    expect(brightness(lighter(DEEP_SKIN, 3))).toBeLessThan(0.6)
    expect(lighter("#FFF4EC", 3)).toMatch(/^#[0-9A-F]{6}$/)
  })
})

describe("hex", () => {
  it("reads and writes #RRGGBB", () => {
    expect(toHex(fromHex("#9eaa92"))).toBe("#9EAA92")
    expect(() => fromHex("#abc")).toThrow()
  })
})
