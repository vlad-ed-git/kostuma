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

  it("writes each film as the language does, the year as it is", () => {
    const chinese = ({ title, year }: { title: string; year: string }) =>
      `《${title}》（${year}）`
    expect(
      filmLine(
        [
          { title: "珀尔", year: 2022 },
          { title: "恐怖X档案", year: 2022 },
        ],
        chinese
      )
    ).toBe("《珀尔》（2022） / 《恐怖X档案》（2022）")
  })
})
