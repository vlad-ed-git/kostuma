import { costumes } from "@/content/costumes"

import type { Costume, CostumeCard, Film } from "./types"

/**
 * The collection (content/costumes.ts), read by the pages. Static data, so
 * every lookup is synchronous.
 */

const byRank = [...costumes].sort((a, b) => a.rank - b.rank)
const bySlug = new Map(byRank.map((costume) => [costume.slug, costume]))

/** Every costume, in the owner's order. */
export function getCostumes(): readonly Costume[] {
  return byRank
}

export function getCostume(slug: string) {
  return bySlug.get(slug)
}

/** The costumes just before and after it (none past either end). */
export function getNeighbors(costume: Costume) {
  const index = byRank.indexOf(costume)
  return {
    previous: byRank[index - 1] as Costume | undefined,
    next: byRank[index + 1] as Costume | undefined,
  }
}

export type Related =
  | { kind: "film"; film: Film; costumes: Costume[] }
  | { kind: "wanted"; costumes: Costume[] }

/**
 * What to show after a costume: others from its films if there are any,
 * else the costumes that follow it (wrapping past the last to the first).
 */
export function getRelated(costume: Costume, count = 4): Related {
  const titles = new Set(costume.films.map((film) => film.title))
  const sameFilm = byRank.filter(
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
  const index = byRank.indexOf(costume)
  const next = Array.from(
    { length: Math.min(count, byRank.length - 1) },
    (_, offset) => byRank[(index + 1 + offset) % byRank.length]
  )
  return { kind: "wanted", costumes: next }
}

/** What a card shows, and nothing more. */
export function toCard(costume: Costume): CostumeCard {
  const { slug, name, films } = costume
  return { slug, name, films }
}
