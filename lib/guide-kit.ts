import type { GuideText, Product } from "@/lib/guides"

/**
 * What a makeup guide asks of the visitor before step 1 (todo OPP-12),
 * from its words alone: safe in the browser, where lib/guides.ts (every
 * guide in every language) must never go.
 */

/**
 * Every product the guide uses, once, in the order its steps need them:
 * one shopping trip. A product is the same one wherever its English name
 * (the shops' search) is.
 */
export function productsOf(guide: Pick<GuideText, "steps">): Product[] {
  const products = new Map<string, Product>()
  for (const step of guide.steps)
    for (const product of step.products)
      if (!products.has(product.search)) products.set(product.search, product)
  return [...products.values()]
}

/** Minutes a step takes at a vanity, about. */
export const MINUTES_A_STEP = 8

/** About how long the whole makeup takes: to the nearest 5 minutes. */
export function minutesOf(guide: Pick<GuideText, "steps">): number {
  const minutes = guide.steps.length * MINUTES_A_STEP
  return Math.max(5, Math.round(minutes / 5) * 5)
}
