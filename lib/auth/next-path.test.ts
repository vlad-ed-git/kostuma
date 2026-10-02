import { describe, expect, it } from "vitest"

import { safeNext, withNext } from "./next-path"

describe("safeNext", () => {
  it.each([
    ["/basket", "/basket"],
    ["/costumes/ghostface?x=1#look", "/costumes/ghostface?x=1#look"],
    ["/", "/"],
  ])("keeps a path on this site: %s", (value, path) => {
    expect(safeNext(value)).toBe(path)
  })

  it.each([
    "//evil.example",
    "/\\evil.example",
    "https://evil.example/basket",
    "javascript:alert(1)",
    "basket",
    "",
    undefined,
    ["/basket"],
    42,
  ])("sends anything else home: %j", (value) => {
    expect(safeNext(value)).toBe("/")
  })
})

describe("withNext", () => {
  it("keeps the way back, encoded", () => {
    expect(withNext("/sign-in", "/costumes/pearl?x=1")).toBe(
      "/sign-in?next=%2Fcostumes%2Fpearl%3Fx%3D1"
    )
  })

  it("leaves home out", () => {
    expect(withNext("/register", "/")).toBe("/register")
  })
})
