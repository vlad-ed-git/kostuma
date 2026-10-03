// @vitest-environment node
import { describe, expect, it } from "vitest"

import { makeupGuides } from "@/content/makeup"
import {
  brows,
  dot,
  hair,
  lips,
  makeup,
  type MakeupGuide,
  matte,
  paint,
  paler,
  shadow,
  smooth,
  tint,
} from "@/lib/makeup"

import { fromHex, lighter, OUTFIT, renderPlan, toHex } from "./render-plan"

const LIGHT_SKIN = "#E8C4A8"
const DEEP_SKIN = "#5A3A28"

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
      render: makeup(lips(matte("#2A2A2A", 75)), brows("#1E1E1E", 80)),
    },
    {
      title: "Hair",
      howTo: "Hair.",
      products: ["wig"],
      render: hair("#151515", 85, 20),
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
    const [outfit] = renderPlan("frankensteins-monster", guide, LIGHT_SKIN)
    expect(outfit).toEqual({
      tool: "clothes",
      garment: "frankensteins-monster",
      category: "full_body",
      from: "body",
      after: null,
    })
  })

  it("renders each makeup step with every effect so far, on the face, after the outfit", () => {
    const plan = renderPlan("ghostface", guide, LIGHT_SKIN)
    expect(plan).toHaveLength(4)
    const first = makeupAt(plan, 1)
    const second = makeupAt(plan, 2)
    for (const step of [first, second]) {
      expect(step.from).toBe("face")
      expect(step.after).toBe(OUTFIT)
    }
    expect(first.effects.map((effect) => effect.category)).toEqual([
      "skin_smooth",
      "foundation",
    ])
    expect(second.effects.map((effect) => effect.category)).toEqual([
      "skin_smooth",
      "foundation",
      "lip_color",
      "eyebrows",
    ])
  })

  it("colors the hair on the last makeup picture", () => {
    const plan = renderPlan("ghostface", guide, LIGHT_SKIN)
    expect(plan[3]).toEqual({
      tool: "hair",
      pattern: { name: "full" },
      palettes: [
        { color: "#151515", color_intensity: 85, shine_intensity: 20 },
      ],
      from: 2,
      after: OUTFIT,
    })
  })

  it("colors the hair on the face photo when no makeup comes before it", () => {
    const hairOnly: MakeupGuide = { ...guide, steps: [guide.steps[2]] }
    expect(renderPlan("ghostface", hairOnly, LIGHT_SKIN)[1]).toMatchObject({
      tool: "hair",
      from: "face",
    })
  })

  it("turns off YouCam's own smoothing, unless the guide smooths", () => {
    const first = makeupAt(renderPlan("ghostface", guide, LIGHT_SKIN), 1)
    expect(first.effects[0]).toEqual({
      category: "skin_smooth",
      skinSmoothStrength: 0,
      skinSmoothColorIntensity: 0,
    })

    const smoothed: MakeupGuide = {
      ...guide,
      steps: [{ ...guide.steps[0], render: makeup(smooth(40), paler(1)) }],
    }
    const only = makeupAt(renderPlan("ghostface", smoothed, LIGHT_SKIN), 1)
    const smoothing = only.effects.filter(
      (effect) => effect.category === "skin_smooth"
    )
    expect(smoothing).toEqual([smooth(40)])
  })

  it("makes a pale foundation from the visitor's own skin", () => {
    for (const skin of [LIGHT_SKIN, DEEP_SKIN] as const) {
      const first = makeupAt(renderPlan("ghostface", guide, skin), 1)
      const foundation = first.effects[1]
      if (foundation.category !== "foundation")
        throw new Error("foundation expected")
      expect(foundation.palettes[0].color).toBe(lighter(skin, 2))
      expect(foundation.palettes[0].coverageIntensity).toBe(90)
    }
  })

  it("keeps a fixed tint as it is, on every skin", () => {
    const tinted: MakeupGuide = {
      ...guide,
      steps: [{ ...guide.steps[0], render: makeup(tint("#9EAA92")) }],
    }
    for (const skin of [LIGHT_SKIN, DEEP_SKIN] as const) {
      const first = makeupAt(renderPlan("ghostface", tinted, skin), 1)
      expect(first.effects[1]).toEqual(tint("#9EAA92"))
    }
  })

  it("paints on the last makeup picture, by the eye and lip steps, and puts hair on the painting", () => {
    const painted: MakeupGuide = {
      look: "A painted face.",
      steps: [
        {
          title: "Base",
          howTo: "Paint.",
          products: ["paint"],
          render: makeup(paler(4)),
        },
        {
          title: "Eyes",
          howTo: "Eyes.",
          products: ["shadow"],
          render: makeup(shadow("1color30", matte("#000000", 90))),
        },
        {
          title: "Lips",
          howTo: "Lips.",
          products: ["lipstick"],
          render: makeup(lips(matte("#C00000", 92))),
        },
        {
          title: "Nose",
          howTo: "Nose.",
          products: ["red paint"],
          render: paint(dot({ at: "nose" }, 0.1, "#C00000")),
        },
        {
          title: "Hair",
          howTo: "Hair.",
          products: ["wig"],
          render: hair("#C8501E"),
        },
      ],
    }
    const plan = renderPlan("pennywise", painted, LIGHT_SKIN)
    expect(plan.map((render) => render.tool)).toEqual([
      "clothes",
      "makeup",
      "makeup",
      "makeup",
      "paint",
      "hair",
    ])
    expect(plan[4]).toMatchObject({
      tool: "paint",
      from: 3,
      eyes: { step: 2, before: 1 },
      lips: { step: 3, before: 2 },
      after: OUTFIT,
    })
    expect(plan[5]).toMatchObject({ tool: "hair", from: 4 })
  })

  it("refuses a paint step with no eye or lip step before it", () => {
    const early: MakeupGuide = {
      ...guide,
      steps: [
        guide.steps[0],
        {
          title: "Nose",
          howTo: "Nose.",
          products: ["red paint"],
          render: paint(dot({ at: "nose" }, 0.1, "#C00000")),
        },
      ],
    }
    expect(() => renderPlan("pennywise", early, LIGHT_SKIN)).toThrow()
  })

  it("never changes the guide it plans", () => {
    const before = JSON.stringify(guide)
    renderPlan("ghostface", guide, DEEP_SKIN)
    expect(JSON.stringify(guide)).toBe(before)
  })

  it.each(Object.entries(makeupGuides))(
    "plans %s with every color a hex",
    (slug, costumeGuide) => {
      for (const skin of [LIGHT_SKIN, DEEP_SKIN] as const) {
        const plan = renderPlan(slug, costumeGuide, skin)
        expect(plan).toHaveLength(costumeGuide.steps.length + 1)
        expect(plan[OUTFIT].tool).toBe("clothes")
        const colors = JSON.stringify(plan).match(/"color":"[^"]*"/g) ?? []
        for (const color of colors)
          expect(color).toMatch(/^"color":"#[0-9A-F]{6}"$/)
        // Hair on the last picture before it: the painted one, if any.
        const lastPicture = plan.findLastIndex(
          (render) => render.tool === "makeup" || render.tool === "paint"
        )
        const lastMakeup = plan.findLastIndex(
          (render) => render.tool === "makeup"
        )
        for (const render of plan) {
          if (render.tool === "hair") expect(render.from).toBe(lastPicture)
          if (render.tool === "paint") expect(render.from).toBe(lastMakeup)
        }
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
