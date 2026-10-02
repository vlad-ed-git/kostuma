import { describe, expect, it } from "vitest"

import { localeOfPath } from "./routing"

describe("localeOfPath", () => {
  it.each([
    ["/es/basket", "es"],
    ["/zh", "zh"],
    ["/zh/costumes/ghostface", "zh"],
    ["/basket", "en"],
    ["/", "en"],
    ["/en/basket", "en"],
    ["/esx/basket", "en"],
    ["/basket/es", "en"],
    [null, "en"],
  ])("reads %s as %s", (path, locale) => {
    expect(localeOfPath(path)).toBe(locale)
  })
})
