// @vitest-environment node
import { describe, expect, it } from "vitest"

import {
  byYear,
  getCostume,
  getCostumes,
  getNeighbors,
  getRelated,
  toSummary,
} from "./index"
import type { Costume } from "./types"

const costume = (slug: string) => {
  const found = getCostume(slug)
  if (!found) throw new Error(`No costume ${slug}`)
  return found
}

describe("the catalog", () => {
  it("lists every costume once, by year, latest first", () => {
    const all = getCostumes()
    expect(all).toHaveLength(82)
    expect(new Set(all).size).toBe(82)
    const years = all.map((c) => c.films[0].year)
    expect(years).toEqual([...years].sort((a, b) => b - a))
    expect(all[0].slug).toBe("nikki-freaky-nikki-freeman")
    expect(all.at(-1)!.slug).toBe("count-orlok")
  })

  it("keeps the owner's ranking among costumes of the same year", () => {
    const of1980 = getCostumes().filter((c) => c.films[0].year === 1980)
    expect(of1980.length).toBeGreaterThan(1)
    const ranks = of1980.map((c) => c.rank)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })

  it("orders by the film a character is known from, its first", () => {
    const known = (year: number, rank: number, later?: number) =>
      ({
        rank,
        films: [
          { title: "Known for", year },
          ...(later ? [{ title: "Later", year: later }] : []),
        ],
      }) as Costume
    // A 1978 character back in 2018 still counts as 1978.
    expect(byYear(known(1978, 2, 2018), known(1980, 9))).toBeGreaterThan(0)
    expect(byYear(known(2024, 9), known(1980, 1))).toBeLessThan(0)
    expect(byYear(known(1980, 1), known(1980, 2))).toBeLessThan(0)
  })

  it("finds a costume by slug, and nothing for an unknown one", () => {
    expect(costume("michael-myers").name).toBe("Michael Myers")
    expect(getCostume("no-such-costume")).toBeUndefined()
    expect(getCostume("")).toBeUndefined()
  })

  it("links each costume to its neighbors in the list, with nothing past the ends", () => {
    const all = getCostumes()
    const [first, second] = all
    const last = all.at(-1)!
    expect(getNeighbors(first).previous).toBeUndefined()
    expect(getNeighbors(first).next).toBe(second)
    expect(getNeighbors(second).previous).toBe(first)
    expect(getNeighbors(last).next).toBeUndefined()
    expect(getNeighbors(last).previous).toBe(all.at(-2))
  })

  it("relates costumes that share a film", () => {
    const related = getRelated(costume("jack-torrance"))
    expect(related.kind).toBe("film")
    if (related.kind !== "film") return
    expect(related.film.title).toBe("The Shining")
    expect(related.costumes.map((c) => c.slug)).toEqual([
      "the-grady-twins",
      "danny-torrance",
    ])
  })

  it("otherwise offers the costumes that follow, wrapping past the end", () => {
    const all = getCostumes()
    // The last costume that shares no film (the very last, Count Orlok,
    // shares Nosferatu with Ellen Hutter).
    const index = all.findLastIndex((c) => getRelated(c).kind === "wanted")
    expect(index + 4).toBeGreaterThanOrEqual(all.length)
    const related = getRelated(all[index])
    expect(related.costumes).toEqual(
      [1, 2, 3, 4].map((offset) => all[(index + offset) % all.length])
    )
    expect(related.costumes).not.toContain(all[index])
  })

  it("relates the last costume to its film's other characters", () => {
    const related = getRelated(getCostumes().at(-1)!)
    expect(related.kind).toBe("film")
    expect(related.costumes.map((c) => c.slug)).toEqual(["ellen-hutter"])
  })

  it("gives lists only what they show", () => {
    const ghostface = costume("ghostface")
    expect(toSummary(ghostface)).toEqual({
      slug: "ghostface",
      name: "Ghostface",
      films: [{ title: "Scream", year: 1996 }],
      photo: ghostface.images[0],
    })
  })

  it("shows the first of several photos in lists", () => {
    const dollface = costume("dollface")
    expect(dollface.images.length).toBeGreaterThan(1)
    expect(toSummary(dollface).photo?.file).toBe("dollface.png")
  })

  it("lists a costume without a photo, with none", () => {
    expect(toSummary({ ...costume("ghostface"), images: [] }).photo).toBe(
      undefined
    )
  })
})
