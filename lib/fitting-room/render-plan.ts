import type { Hex, MakeupEffect, MakeupGuide, StepRender } from "@/lib/makeup"

import type { FacePhoto } from "./try-on"

/**
 * What the Fitting Room sends YouCam for one costume (owner, 2026-10-03/04):
 * first the outfit on the visitor's body photo (AI Clothes, cloth-v4, the
 * costume's garment), then the same outfit on their face photo, so the face
 * wears the costume too (the dressed face); then that dressed face through
 * the costume's makeup guide (lib/makeup.ts), one render per step, each on
 * the picture the step before left, as makeup goes on a face: a coat on top
 * of the last one, the hair color after the face. A costume that is all
 * makeup has no outfit: its guide starts on the face photo. Nothing goes on
 * the face before the body's outfit is done: a body photo YouCam can't read
 * stops the try-on before more is paid for. A face photo YouCam can't dress
 * (a close-up it doesn't take for a person) is made up as it is.
 */

/**
 * Bumped whenever the same photos and costume would render differently: a
 * try-on is kept per photos, costume and version (never rendered twice).
 */
export const PIPELINE_VERSION = 3

/** The outfit's step, when the costume has one: always the first. */
export const OUTFIT = 0
/** The dressed face's step: the outfit on the face photo, right after it. */
export const DRESSED_FACE = 1

type Foundation = Extract<MakeupEffect, { category: "foundation" }>
type FoundationPalette = Foundation["palettes"][0]

/** A makeup effect as YouCam takes it: every color a hex. */
export type SentEffect =
  | Exclude<MakeupEffect, Foundation>
  | {
      category: "foundation"
      palettes: [Omit<FoundationPalette, "color"> & { color: Hex }]
    }

type HairRender = Extract<StepRender, { tool: "hair" }>

/**
 * Where a face step starts: the visitor's face photo, or the picture of the
 * step at that index.
 */
export type Source = "face" | number

/** What every face step has: its source, what it waits for, its size. */
type FaceStep = {
  from: Source
  /** The outfit's step, when there is one: nothing is painted before it. */
  after: number | null
  /** The face photo's width and height: every picture comes out this size. */
  size: [number, number]
}

/** One step's render: what YouCam does, on which picture, after what. */
export type Render =
  | {
      tool: "clothes"
      /** The costume whose garment is tried on. */
      garment: string
      category: "full_body"
      /** The body photo, or the face photo once the body is dressed. */
      from: "body" | "face"
      after: number | null
    }
  | ({ tool: "makeup"; effects: SentEffect[] } & FaceStep)
  | ({
      tool: "hair"
      pattern: HairRender["pattern"]
      palettes: HairRender["palettes"]
    } & FaceStep)

/**
 * Whether a render dresses the face. When it can't, the makeup goes on the
 * face photo as it is: the try-on goes on without it.
 */
export const dressesFace = (render: Render) =>
  render.tool === "clothes" && render.from === "face"

/** YouCam smooths the skin at 50 unless told otherwise: the face stays theirs. */
const unsmoothed: SentEffect = {
  category: "skin_smooth",
  skinSmoothStrength: 0,
  skinSmoothColorIntensity: 0,
}

/**
 * A costume's renders: its outfit on the body photo, then on the face photo
 * (unless it is all makeup), then its makeup guide's steps on that dressed
 * face, one after the other.
 */
export function renderPlan(
  slug: string,
  guide: MakeupGuide,
  face: FacePhoto
): Render[] {
  const plan: Render[] = []
  let from: Source = "face"
  if (!guide.allMakeup) {
    const outfit = {
      tool: "clothes",
      garment: slug,
      category: "full_body",
    } as const
    plan.push({ ...outfit, from: "body", after: null })
    plan.push({ ...outfit, from: "face", after: OUTFIT })
    from = DRESSED_FACE
  }
  const after = guide.allMakeup ? null : OUTFIT
  const size: [number, number] = [face.width, face.height]
  for (const { render } of guide.steps) {
    const step: FaceStep = { from, after, size }
    from = plan.length
    plan.push(faceRender(render, step, face.skin))
  }
  return plan
}

function faceRender(render: StepRender, step: FaceStep, skin: Hex): Render {
  switch (render.tool) {
    case "makeup": {
      const effects = render.effects.map((effect) => resolve(effect, skin))
      const smoothed = effects.some(
        (effect) => effect.category === "skin_smooth"
      )
      return {
        tool: "makeup",
        effects: smoothed ? effects : [unsmoothed, ...effects],
        ...step,
      }
    }
    case "hair":
      return {
        tool: "hair",
        pattern: render.pattern,
        palettes: render.palettes,
        ...step,
      }
  }
}

/** The effect with a skin-based foundation turned into its hex. */
function resolve(effect: MakeupEffect, skin: Hex): SentEffect {
  if (effect.category !== "foundation") return effect
  const [palette] = effect.palettes
  const { color } = palette
  if (typeof color === "string") {
    return { category: "foundation", palettes: [{ ...palette, color }] }
  }
  return {
    category: "foundation",
    palettes: [{ ...palette, color: lighter(skin, color.lighterThanSkin) }],
  }
}

// One foundation shade, in OKLab: lighter and less colorful, as a shade
// range steps from medium to fair. Four shades take a medium skin to a
// pale, almost colorless one.
const SHADE_LIGHTNESS = 0.05
const SHADE_CHROMA = 0.85
const LIGHTEST = 0.95

/** A skin color `shades` foundation shades lighter (0: the same color). */
export function lighter(skin: Hex, shades: number): Hex {
  if (shades <= 0) return toHex(fromHex(skin))
  const [l, a, b] = toOklab(fromHex(skin))
  const chroma = SHADE_CHROMA ** shades
  const lightness = Math.min(LIGHTEST, l + SHADE_LIGHTNESS * shades)
  return toHex(fromOklab([Math.max(l, lightness), a * chroma, b * chroma]))
}

type Rgb = [number, number, number]

/** "#RRGGBB" to sRGB channels in 0–1. */
export function fromHex(hex: string): Rgb {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex)
  if (!match) throw new Error(`Not a #RRGGBB color: ${hex}`)
  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ]
}

/** sRGB channels in 0–1 to "#RRGGBB" (upper case, as the guides write it). */
export function toHex(rgb: Rgb): Hex {
  const hex = rgb
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")
  return `#${hex.toUpperCase()}`
}

const linear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
const gamma = (value: number) =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055

function toOklab(rgb: Rgb): Rgb {
  const [r, g, b] = rgb.map(linear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function fromOklab([lightness, a, b]: Rgb): Rgb {
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    gamma(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    gamma(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    gamma(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}
