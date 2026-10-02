import { describe, expect, it } from "vitest"

import { applyChange, type Change } from "./remote"

describe("applyChange", () => {
  it("adds at the end, each costume once", () => {
    expect(
      applyChange(["pearl"], { type: "add", slugs: ["ghostface", "pearl"] })
    ).toEqual(["pearl", "ghostface"])
    expect(applyChange([], { type: "add", slugs: ["pearl", "pearl"] })).toEqual(
      ["pearl"]
    )
  })

  it("removes and clears", () => {
    expect(
      applyChange(["pearl", "ghostface"], { type: "remove", slug: "pearl" })
    ).toEqual(["ghostface"])
    expect(applyChange(["pearl"], { type: "clear" })).toEqual([])
  })

  it.each<[string, readonly string[], Change]>([
    ["adding what is there", ["pearl"], { type: "add", slugs: ["pearl"] }],
    ["removing what is not", ["pearl"], { type: "remove", slug: "ghostface" }],
    ["clearing an empty basket", [], { type: "clear" }],
  ])("changes nothing (the same list) when %s", (_, slugs, change) => {
    expect(applyChange(slugs, change)).toBe(slugs)
  })

  it("is idempotent: a change applied twice is applied once", () => {
    const changes: Change[] = [
      { type: "add", slugs: ["pearl"] },
      { type: "remove", slug: "pearl" },
      { type: "add", slugs: ["ghostface"] },
    ]
    const once = changes.reduce(applyChange, [] as readonly string[])
    const twice = changes
      .flatMap((change) => [change, change])
      .reduce(applyChange, [] as readonly string[])
    expect(twice).toEqual(once)
  })
})
