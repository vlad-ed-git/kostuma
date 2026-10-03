import { describe, expect, it } from "vitest"

import { costumes } from "@/content/costumes"
import { makeupGuides } from "@/content/makeup"

import { translations } from "./index"

/**
 * Every costume and makeup guide in all three languages (owner,
 * 2026-10-04: "everything will be translated"): the same parts as the
 * English, in the same order, every word translated; the people credited
 * as they are.
 */

const languages = Object.entries(translations)

/** Chinese characters: a Chinese text that has none is still English. */
const han = /\p{Script=Han}/u

/** The words of a costume that must read differently once translated. */
function textsOf(costume: (typeof costumes)[number]) {
  return { lore: costume.lore, funFact: costume.funFact }
}

/**
 * The people a credit names: runs of capitalized words, one person each side
 * of an "&", without a possessive or a word that isn't part of a name.
 */
const notNames = new Set([
  "Universal Pictures",
  "Red Dragon",
  "Creature FX",
  "Chiodo Brothers",
  "Living Dummy",
])
const leading = /^(?:Earlier|Spin-off|Unauthorized|The)\s+/
function peopleIn(credit: string): string[] {
  const runs =
    credit.match(/[A-Z][\w'.-]*(?:\s+(?:[A-Z][\w'.-]*|&))*\s+[A-Z][\w'.-]*/g) ??
    []
  return runs
    .flatMap((run) => run.split(/\s*&\s*/))
    .map((name) =>
      name
        .replace(leading, "")
        .replace(/'s?$/, "")
        .replace(/\s+YouTube$/, "")
        .trim()
    )
    .filter((name) => name.includes(" ") && !notNames.has(name))
}

describe.each(languages)("the costumes in %s", (language, translation) => {
  it("translates every costume, and nothing else", () => {
    expect(Object.keys(translation.costumes).sort()).toEqual(
      costumes.map(({ slug }) => slug).sort()
    )
  })

  it.each(costumes.map((costume) => [costume.slug, costume] as const))(
    "%s has every part of the English",
    (slug, costume) => {
      const text = translation.costumes[slug]
      expect(text.films).toHaveLength(costume.films.length)
      expect(text.createdBy).toHaveLength(costume.createdBy.length)
      expect(text.broughtToLifeBy).toHaveLength(costume.broughtToLifeBy.length)
      expect(text.look.pieces).toHaveLength(costume.look.pieces.length)
      expect("alternative" in text.look).toBe("alternative" in costume.look)

      const words = [
        ...text.films,
        ...text.createdBy,
        ...text.broughtToLifeBy,
        text.lore,
        text.funFact,
        ...text.look.pieces,
        text.look.alternative ?? "-",
      ]
      for (const word of words) expect(word.trim(), slug).not.toBe("")

      for (const [field, english] of Object.entries(textsOf(costume))) {
        const translated = text[field as keyof ReturnType<typeof textsOf>]
        expect(translated, `${slug} ${field}`).not.toBe(english)
        if (language === "zh")
          expect(translated, `${slug} ${field}`).toMatch(han)
      }
      if (language === "zh")
        for (const piece of text.look.pieces) expect(piece, slug).toMatch(han)
    }
  )

  it.each(costumes.map((costume) => [costume.slug, costume] as const))(
    "%s keeps the people credited as they are",
    (slug, costume) => {
      const text = translation.costumes[slug]
      for (const key of ["createdBy", "broughtToLifeBy"] as const)
        costume[key].forEach((credit, index) => {
          for (const person of peopleIn(credit))
            expect(text[key][index], `${slug}: ${person}`).toContain(person)
        })
    }
  )
})

describe.each(languages)("the makeup guides in %s", (language, translation) => {
  const guides = Object.entries(makeupGuides)

  it("translates every guide, and nothing else", () => {
    expect(Object.keys(translation.guides).sort()).toEqual(
      guides.map(([slug]) => slug).sort()
    )
  })

  it.each(guides)("%s has every step of the English", (slug, guide) => {
    const text = translation.guides[slug]
    expect(text.steps).toHaveLength(guide.steps.length)
    expect("finish" in text).toBe("finish" in guide)
    expect(text.look).not.toBe(guide.look)
    guide.steps.forEach((step, index) => {
      const translated = text.steps[index]
      expect(translated.products, `${slug} ${index + 1}`).toHaveLength(
        step.products.length
      )
      for (const word of [
        translated.title,
        translated.howTo,
        ...translated.products,
      ])
        expect(word.trim(), `${slug} ${index + 1}`).not.toBe("")
      expect(translated.howTo, `${slug} ${index + 1}`).not.toBe(step.howTo)
      if (language === "zh")
        for (const word of [
          translated.title,
          translated.howTo,
          ...translated.products,
        ])
          expect(word, `${slug} ${index + 1}`).toMatch(han)
    })
    if (language === "zh") {
      expect(text.look, slug).toMatch(han)
      if (text.finish) expect(text.finish, slug).toMatch(han)
    }
  })

  it("calls every product by one name: it is also the shop's search", () => {
    const names = new Map<string, Set<string>>()
    for (const [slug, guide] of guides)
      guide.steps.forEach((step, index) =>
        step.products.forEach((product, at) => {
          const translated = translation.guides[slug].steps[index].products[at]
          names.set(product, (names.get(product) ?? new Set()).add(translated))
        })
      )
    for (const [product, translated] of names)
      expect([...translated], product).toHaveLength(1)
  })
})
