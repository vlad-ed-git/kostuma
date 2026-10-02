import type { ReactElement } from "react"

import { BasketProvider } from "@/components/basket/basket-provider"
import { GUEST_KEY, writeGuest } from "@/lib/basket/codec"

import { renderInEnglish } from "./intl"

/** The costumes these tests know. */
export const knownCostumes = [
  "ghostface",
  "michael-myers",
  "pearl",
  "carrie-white",
]

/**
 * Renders `ui` in English inside My Pumpkin Basket, with `stored` already
 * on the device (jsdom's localStorage).
 */
export function renderWithBasket(
  ui: ReactElement,
  {
    stored = [],
    account = null,
  }: { stored?: string[]; account?: string | null } = {}
) {
  localStorage.clear()
  if (stored.length > 0) localStorage.setItem(GUEST_KEY, writeGuest(stored))
  return renderInEnglish(
    <BasketProvider costumes={knownCostumes} account={account}>
      {ui}
    </BasketProvider>
  )
}

/** What the basket's live region last said. */
export function announced(container: HTMLElement = document.body) {
  return container.querySelector("[aria-live='polite']")?.textContent ?? ""
}

/** What the device keeps. */
export function storedSlugs() {
  const raw = localStorage.getItem(GUEST_KEY)
  return raw ? (JSON.parse(raw) as { slugs: string[] }).slugs : []
}
