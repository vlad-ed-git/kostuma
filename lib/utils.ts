import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * Kostuma's own font sizes (the `--text-*` theme values in app/globals.css).
 * lib/utils.test.ts keeps this list in step with the stylesheet.
 */
export const typeScale = [
  "display-xl",
  "display",
  "display-fit",
  "h2",
  "h3",
  "h4",
  "billing",
  "ui",
  "badge",
  "lead",
  "body-lg",
  "label",
  "micro",
  "numeral",
] as const

const merge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: [...typeScale] }] } },
})

/**
 * Joins class names (clsx) and resolves Tailwind conflicts, the later class
 * winning (tailwind-merge). It knows Kostuma's type scale, so a size such as
 * `text-label` is never taken for a text color and dropped next to
 * `text-muted-foreground`. Import `cn` from here, never tailwind-merge
 * itself, nor a `cn` package (ESLint enforces it).
 */
export function cn(...classes: ClassValue[]) {
  return merge(clsx(classes))
}
