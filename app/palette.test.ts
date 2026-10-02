// @vitest-environment node
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import {
  contrastRatio,
  over,
  parseOklch,
  toHex,
  toSrgb,
  type Oklch,
  type Rgb,
} from "@/lib/design/contrast"
import { themeColor } from "@/lib/design/theme"

// The contrast docs/design-spec.md §3.2 promises, measured on the palette
// app/globals.css actually ships. WCAG 2.2 AA: 4.5 for text, 3 for the
// parts of a control that identify it (1.4.11) and for focus indicators.
const TEXT = 4.5
const NON_TEXT = 3

const palette = readPalette(
  readFileSync(new URL("./globals.css", import.meta.url), "utf8")
)
const color = (name: string) => {
  const value = palette.get(name)
  if (!value) throw new Error(`--${name} is not an oklch() color`)
  return value
}
const solid = (name: string) => toSrgb(color(name))
const background = solid("background")

describe("palette", () => {
  it.each([
    ["foreground", "background"],
    ["foreground", "card"],
    ["foreground", "muted"],
    ["muted-foreground", "background"],
    ["muted-foreground", "card"],
    ["muted-foreground", "muted"],
    ["blood-text", "background"],
    ["blood-text", "card"],
    ["blood-text", "muted"],
    ["destructive", "background"],
    ["destructive", "card"],
    ["ember", "background"],
    ["ember", "card"],
    ["background", "ember"],
    ["primary-foreground", "primary"],
  ])("%s text on %s is readable", (text, surface) => {
    expect(contrastRatio(solid(text), solid(surface))).toBeGreaterThanOrEqual(
      TEXT
    )
  })

  it("the red button's hover (primary at 80 %) keeps its text readable", () => {
    const hover = over({ ...color("primary"), alpha: 0.8 }, background)
    expect(
      contrastRatio(solid("primary-foreground"), hover)
    ).toBeGreaterThanOrEqual(TEXT)
  })

  it.each(["background", "card"])(
    "field borders stand out on %s",
    (surface) => {
      const base = solid(surface)
      expect(
        contrastRatio(over(color("field-border"), base), base)
      ).toBeGreaterThanOrEqual(NON_TEXT)
    }
  )

  it.each(["background", "card", "primary"])(
    "the focus outline stands out on %s",
    (surface) => {
      expect(
        contrastRatio(solid("focus"), solid(surface))
      ).toBeGreaterThanOrEqual(NON_TEXT)
    }
  )

  it("the red fill is too dark to be text, as the spec warns", () => {
    // If this starts passing as text, the spec's "never text" rule and the
    // button hover (which darkens) deserve a second look.
    expect(contrastRatio(solid("primary"), background)).toBeLessThan(TEXT)
  })

  it("the browser theme color matches the page background", () => {
    expect(toHex(background)).toBe(themeColor)
  })
})

describe("contrast math", () => {
  it("measures black on white as 21:1", () => {
    const white: Rgb = [1, 1, 1]
    const black: Rgb = [0, 0, 0]
    expect(contrastRatio(white, black)).toBeCloseTo(21, 5)
    expect(contrastRatio(black, white)).toBeCloseTo(21, 5)
  })

  it("converts OKLCH white and black exactly", () => {
    expect(toHex(toSrgb(parseOklch("oklch(1 0 0)")!))).toBe("#ffffff")
    expect(toHex(toSrgb(parseOklch("oklch(0 0 0)")!))).toBe("#000000")
  })

  it("reads alpha as a percentage or a fraction", () => {
    expect(parseOklch("oklch(0.5 0.1 20 / 45%)")?.alpha).toBe(0.45)
    expect(parseOklch("oklch(0.5 0.1 20 / 0.45)")?.alpha).toBe(0.45)
    expect(parseOklch("oklch(0.5 0.1 20)")?.alpha).toBe(1)
    expect(parseOklch("rgb(0 0 0)")).toBeUndefined()
  })
})

/**
 * The `:root` custom properties of globals.css that are oklch() colors,
 * with `var(--x)` aliases resolved.
 */
function readPalette(css: string) {
  const root = /:root\s*\{([^}]*)\}/.exec(css)?.[1] ?? ""
  const raw = new Map(
    [...root.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim(),
    ])
  )
  const resolve = (
    name: string,
    seen = new Set<string>()
  ): Oklch | undefined => {
    const value = raw.get(name)
    const alias = value && /^var\(--([\w-]+)\)$/.exec(value)?.[1]
    if (!alias) return value ? parseOklch(value) : undefined
    if (seen.has(alias)) throw new Error(`--${name} refers to itself`)
    return resolve(alias, seen.add(name))
  }
  const colors = new Map<string, Oklch>()
  for (const name of raw.keys()) {
    const value = resolve(name)
    if (value) colors.set(name, value)
  }
  return colors
}
