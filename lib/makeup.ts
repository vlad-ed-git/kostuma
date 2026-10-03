/**
 * Makeup guides (content/makeup.ts): the everyday makeup that brings a face
 * close to a character, as the Fitting Room shows it. Not a film's makeup
 * department: what its artists do with paint and prosthetics becomes the
 * closest makeup a visitor can do at home, which YouCam can render, and the
 * face stays theirs (no face painted over). Each step is one YouCam render
 * on the previous step's picture (1 unit), so the visitor sees their face
 * after every step:
 * - Makeup VTO: `POST /s2s/v2.0/task/makeup-vto` with `version: "1.0"` and
 *   the step's `effects`.
 * - Hair Color: `POST /s2s/v2.0/task/hair-color` with the step's `pattern`
 *   and `palettes`.
 * The effects mirror YouCam's schema, so a step is sent as it is, with two
 * exceptions the renderer fills in:
 * - A foundation `{ lighterThanSkin }` color: a pale or porcelain look is
 *   paler than the visitor's own skin, never one fixed beige on every face;
 *   the renderer measures the skin on their photo and sends that shade.
 * - Without a `skin_smooth` effect YouCam smooths the skin at 50 on every
 *   render: the renderer sends 0 unless the step asks for smoothing.
 */

/** A color as YouCam takes it: "#RRGGBB". */
export type Hex = `#${string}`

/**
 * A foundation color taken from the visitor's own skin: that many shades
 * lighter, 0–4 (0 is their own shade; 4 is as pale as skin goes).
 */
export type FromSkin = { lighterThanSkin: number }

/**
 * The YouCam patterns the guides use, by effect category, with the number of
 * colors each takes (`colorNum` in YouCam's catalogs, 1 when it has none).
 * `npm run makeup:patterns` checks them against the live catalogs.
 */
export const patterns = {
  eye_shadow: {
    "1color30": 1, // all around the eye, lid to brow and under: hollow, sunken sockets
    "1color55": 1, // a wide wash from the lid to the brow, and under the eye
    "1color57": 1, // the lid to the brow bone, a little under the eye
    "1color23": 1, // close around the eye, under it too: shadowed, sunken eyes
    "1color22": 1, // the lid to the crease, flicked up at the outer corner
    "1color67": 1, // the lid up to the brow
    "1color8": 1, // a soft wash on the lid
    "2colors25": 2, // 1 the lid up to the outer brow, 2 under the eye
    "2colors83": 2, // a smoky whole eye: 1 the lid, 2 the outer corner
    "2colors164": 2, // a cat eye: 1 under and inside, 2 the lid and the wing
  },
  eye_liner: {
    PandaSmudge11: 1, // heavy and smudged all around, swept up at the corner
    PandaSmudge1: 1, // softly smudged all around
    FullRim7: 1, // smudged kohl around the whole eye
    OpenWings3: 1, // a classic wing
    Lower11: 1, // a thin line along the upper lashes
  },
  eyebrows: {
    Thin1: 1,
    HighArch4: 1,
    Arrow13: 1, // long, sharp, high
    Straight2: 1,
    Original5: 1, // thick and natural
    SoftArch1: 1,
  },
  eyelashes: {
    Natural1: 1,
    UpperDense1: 1,
    "Upper&Lower1": 1, // doll lashes, top and bottom
    Winged1: 1,
  },
  blush: {
    Circle2: 1, // round circles on the apples: doll cheeks
    Round2: 1, // a wide flush across the cheeks
    Oblique2: 1, // swept along the cheekbones
  },
  contour: {
    HeartFace3: 1, // under the cheekbones, the temples and the jaw
    TriangleFace5: 1, // deep hollows from the cheekbones down to the jaw: gaunt
    OvalFace6: 1, // the hairline, the sides of the nose and under the jaw
  },
  bronzer: {
    Bronzer2: 1, // half-moons under the eyes, the temples and the brow: hollow, tired eyes
    Bronzer3: 1, // the edges of the face, the cheek hollows and the nose
    Bronzer5: 1, // the temples, the cheek hollows and the jaw: a skull's shadows
  },
  highlighter: {
    OvalFace5: 1, // under the eyes, down the nose and the chin
  },
  lip_liner: {
    Natural1: 1,
    "Large&Full1": 1, // overlined
    Small1: 1,
    Rosebud1: 1, // a small cupid's bow
    Wider1: 1, // past the corners
  },
} as const

/** YouCam's lip shapes (shapes/lipshape.json). */
export const lipShapes = [
  "original",
  "heart-shaped",
  "m-shaped",
  "petal",
  "plump",
  "pouty",
  "smile",
  "vintage",
] as const

export type LipShape = (typeof lipShapes)[number]

type Patterns = typeof patterns
type PatternName<C extends keyof Patterns> = keyof Patterns[C] & string

/** A color with its strength, 0–100. */
type Pigment = { color: Hex; colorIntensity: number }

type Matte = Pigment & { texture: "matte" }

/** An eyeshadow or eyeliner color. */
export type EyePalette =
  | Matte
  | (Pigment & {
      texture: "shimmer"
      shimmerColor: Hex
      shimmerIntensity: number
    })
  | (Pigment & {
      texture: "metallic"
      shimmerColor: Hex
      shimmerIntensity: number
      metallicIntensity: number
    })

/** A lipstick color. */
export type LipPalette =
  | Matte
  | (Pigment & { texture: "satin" })
  | (Pigment & {
      texture: "gloss"
      gloss: number
      transparencyIntensity: number
    })

/** The eyebrows' shape (curvature and thickness −100–100), or just their color. */
type BrowPattern =
  | {
      type: "shape"
      name: PatternName<"eyebrows">
      curvature: number
      thickness: number
      definition: number
    }
  | { type: "color" }

/** One Makeup VTO effect, as YouCam takes it (only what the guides use). */
export type MakeupEffect =
  | {
      category: "skin_smooth"
      skinSmoothStrength: number
      skinSmoothColorIntensity: number
    }
  | {
      category: "foundation"
      palettes: [
        {
          color: Hex | FromSkin
          colorIntensity: number
          glowIntensity: number
          coverageIntensity: number
        },
      ]
    }
  | {
      category: "contour"
      pattern: { name: PatternName<"contour"> }
      palettes: [Pigment]
    }
  | {
      category: "bronzer"
      pattern: { name: PatternName<"bronzer"> }
      palettes: [Pigment]
    }
  | {
      category: "blush"
      pattern: { name: PatternName<"blush"> }
      palettes: Matte[]
    }
  | {
      category: "highlighter"
      pattern: { name: PatternName<"highlighter"> }
      palettes: [
        Pigment & {
          glowIntensity: number
          shimmerIntensity: number
          shimmerDensity: number
          shimmerSize: number
        },
      ]
    }
  | { category: "eyebrows"; pattern: BrowPattern; palettes: [Matte] }
  | {
      category: "eye_shadow"
      pattern: { name: PatternName<"eye_shadow"> }
      palettes: EyePalette[]
    }
  | {
      category: "eye_liner"
      pattern: { name: PatternName<"eye_liner"> }
      palettes: EyePalette[]
    }
  | {
      category: "eyelashes"
      pattern: { name: PatternName<"eyelashes"> }
      palettes: [Pigment]
    }
  | {
      category: "lip_color"
      shape: { name: LipShape }
      palettes: [LipPalette]
      style: { type: "full" }
    }
  | {
      category: "lip_liner"
      pattern: { name: PatternName<"lip_liner"> }
      palettes: [
        Matte & {
          thickness: number
          smoothness: number
        },
      ]
    }

/**
 * Where a painted mark sits, from the features found on the visitor's face
 * (lib/fitting-room/landmarks.ts): the eye and mouth corner on the
 * picture's left (a `mirror`ed mark takes the right ones too), the nose tip,
 * the middle of the mouth, the chin, the middle of the forehead.
 */
export type Anchor =
  "eye" | "mouthCorner" | "nose" | "mouth" | "chin" | "forehead"

/**
 * A point near an anchor, `dx` to the picture's right and `dy` down, in
 * eye spans (the distance between the eyes' centers): the same mark fits
 * every face.
 */
export type Point = { at: Anchor; dx?: number; dy?: number }

/** What Kostuma paints itself: the lines, dots and spirals YouCam can't. */
export type Mark =
  | {
      shape: "line"
      from: Point
      to: Point
      /** A curve through this point instead of a straight line. */
      via?: Point
      /** Thickness, in eye spans. */
      width: number
      color: Hex
      /** Also the same mark on the other side of the face. */
      mirror?: boolean
    }
  | { shape: "dot"; at: Point; radius: number; color: Hex; mirror?: boolean }
  | {
      shape: "spiral"
      at: Point
      radius: number
      width: number
      color: Hex
      mirror?: boolean
    }
  | {
      shape: "stitches"
      from: Point
      to: Point
      /** How many cross stitches. */
      count: number
      width: number
      color: Hex
      mirror?: boolean
    }

/** What a step renders, on the previous step's picture. */
export type StepRender =
  | { tool: "makeup"; effects: MakeupEffect[] }
  | {
      tool: "hair"
      pattern: { name: "full" }
      palettes: [
        { color: Hex; color_intensity: number; shine_intensity: number },
      ]
    }
  /** Painted by Kostuma on the made-up face: no YouCam call, no unit. */
  | { tool: "paint"; marks: Mark[] }

export type MakeupStep = {
  /** What the step adds, in a few words: "White base". */
  title: string
  /** What the visitor does: the product, the shade, how to put it on. */
  howTo: string
  /** What to buy for it, as shop search words: "white cream face paint". */
  products: string[]
  render: StepRender
}

/** A character's makeup guide. */
export type MakeupGuide = {
  /** The finished face, in one sentence. */
  look: string
  /** 2–4 steps, in the order the visitor does them; hair comes last. */
  steps: MakeupStep[]
  /**
   * What completes the look but no picture shows (blood, stitches, lenses,
   * teeth), said once after the steps.
   */
  finish?: string
}

// Builders: the guides read as recipes, and every effect comes out in
// YouCam's shape.

/** A Makeup VTO render of these effects. */
export const makeup = (...effects: MakeupEffect[]): StepRender => ({
  tool: "makeup",
  effects,
})

/** Marks painted on the face (see `Mark`): streaks, a nose, stitches. */
export const paint = (...marks: Mark[]): StepRender => ({
  tool: "paint",
  marks,
})

/** A painted line from one point to another, or curved through `via`. */
export const line = (
  from: Point,
  to: Point,
  color: Hex,
  {
    width = 0.06,
    via,
    mirror = false,
  }: { width?: number; via?: Point; mirror?: boolean } = {}
): Mark => ({
  shape: "line",
  from,
  to,
  color,
  width,
  mirror,
  ...(via && { via }),
})

/** A painted dot: a clown nose, a beauty mark. */
export const dot = (
  at: Point,
  radius: number,
  color: Hex,
  mirror = false
): Mark => ({ shape: "dot", at, radius, color, mirror })

/** A painted spiral, from the center out. */
export const spiral = (
  at: Point,
  radius: number,
  color: Hex,
  mirror = false,
  width = 0.035
): Mark => ({ shape: "spiral", at, radius, color, width, mirror })

/** A stitched line: the seam and its cross stitches. */
export const stitches = (
  from: Point,
  to: Point,
  count: number,
  color: Hex,
  mirror = false,
  width = 0.025
): Mark => ({ shape: "stitches", from, to, count, color, width, mirror })

/** A Hair Color render: the whole head in one color. */
export const hair = (color: Hex, intensity = 80, shine = 30): StepRender => ({
  tool: "hair",
  pattern: { name: "full" },
  palettes: [{ color, color_intensity: intensity, shine_intensity: shine }],
})

export const matte = (color: Hex, intensity = 80): Matte => ({
  color,
  texture: "matte",
  colorIntensity: intensity,
})

/** An eye color with white (or `sparkle`) shimmer in it. */
export const shimmer = (
  color: Hex,
  intensity = 70,
  sparkle: Hex = "#FFFFFF"
): EyePalette => ({
  color,
  texture: "shimmer",
  colorIntensity: intensity,
  shimmerColor: sparkle,
  shimmerIntensity: 60,
})

/** An eye color with a metal sheen of the same color. */
export const metallic = (color: Hex, intensity = 70): EyePalette => ({
  color,
  texture: "metallic",
  colorIntensity: intensity,
  shimmerColor: color,
  shimmerIntensity: 60,
  metallicIntensity: 70,
})

export const satin = (color: Hex, intensity = 70): LipPalette => ({
  color,
  texture: "satin",
  colorIntensity: intensity,
})

export const gloss = (color: Hex, intensity = 70): LipPalette => ({
  color,
  texture: "gloss",
  colorIntensity: intensity,
  gloss: 70,
  transparencyIntensity: 30,
})

/** Smoothed skin (the renderer otherwise sends none). */
export const smooth = (strength: number): MakeupEffect => ({
  category: "skin_smooth",
  skinSmoothStrength: strength,
  skinSmoothColorIntensity: strength,
})

const foundation = (
  color: Hex | FromSkin,
  coverage: number,
  glow: number
): MakeupEffect => ({
  category: "foundation",
  palettes: [
    {
      color,
      colorIntensity: 100,
      glowIntensity: glow,
      coverageIntensity: coverage,
    },
  ],
})

/**
 * A paler foundation: `shades` lighter than the visitor's own skin, whatever
 * its tone. Four shades at full coverage, set with white powder, is how the
 * guides "paint the face white" (YouCam's foundation shows about half of the
 * change it is given, so the base needs this much to read as pale).
 */
export const paler = (shades: number, coverage = 90, glow = 0) =>
  foundation({ lighterThanSkin: shades }, coverage, glow)

/**
 * A color over the skin: color corrector or face paint mixed into
 * foundation (green for a monster, gray for a corpse).
 */
export const tint = (color: Hex, coverage = 70) =>
  foundation(color, coverage, 0)

/**
 * Face paint: an opaque color over the whole face (a clown's white, a
 * monster's green). YouCam's foundation at full coverage reads as paint
 * (pure white at 100 % turns any skin white, measured 2026-10-03).
 */
export const facePaint = (color: Hex, coverage = 100) =>
  foundation(color, coverage, 0)

/**
 * Shadows sculpting the face (see `patterns.contour`; under the cheekbones,
 * at the temples and along the jaw by default). YouCam's contour hardly
 * shows below 70.
 */
export const contour = (
  color: Hex,
  intensity = 85,
  name: PatternName<"contour"> = "HeartFace3"
): MakeupEffect => ({
  category: "contour",
  pattern: { name },
  palettes: [{ color, colorIntensity: intensity }],
})

/**
 * Color swept over larger parts of the face (see `patterns.bronzer`): the
 * hollows under the eyes, the temples, the cheeks. Like contour, it shows
 * from about 70.
 */
export const shading = (
  name: PatternName<"bronzer">,
  color: Hex,
  intensity = 85
): MakeupEffect => ({
  category: "bronzer",
  pattern: { name },
  palettes: [{ color, colorIntensity: intensity }],
})

export const blush = (
  name: PatternName<"blush">,
  color: Hex,
  intensity = 60
): MakeupEffect => ({
  category: "blush",
  pattern: { name },
  palettes: [matte(color, intensity)],
})

/** A glow on the high points of the face. */
export const glow = (color: Hex, intensity = 50): MakeupEffect => ({
  category: "highlighter",
  pattern: { name: "OvalFace5" },
  palettes: [
    {
      color,
      colorIntensity: intensity,
      glowIntensity: intensity,
      shimmerIntensity: 20,
      shimmerDensity: 20,
      shimmerSize: 20,
    },
  ],
})

type BrowShape = {
  name: PatternName<"eyebrows">
  curvature?: number
  thickness?: number
  definition?: number
}

/** Eyebrows drawn in a shape, or (without one) only recolored. */
export const brows = (
  color: Hex,
  intensity: number,
  shape?: BrowShape
): MakeupEffect => ({
  category: "eyebrows",
  pattern: shape
    ? { type: "shape", curvature: 0, thickness: 0, definition: 50, ...shape }
    : { type: "color" },
  palettes: [matte(color, intensity)],
})

/** Eyeshadow: one palette per color the pattern takes. */
export const shadow = (
  name: PatternName<"eye_shadow">,
  ...palettes: EyePalette[]
): MakeupEffect => ({
  category: "eye_shadow",
  pattern: { name },
  palettes,
})

export const liner = (
  name: PatternName<"eye_liner">,
  palette: EyePalette
): MakeupEffect => ({
  category: "eye_liner",
  pattern: { name },
  palettes: [palette],
})

export const lashes = (
  name: PatternName<"eyelashes">,
  color: Hex = "#111111",
  intensity = 90
): MakeupEffect => ({
  category: "eyelashes",
  pattern: { name },
  palettes: [{ color, colorIntensity: intensity }],
})

export const lips = (
  palette: LipPalette,
  shape: LipShape = "original"
): MakeupEffect => ({
  category: "lip_color",
  shape: { name: shape },
  palettes: [palette],
  style: { type: "full" },
})

/** A lip line: thickness and smoothness 0–100 (low smoothness, a rough edge). */
export const lipLine = (
  name: PatternName<"lip_liner">,
  color: Hex,
  intensity = 80,
  thickness = 50,
  smoothness = 50
): MakeupEffect => ({
  category: "lip_liner",
  pattern: { name },
  palettes: [{ ...matte(color, intensity), thickness, smoothness }],
})
