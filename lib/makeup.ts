/**
 * Makeup guides (content/makeup.ts): the makeup that turns a visitor's own
 * face into a character, step by step, as the Fitting Room shows it (owner,
 * 2026-10-03). The visitor sits at a vanity and follows the steps: every
 * step is makeup they put on their face at full strength ("no light
 * touches... LOTS"), and at most one colors their hair, last. Up to ten
 * steps, each one YouCam render on the picture the step before left, so
 * they see their face after every step, and only YouCam's makeup and hair
 * color renderers make the pictures (owner: never an image editor):
 * - `makeup`: Makeup VTO (`/s2s/v2.0/task/makeup-vto`, 1 unit), the step's
 *   `effects` as YouCam's schema has them;
 * - `hair`: Hair Color (`/s2s/v2.0/task/hair-color`, 1 unit).
 * Steps may repeat a kind of makeup: each renders on the last picture, so a
 * second coat goes on top of the first, as it would on a face. Two things
 * the renderer fills in (lib/fitting-room/render-plan.ts):
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
    Drama8: 1, // bold wings above and below: a pointed, graphic eye
    Drama51: 1, // a thick black almond all around the eye
    Drama42: 1, // a solid black lid up to the crease, winged
    Drama47: 1, // bat wings at the outer corner
    Drama40: 1, // spiky drawn lashes all around: a doll's
    Drama34: 1, // drawn lashes, dashes above and below the eye
    Drama12: 1, // a big smoked, feathered wing
    Drama13: 1, // smoke under the eye and a long wing
    PandaSmudge11: 1, // heavy and smudged all around, swept up at the corner
    PandaSmudge1: 1, // softly smudged all around
    FullRim7: 1, // smudged kohl around the whole eye
    OpenWings3: 1, // a classic wing
    Lower11: 1, // a thin line along the upper lashes
  },
  eyebrows: {
    Drama4: 1, // thin and long, sweeping up: a painted brow
    Drama7: 1, // thick, bushy, swept up
    Drama14: 1, // thick and wavy
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
    Rectangle7: 1, // a wide block over the cheeks
    Triangle3: 1, // a triangle on each cheekbone, its point toward the nose
    "3colors8": 3, // three patches on the cheekbone: 1 inside, 2 out, 3 up
  },
  contour: {
    OvalFace13: 1, // a dot on the tip of the nose
    HeartFace2: 1, // the temples, under the cheekbones and the jaw, wide
    HeartFace3: 1, // under the cheekbones, the temples and the jaw
    TriangleFace5: 1, // deep hollows from the cheekbones down to the jaw: gaunt
    OvalFace6: 1, // the hairline, the sides of the nose and under the jaw
  },
  bronzer: {
    Bronzer1: 1, // the middle of the forehead, the temples and the cheek hollows
    Bronzer2: 1, // half-moons under the eyes, the temples and the brow: hollow, tired eyes
    Bronzer3: 1, // the edges of the face, the cheek hollows and the nose
    Bronzer5: 1, // the temples, the cheek hollows and the jaw: a skull's shadows
  },
  highlighter: {
    OvalFace5: 1, // under the eyes, down the nose and the chin
    OvalFace62: 1, // the forehead, the cheeks and the chin, wide
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
      category: "concealer"
      palettes: [
        Pigment & { colorUnderEyeIntensity: number; coverageLevel: number },
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

/** What YouCam renders for a step, on the previous step's picture. */
export type StepRender =
  | { tool: "makeup"; effects: MakeupEffect[] }
  | {
      tool: "hair"
      pattern: { name: "full" }
      palettes: [
        { color: Hex; color_intensity: number; shine_intensity: number },
      ]
    }

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
  /**
   * There is no outfit to try on: the character is all makeup (owner,
   * 2026-10-03), and the Fitting Room needs only the face photo.
   */
  allMakeup?: true
  /** 3–10 steps, in the order the visitor does them; a hair color last. */
  steps: MakeupStep[]
  /** What completes the costume but no step shows, said after the steps. */
  finish?: string
}

// Builders: the guides read as recipes, and every effect comes out in
// YouCam's shape.

/** A Makeup VTO render of these effects. */
export const makeup = (...effects: MakeupEffect[]): StepRender => ({
  tool: "makeup",
  effects,
})

/** A Hair Color render: the whole head in one color. */
export const hair = (color: Hex, intensity = 100, shine = 30): StepRender => ({
  tool: "hair",
  pattern: { name: "full" },
  palettes: [{ color, color_intensity: intensity, shine_intensity: shine }],
})

export const matte = (color: Hex, intensity = 100): Matte => ({
  color,
  texture: "matte",
  colorIntensity: intensity,
})

/** An eye color with a metal sheen of the same color. */
export const metallic = (color: Hex, intensity = 100): EyePalette => ({
  color,
  texture: "metallic",
  colorIntensity: intensity,
  shimmerColor: color,
  shimmerIntensity: 60,
  metallicIntensity: 70,
})

export const satin = (color: Hex, intensity = 100): LipPalette => ({
  color,
  texture: "satin",
  colorIntensity: intensity,
})

export const gloss = (color: Hex, intensity = 100): LipPalette => ({
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
 * A foundation in the visitor's own tone, `shades` lighter (0: their own
 * shade, for an even base; 4: as pale as skin goes), with an optional glow
 * (dewy, sweaty). Skin, not paint: a painted face is `facePaint`.
 */
export const paler = (shades: number, coverage = 100, glow = 0) =>
  foundation({ lighterThanSkin: shades }, coverage, glow)

/** Concealer at full coverage, under the eyes too: a second layer of base. */
export const concealer = (color: Hex, intensity = 100): MakeupEffect => ({
  category: "concealer",
  palettes: [
    {
      color,
      colorIntensity: intensity,
      colorUnderEyeIntensity: intensity,
      coverageLevel: intensity,
    },
  ],
})

/**
 * One coat of face paint, as YouCam's makeup engine can lay it: the color as
 * foundation, concealer, highlighter, contour and bronzer at once, each
 * covering its own part of the face (foundation alone takes skin about a
 * third of the way to white; these together, two coats, all of it: measured
 * 2026-10-03). A step that paints a coat uses up those five kinds of makeup:
 * shadows and highlights go on in the next step, on top of it.
 */
export const facePaint = (color: Hex): MakeupEffect[] => [
  foundation(color, 100, 0),
  concealer(color),
  highlight(color, "OvalFace62"),
  contour(color, 100, "OvalFace6"),
  shading("Bronzer3", color),
]

/** Paint on the tip of the nose: a round dot (a clown's nose). */
export const noseTip = (color: Hex): MakeupEffect =>
  contour(color, 100, "OvalFace13")

/**
 * Shadows sculpting the face (see `patterns.contour`; under the cheekbones,
 * at the temples and along the jaw by default). YouCam's contour hardly
 * shows below 70.
 */
export const contour = (
  color: Hex,
  intensity = 100,
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
  intensity = 100
): MakeupEffect => ({
  category: "bronzer",
  pattern: { name },
  palettes: [{ color, colorIntensity: intensity }],
})

export const blush = (
  name: PatternName<"blush">,
  color: Hex,
  intensity = 100
): MakeupEffect => ({
  category: "blush",
  pattern: { name },
  palettes: [matte(color, intensity)],
})

/**
 * A matte light color on the high points of the face (see
 * `patterns.highlighter`): a lighter muzzle, a pale forehead.
 */
export const highlight = (
  color: Hex,
  name: PatternName<"highlighter"> = "OvalFace5"
): MakeupEffect => ({
  category: "highlighter",
  pattern: { name },
  palettes: [
    {
      color,
      colorIntensity: 100,
      glowIntensity: 0,
      shimmerIntensity: 0,
      shimmerDensity: 0,
      shimmerSize: 0,
    },
  ],
})

/** A glow on the high points of the face. */
export const glow = (color: Hex, intensity = 100): MakeupEffect => ({
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
  intensity = 100
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
  intensity = 100,
  thickness = 100,
  smoothness = 50
): MakeupEffect => ({
  category: "lip_liner",
  pattern: { name },
  palettes: [{ ...matte(color, intensity), thickness, smoothness }],
})
