// @vitest-environment node
import { describe, expect, it } from "vitest"

import { costumes } from "./costumes"

// The collection is curated by hand: these checks catch a typo before it
// reaches a page.
describe("the collection", () => {
  it("ranks 100 costumes from 1 to 100, once each", () => {
    expect(costumes.map((costume) => costume.rank)).toEqual(
      Array.from({ length: 100 }, (_, index) => index + 1)
    )
  })

  it("gives every costume a unique slug that is safe in a URL", () => {
    const slugs = costumes.map((costume) => costume.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) {
      // No dots: page paths must not contain any (proxy.ts).
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it.each(costumes.map((costume) => [costume.rank, costume]))(
    "No. %i is complete and tidy",
    (_, costume) => {
      const texts = [
        costume.name,
        costume.lore,
        costume.funFact,
        ...costume.createdBy,
        ...costume.broughtToLifeBy,
        ...costume.look.pieces,
        ...(costume.look.alternative ? [costume.look.alternative] : []),
        ...costume.films.map((film) => film.title),
      ]
      for (const text of texts) {
        expect(text.trim(), costume.name).toBe(text)
        expect(text, costume.name).not.toBe("")
        expect(text, costume.name).not.toMatch(/\s{2,}|🔥/u)
      }
      expect(costume.films.length).toBeGreaterThan(0)
      for (const film of costume.films) {
        expect(Number.isInteger(film.year)).toBe(true)
        expect(film.year).toBeGreaterThanOrEqual(1900)
        expect(film.year).toBeLessThanOrEqual(2026)
      }
      expect(costume.createdBy.length).toBeGreaterThan(0)
      // Each list shows its lines once: a repeat is a copy-paste slip.
      for (const list of [
        costume.createdBy,
        costume.broughtToLifeBy,
        costume.look.pieces,
      ]) {
        expect(new Set(list).size, costume.name).toBe(list.length)
      }
      expect(costume.look.pieces.length).toBeGreaterThan(0)
      for (const store of costume.stores) {
        expect(store.url).toMatch(/^https:\/\//)
      }
    }
  )

  it("marks the 2024–2026 breakouts", () => {
    expect(costumes.filter((costume) => costume.trending)).toHaveLength(12)
  })
})
