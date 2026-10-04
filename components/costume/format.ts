import type { Film } from "@/lib/catalog/types"

/** A film as a language writes it, with its title and year. */
export type FilmFormat = (film: { title: string; year: string }) => string

const asIs: FilmFormat = ({ title, year }) => `${title} (${year})`

/**
 * "Scream (1996)", or "Pearl (2022) / X (2022)" for several films, each film
 * as the language writes it (`Costume.film`: 《惊声尖叫》（1996） in
 * Chinese). The year goes as it is, never as a number to group ("1,996").
 */
export function filmLine(films: readonly Film[], format: FilmFormat = asIs) {
  return films
    .map(({ title, year }) => format({ title, year: String(year) }))
    .join(" / ")
}
