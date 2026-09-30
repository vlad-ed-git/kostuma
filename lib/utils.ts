import { createCn } from "cn/config"

/**
 * Kostuma's own font sizes (the `--text-*` theme values in app/globals.css).
 * lib/utils.test.ts keeps this list in step with the stylesheet.
 */
export const typeScale = [
  "display-xl",
  "display",
  "h2",
  "h3",
  "billing",
  "ui",
  "badge",
  "lead",
  "body-lg",
  "label",
  "micro",
  "numeral",
] as const

/**
 * Joins class names and resolves Tailwind conflicts (the later class wins).
 * It knows Kostuma's type scale, so a size such as `text-label` is never
 * taken for a text color and dropped next to `text-muted-foreground`.
 * Import `cn` from here, never from the `cn` package (ESLint enforces it).
 */
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: [...typeScale] }] } },
})
