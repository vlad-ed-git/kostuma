import { describe, expect, it } from "vitest"

import {
  MAX_ITEMS,
  cleanSlugs,
  isSlug,
  readAccount,
  readGuest,
  writeAccount,
  writeGuest,
} from "./codec"

const known = new Set(["ghostface", "michael-myers", "pearl"])

describe("reading the guest basket", () => {
  it("reads back what it wrote, in the order added", () => {
    expect(readGuest(writeGuest(["pearl", "ghostface"]), known)).toEqual([
      "pearl",
      "ghostface",
    ])
  })

  it("is empty when nothing was stored", () => {
    expect(readGuest(null, known)).toEqual([])
  })

  it.each([
    ["not JSON", "{oops"],
    ["JSON of another kind", "42"],
    ["null", "null"],
    ["a bare list", JSON.stringify(["ghostface"])],
    ["no version", JSON.stringify({ slugs: ["ghostface"] })],
    ["an older version", JSON.stringify({ v: 0, slugs: ["ghostface"] })],
    ["a newer version", JSON.stringify({ v: 2, slugs: ["ghostface"] })],
    ["slugs that are not a list", JSON.stringify({ v: 1, slugs: "pearl" })],
  ])("survives %s: an empty basket", (_, raw) => {
    expect(readGuest(raw, known)).toEqual([])
  })

  it("never parses a value too large to be a basket", () => {
    const huge = writeGuest(["ghostface", "x".repeat(40_000)])
    expect(readGuest(huge, known)).toEqual([])
  })

  it("drops costumes that no longer exist, and anything not a costume", () => {
    const raw = JSON.stringify({
      v: 1,
      slugs: ["the-wolf-man", "pearl", 7, null, { slug: "ghostface" }, "Pearl"],
    })
    expect(readGuest(raw, known)).toEqual(["pearl"])
  })

  it("keeps each costume once, where it was first added", () => {
    const raw = writeGuest(["pearl", "ghostface", "pearl"])
    expect(readGuest(raw, known)).toEqual(["pearl", "ghostface"])
  })
})

describe("reading the account's copy", () => {
  it("reads back whose it is and what it holds", () => {
    expect(readAccount(writeAccount("alice", ["pearl"]), known)).toEqual({
      uid: "alice",
      slugs: ["pearl"],
    })
  })

  it.each([
    ["nothing", null],
    ["no account", JSON.stringify({ v: 1, slugs: ["pearl"] })],
    ["an empty uid", JSON.stringify({ v: 1, uid: "", slugs: [] })],
    ["a uid too long", JSON.stringify({ v: 1, uid: "a".repeat(129) })],
    ["another version", JSON.stringify({ v: 2, uid: "alice", slugs: [] })],
    ["not JSON", "]"],
  ])("is nothing from %s", (_, raw) => {
    expect(readAccount(raw, known)).toBeUndefined()
  })
})

describe("cleanSlugs", () => {
  it("stops at the most a basket may hold", () => {
    const many = Array.from({ length: MAX_ITEMS + 5 }, (_, i) => `c-${i}`)
    expect(cleanSlugs(many, new Set(many))).toHaveLength(MAX_ITEMS)
  })
})

describe("isSlug", () => {
  it.each(["ghostface", "michael-myers", "x", "chucky-2"])("takes %s", (slug) =>
    expect(isSlug(slug)).toBe(true)
  )

  it.each(["", "Pearl", "-pearl", "pearl-", "a--b", "a b", "a.b", "é"])(
    "refuses %j",
    (slug) => expect(isSlug(slug)).toBe(false)
  )

  it("refuses a slug longer than 64 characters", () => {
    expect(isSlug("a".repeat(64))).toBe(true)
    expect(isSlug("a".repeat(65))).toBe(false)
  })
})
