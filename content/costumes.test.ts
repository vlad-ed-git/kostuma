// @vitest-environment node
import { describe, expect, it } from "vitest"

import { WEB_SIDE } from "@/scripts/photos/web.mjs"

import { costumes } from "./costumes"

// The collection is curated by hand: these checks catch a typo before it
// reaches a page.
describe("the collection", () => {
  it("ranks 82 costumes from 1 to 82, once each", () => {
    expect(costumes.map((costume) => costume.rank)).toEqual(
      Array.from({ length: 82 }, (_, index) => index + 1)
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

  it("gives each photo its cut-out file, its web copy's public URL and size", () => {
    const url =
      /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/kostuma-73f77\.firebasestorage\.app\/o\/costumes%2F[a-z0-9_-]+\.[a-f0-9]{10}\.webp\?alt=media$/
    for (const { name, images, garment } of costumes) {
      for (const photo of [...images, ...(garment ? [garment] : [])]) {
        expect(photo.file, name).toMatch(/^[a-z0-9]+([-_][a-z0-9]+)*\.png$/)
        expect(photo.url, name).toMatch(url)
        // The object is named after its file (plus a hash of its content).
        expect(decodeURIComponent(photo.url), name).toContain(
          `/costumes/${photo.file.replace(/\.png$/, ".")}`
        )
        for (const side of [photo.width, photo.height]) {
          expect(Number.isInteger(side), name).toBe(true)
          expect(side, name).toBeGreaterThan(0)
        }
        expect(Math.max(photo.width, photo.height), name).toBeLessThanOrEqual(
          WEB_SIDE
        )
      }
    }
  })

  it("never gives two costumes the same photo, nor a garment a photo shown", () => {
    const photos = costumes.flatMap((costume) => [
      ...costume.images,
      ...(costume.garment ? [costume.garment] : []),
    ])
    expect(new Set(photos.map((photo) => photo.file)).size).toBe(photos.length)
    expect(new Set(photos.map((photo) => photo.url)).size).toBe(photos.length)
  })

  it("gives the try-on its own garment where the owner made one (2026-10-03)", () => {
    expect(
      costumes
        .filter((costume) => costume.garment)
        .map((costume) => costume.slug)
        .sort()
    ).toEqual([
      "aunt-gladys",
      "freddy-fazbear",
      "jigsaw-and-billy-the-puppet",
      "nikki-freaky-nikki-freeman",
      "pirate-clark",
    ])
    for (const costume of costumes.filter((each) => each.garment))
      expect(costume.garment?.file).toBe(`${costume.slug}-costume.png`)
  })

  it("has a photo for every costume", () => {
    expect(
      costumes
        .filter((costume) => costume.images.length === 0)
        .map((costume) => costume.slug)
    ).toEqual([])
  })

  it("marks the 2024–2026 breakouts", () => {
    expect(costumes.filter((costume) => costume.trending)).toHaveLength(11)
  })
})
