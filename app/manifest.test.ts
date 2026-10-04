// @vitest-environment node
import { readFileSync } from "node:fs"
import sharp from "sharp"
import { describe, expect, it } from "vitest"

import { themeColor } from "@/lib/design/theme"

import manifest from "./manifest"

// What `npm run images` draws from design/icon.svg (scripts/icons.mjs).

describe("the manifest", () => {
  it("names Kostuma, in the night's colors", () => {
    expect(manifest()).toMatchObject({
      name: "Kostuma",
      short_name: "Kostuma",
      start_url: "/",
      display: "standalone",
      background_color: themeColor,
      theme_color: themeColor,
    })
  })

  it.each(manifest().icons!.map((icon) => [icon.src, icon] as const))(
    "%s is served at its size",
    async (src, { sizes }) => {
      const { width, height, format } = await sharp(`public${src}`).metadata()
      expect(format).toBe("png")
      expect(`${width}x${height}`).toBe(sizes)
    }
  )

  it("has one maskable icon, full bleed", async () => {
    const maskable = manifest().icons!.filter(
      ({ purpose }) => purpose === "maskable"
    )
    expect(maskable).toHaveLength(1)
    // No transparent corners: the platform shapes it.
    const { data, info } = await sharp(`public${maskable[0].src}`)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    expect(info.channels).toBe(4)
    expect(data[3]).toBe(255)
  })
})

describe("the icons a browser asks for", () => {
  const design = readFileSync("design/icon.svg", "utf8")

  it("draws the tab's icon as designed", () => {
    expect(readFileSync("app/icon.svg", "utf8")).toBe(design)
  })

  it("keeps in the design what scripts/icons.mjs draws the sizes by", () => {
    // Its corners (squared for iOS and Android), its mark (scaled into the
    // maskable safe zone) and its grit (left off the favicons).
    expect(design).toContain('viewBox="0 0 512 512"')
    expect(design).toContain('rx="112"')
    expect(design).toContain('<g id="mark">')
    expect(design).toContain(' filter="url(#grit)"')
  })

  it("gives an iPhone a 180 px square, its corners left to iOS", async () => {
    const icon = sharp("app/apple-icon.png")
    expect(await icon.metadata()).toMatchObject({ width: 180, height: 180 })
    const { data } = await icon.ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    })
    expect(data[3]).toBe(255)
  })

  it("keeps a 16 and a 32 px favicon for browsers that ask for one", () => {
    const ico = readFileSync("app/favicon.ico")
    // ICONDIR: reserved 0, type 1 (icon), then the count and one entry each.
    expect(ico.readUInt16LE(0)).toBe(0)
    expect(ico.readUInt16LE(2)).toBe(1)
    const count = ico.readUInt16LE(4)
    const sizes = Array.from({ length: count }, (_, index) =>
      ico.readUInt8(6 + 16 * index)
    )
    expect(sizes).toEqual([16, 32])
  })
})
