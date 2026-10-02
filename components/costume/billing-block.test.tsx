import { screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { renderInEnglish } from "@/test/intl"

import { BillingBlock } from "./billing-block"

const texts = (role: string) =>
  screen.getAllByRole(role).map((element) => element.textContent)

describe("BillingBlock", () => {
  it("credits the creators and the performers, role over names", () => {
    renderInEnglish(
      <BillingBlock
        costume={{
          createdBy: ["John Carpenter & Debra Hill"],
          broughtToLifeBy: [
            "Nick Castle played 'The Shape'",
            "Tony Moran was the unmasked face",
          ],
        }}
      />
    )
    expect(texts("term")).toEqual(["Created by", "Brought to life by"])
    expect(texts("definition")).toEqual([
      "John Carpenter & Debra Hill",
      "Nick Castle played 'The Shape'",
      "Tony Moran was the unmasked face",
    ])
  })

  it("leaves out a role nobody filled", () => {
    renderInEnglish(
      <BillingBlock
        costume={{ createdBy: ["Stephen King"], broughtToLifeBy: [] }}
      />
    )
    expect(texts("term")).toEqual(["Created by"])
    expect(texts("definition")).toEqual(["Stephen King"])
  })
})
