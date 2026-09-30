// @vitest-environment node
import { describe, expect, it } from "vitest"

import {
  getCostume,
  getCostumes,
  getNeighbors,
  getRelated,
  toCard,
} from "./index"

const costume = (slug: string) => {
  const found = getCostume(slug)
  if (!found) throw new Error(`No costume ${slug}`)
  return found
}

describe("the catalog", () => {
  it("lists the collection in rank order", () => {
    const ranks = getCostumes().map((c) => c.rank)
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b))
  })

  it("finds a costume by slug, and nothing for an unknown one", () => {
    expect(costume("michael-myers").name).toBe("Michael Myers")
    expect(getCostume("no-such-costume")).toBeUndefined()
    expect(getCostume("")).toBeUndefined()
  })

  it("links each costume to its neighbors, with nothing past the ends", () => {
    const [first] = getCostumes()
    const last = getCostumes().at(-1)!
    expect(getNeighbors(first).previous).toBeUndefined()
    expect(getNeighbors(first).next?.rank).toBe(2)
    expect(getNeighbors(last).next).toBeUndefined()
    expect(getNeighbors(last).previous?.rank).toBe(last.rank - 1)
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

  it("otherwise offers the next most wanted, wrapping past the end", () => {
    const last = getCostumes().at(-1)!
    const related = getRelated(last)
    expect(related.kind).toBe("wanted")
    expect(related.costumes.map((c) => c.rank)).toEqual([1, 2, 3, 4])
    expect(related.costumes).not.toContain(last)
  })

  it("gives cards only what they show", () => {
    expect(toCard(costume("ghostface"))).toEqual({
      slug: "ghostface",
      name: "Ghostface",
      films: [{ title: "Scream", year: 1996 }],
    })
  })
})
