// @vitest-environment node
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { cn, typeScale } from "./utils"

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8")

describe("cn", () => {
  it("knows every font size the stylesheet defines", () => {
    const sizes = [...css.matchAll(/--text-([\w-]+?):/g)]
      .map(([, name]) => name)
      .filter((name) => !name.includes("--"))
    expect(new Set(sizes)).toEqual(new Set(typeScale))
  })

  it.each(typeScale)("keeps text-%s next to a text color", (size) => {
    expect(cn(`text-${size}`, "text-muted-foreground")).toBe(
      `text-${size} text-muted-foreground`
    )
  })

  it("lets a later size replace an earlier one", () => {
    expect(cn("text-label", "text-sm", "text-micro")).toBe("text-micro")
  })

  it("still resolves ordinary conflicts", () => {
    expect(cn("px-2 text-sm", "px-4", false && "hidden")).toBe("text-sm px-4")
  })
})
