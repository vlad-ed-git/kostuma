import type { Look } from "@/lib/catalog/types"

import es from "./es.json"
import zh from "./zh.json"

/**
 * The collection's words in Spanish and Chinese (owner, 2026-10-04:
 * everything a visitor can read). English stays the source
 * (content/costumes.ts, content/makeup.ts): each language holds the same
 * parts in the same order, and only words. Character names and the people
 * credited stay as they are; films go by their official local titles
 * (Spanish: Latin America's; Chinese: the mainland's). Written by
 * `content/translations/build` from the translators' sheets; held to the
 * English by translations.test.ts.
 */

/** A costume's words: its films' titles, credits, lore, fun fact and look. */
export type CostumeText = {
  /** Each film's title in the language, in the costume's order. */
  films: string[]
  createdBy: string[]
  broughtToLifeBy: string[]
  lore: string
  funFact: string
  look: Look
}

/** A makeup guide's words; its products are also the shops' search terms. */
export type GuideText = {
  look: string
  steps: { title: string; howTo: string; products: string[] }[]
  finish?: string
}

export type Translation = {
  costumes: Record<string, CostumeText>
  guides: Record<string, GuideText>
}

export const translations: Record<"es" | "zh", Translation> = { es, zh }
