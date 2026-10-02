import { describe, expect, it } from "vitest"

import { initials } from "./initials"

describe("initials", () => {
  it.each([
    ["Wednesday Addams", "WA"],
    ["wednesday", "W"],
    ["  Carrie   White  ", "CW"],
    ["Jean-Luc Picard Jr", "JP"],
    ["Élodie Ødegaard", "ÉØ"],
    ["王小明", "王"],
    ["😱 Scream", "😱S"],
  ])("%j → %s", (name, letters) => {
    expect(initials(name)).toBe(letters)
  })

  it("falls back to the email, then to nothing", () => {
    expect(initials("", "wednesday@example.com")).toBe("W")
    expect(initials("  ", "")).toBe("")
  })
})
