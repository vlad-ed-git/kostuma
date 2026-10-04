import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import translations from "@/content/translations/zh.json"
import zh from "@/messages/zh.json"
import { headingChars } from "@/scripts/fonts/cjk-heading-chars.mjs"

const subset = readFileSync(path.resolve(__dirname, "cjk-heading.txt"), "utf8")

describe("the Chinese headings' face", () => {
  it("holds every character a Chinese heading uses", () => {
    const missing = headingChars(zh, translations).filter(
      (char) => !subset.includes(char)
    )
    // Run scripts/fonts/cjk-heading.mjs and subset the font again.
    expect(missing).toEqual([])
  })

  it("serves only the blocks its characters come from", () => {
    const source = readFileSync(path.resolve(__dirname, "index.ts"), "utf8")
    const range = /prop: "unicode-range", value: "([^"]+)"/.exec(source)?.[1]
    expect(range).toBeDefined()
    const blocks = range!.split(", ").map((block) => {
      const [from, to = from] = block.replace("U+", "").split("-")
      return [parseInt(from, 16), parseInt(to, 16)] as const
    })
    for (const char of subset) {
      const point = char.codePointAt(0)!
      expect(
        blocks.some(([from, to]) => point >= from && point <= to),
        char
      ).toBe(true)
    }
  })
})
