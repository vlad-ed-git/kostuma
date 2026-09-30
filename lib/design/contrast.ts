/**
 * WCAG 2.2 contrast for the palette's OKLCH colors, so tests can hold
 * app/globals.css to the ratios docs/design-spec.md promises.
 */

/** Gamma-encoded sRGB channels in 0–1. */
export type Rgb = readonly [number, number, number]

/** An OKLCH color: lightness 0–1, chroma, hue in degrees, alpha 0–1. */
export type Oklch = { l: number; c: number; h: number; alpha: number }

/** Reads `oklch(L C H)` or `oklch(L C H / A%)`; undefined for anything else. */
export function parseOklch(value: string): Oklch | undefined {
  const match =
    /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/.exec(
      value.trim()
    )
  if (!match) return undefined
  const [, l, c, h, alpha, percent] = match
  return {
    l: Number(l),
    c: Number(c),
    h: Number(h),
    alpha:
      alpha === undefined ? 1 : Number(alpha) / (percent === "%" ? 100 : 1),
  }
}

/** OKLCH to gamma-encoded sRGB, clipped to the sRGB gamut. */
export function toSrgb({ l, c, h }: Oklch): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const lms = [
    l + 0.3963377774 * a + 0.2158037573 * b,
    l - 0.1055613458 * a - 0.0638541728 * b,
    l - 0.0894841775 * a - 1.291485548 * b,
  ].map((value) => value ** 3)
  const linear = [
    4.0767416621 * lms[0] - 3.3077115913 * lms[1] + 0.2309699292 * lms[2],
    -1.2684380046 * lms[0] + 2.6097574011 * lms[1] - 0.3413193965 * lms[2],
    -0.0041960863 * lms[0] - 0.7034186147 * lms[1] + 1.707614701 * lms[2],
  ]
  const [red, green, blue] = linear.map((value) =>
    encode(Math.min(1, Math.max(0, value)))
  )
  return [red, green, blue]
}

/** A translucent color painted over an opaque one, as browsers blend. */
export function over(color: Oklch, background: Rgb): Rgb {
  const top = toSrgb(color)
  const [red, green, blue] = top.map(
    (value, index) =>
      value * color.alpha + background[index] * (1 - color.alpha)
  )
  return [red, green, blue]
}

/** The WCAG contrast ratio of two opaque colors, from 1 to 21. */
export function contrastRatio(first: Rgb, second: Rgb) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (x, y) => y - x
  )
  return (lighter + 0.05) / (darker + 0.05)
}

/** `#rrggbb` for an opaque color. */
export function toHex(color: Rgb) {
  return `#${color
    .map((value) =>
      Math.round(value * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`
}

function luminance([red, green, blue]: Rgb) {
  return 0.2126 * decode(red) + 0.7152 * decode(green) + 0.0722 * decode(blue)
}

function encode(linear: number) {
  return linear <= 0.0031308
    ? 12.92 * linear
    : 1.055 * linear ** (1 / 2.4) - 0.055
}

function decode(value: number) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}
