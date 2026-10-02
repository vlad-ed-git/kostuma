import type { Film } from "@/lib/catalog/types"

/** "Scream (1996)", or "Pearl (2022) / X (2022)" for several films. */
export function filmLine(films: readonly Film[]) {
  return films.map((film) => `${film.title} (${film.year})`).join(" / ")
}
