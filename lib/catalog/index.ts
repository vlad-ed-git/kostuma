import { costumes } from "@/content/costumes"

import type { Costume, CostumeSummary, Film, Photo } from "./types"

/**
 * The collection (content/costumes.ts), read by the pages. Static data, so
 * every lookup is synchronous.
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
const bySlug = new Map(ordered.map((costume) => [costume.slug, costume]))

/** Every costume, by year, latest first. */
export function getCostumes(): readonly Costume[] {
  return ordered
}

export function getCostume(slug: string) {
  return bySlug.get(slug)
}

/** The costumes just before and after it (none past either end). */
export function getNeighbors(costume: Costume) {
  const index = ordered.indexOf(costume)
  return {
    previous: ordered[index - 1] as Costume | undefined,
    next: ordered[index + 1] as Costume | undefined,
  }
}

type Related =
  | { kind: "film"; film: Film; costumes: Costume[] }
  | { kind: "wanted"; costumes: Costume[] }

/**
 * What to show after a costume: others from its films if there are any,
 * else the costumes that follow it (wrapping past the last to the first).
 */
export function getRelated(costume: Costume, count = 4): Related {
  const titles = new Set(costume.films.map((film) => film.title))
  const sameFilm = ordered.filter(
    (other) =>
      other !== costume && other.films.some((film) => titles.has(film.title))
  )
  if (sameFilm.length > 0) {
    const film =
      costume.films.find((candidate) =>
        sameFilm.some((other) =>
          other.films.some(({ title }) => title === candidate.title)
        )
      ) ?? costume.films[0]
    return { kind: "film", film, costumes: sameFilm.slice(0, count) }
  }
  const index = ordered.indexOf(costume)
  const next = Array.from(
    { length: Math.min(count, ordered.length - 1) },
    (_, offset) => ordered[(index + 1 + offset) % ordered.length]
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
