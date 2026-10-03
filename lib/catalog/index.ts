import { costumes } from "@/content/costumes"
import { translations } from "@/content/translations"
import type { Locale } from "@/i18n/routing"

import type { Costume, CostumeSummary, Film, Photo } from "./types"

/**
 * The collection (content/costumes.ts), read by the pages in the visitor's
 * language (content/translations): the English with its words translated,
 * the names, people, photos and order as they are. Static data, so every
 * lookup is synchronous.
 */

/** The year of the film a character is known from (its first). */
const yearOf = (costume: Costume) => costume.films[0].year

/**
 * The order costumes show in (owner): by year, latest first; costumes from
 * the same year in the owner's ranking.
 */
export function byYear(a: Costume, b: Costume) {
  return yearOf(b) - yearOf(a) || a.rank - b.rank
}

const ordered = [...costumes].sort(byYear)
const indexOf = new Map(ordered.map((costume, index) => [costume.slug, index]))

/** A costume in a language: its words translated, all else as it is. */
function localized(costume: Costume, locale: Locale): Costume {
  if (locale === "en") return costume
  const text = translations[locale].costumes[costume.slug]
  // translations.test.ts makes sure there is one: never a missing page.
  if (!text) return costume
  return {
    ...costume,
    films: costume.films.map((film, index) => ({
      ...film,
      title: text.films[index] ?? film.title,
    })),
    createdBy: text.createdBy,
    broughtToLifeBy: text.broughtToLifeBy,
    lore: text.lore,
    funFact: text.funFact,
    look: text.look,
  }
}

const inLocale = new Map<Locale, readonly Costume[]>()

/** Every costume, by year, latest first, in a language (English unless said). */
export function getCostumes(locale: Locale = "en"): readonly Costume[] {
  let list = inLocale.get(locale)
  if (!list) {
    list = ordered.map((costume) => localized(costume, locale))
    inLocale.set(locale, list)
  }
  return list
}

export function getCostume(slug: string, locale: Locale = "en") {
  const index = indexOf.get(slug)
  return index === undefined ? undefined : getCostumes(locale)[index]
}

/** The costumes just before and after it (none past either end). */
export function getNeighbors(costume: Costume, locale: Locale = "en") {
  const list = getCostumes(locale)
  const index = indexOf.get(costume.slug) ?? -1
  return {
    previous: list[index - 1] as Costume | undefined,
    next: list[index + 1] as Costume | undefined,
  }
}

type Related =
  | { kind: "film"; film: Film; costumes: Costume[] }
  | { kind: "wanted"; costumes: Costume[] }

/**
 * What to show after a costume: others from its films if there are any,
 * else the costumes that follow it (wrapping past the last to the first).
 * Films are matched in English, the same in every language.
 */
export function getRelated(
  costume: Costume,
  count = 4,
  locale: Locale = "en"
): Related {
  const list = getCostumes(locale)
  const index = indexOf.get(costume.slug) ?? -1
  const source = ordered[index]
  if (!source) return { kind: "wanted", costumes: [] }
  const inLanguage = (other: Costume) => list[indexOf.get(other.slug)!]
  const titles = new Set(source.films.map((film) => film.title))
  const sameFilm = ordered.filter(
    (other) =>
      other !== source && other.films.some((film) => titles.has(film.title))
  )
  if (sameFilm.length > 0) {
    const shared = source.films.findIndex((candidate) =>
      sameFilm.some((other) =>
        other.films.some(({ title }) => title === candidate.title)
      )
    )
    return {
      kind: "film",
      film: list[index].films[Math.max(0, shared)],
      costumes: sameFilm.slice(0, count).map(inLanguage),
    }
  }
  const next = Array.from(
    { length: Math.min(count, ordered.length - 1) },
    (_, offset) => list[(index + 1 + offset) % ordered.length]
  )
  return { kind: "wanted", costumes: next }
}

/** What a list shows of a costume, and nothing more: its first photo. */
export function toSummary(costume: Costume): CostumeSummary {
  const { slug, name, films, images } = costume
  return { slug, name, films, photo: images[0] }
}

/**
 * The picture a costume's try-on dresses the visitor in: its garment (the
 * outfit alone, clearer for YouCam; owner, 2026-10-03), else its first
 * photo. Server only: never sent to the page.
 */
export function tryOnGarment(
  costume: Pick<Costume, "garment" | "images">
): Photo | undefined {
  return costume.garment ?? costume.images[0]
}
