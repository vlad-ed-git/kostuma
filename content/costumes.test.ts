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

  it("names each photo by its file, the original and its cut-out in pairs", () => {
    const file = /^[a-z0-9]+([-_][a-z0-9]+)*\.(jpe?g|png|webp)$/
    const stem = (name: string) => name.replace(/\.[^.]+$/, "")
    for (const { name, images } of costumes) {
      expect(images.noBg.length, name).toBe(images.og.length)
      images.og.forEach((og, index) => {
        const noBg = images.noBg[index]
        expect(og, name).toMatch(file)
        // A cut-out keeps its transparency: always PNG.
        expect(noBg, name).toMatch(/\.png$/)
        expect(stem(noBg), name).toBe(stem(og))
      })
    }
  })

  it("never gives two costumes the same photo", () => {
    const all = costumes.flatMap((costume) => costume.images.og)
    expect(new Set(all).size).toBe(all.length)
  })

  it("has a photo for every costume but the three the owner is removing", () => {
    expect(
      costumes
        .filter((costume) => costume.images.og.length === 0)
        .map((costume) => costume.slug)
    ).toEqual([
      "carol-anne-freeling",
      "elisabeth-sparkle-monstro-elisasue",
      "black-phillip",
    ])
  })

  it("marks the 2024–2026 breakouts", () => {
    expect(costumes.filter((costume) => costume.trending)).toHaveLength(12)
  })
})
