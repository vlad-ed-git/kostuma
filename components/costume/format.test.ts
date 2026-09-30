import { describe, expect, it } from "vitest"

import { filmLine } from "./format"

describe("filmLine", () => {
  it("names a film with its year", () => {
    expect(filmLine([{ title: "Scream", year: 1996 }])).toBe("Scream (1996)")
  })

  it("joins several films, in the order given", () => {
    expect(
      filmLine([
        { title: "Pearl", year: 2022 },
        { title: "X", year: 2022 },
      ])
    ).toBe("Pearl (2022) / X (2022)")
  })
})
