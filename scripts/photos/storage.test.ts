// @vitest-environment node
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import {
  listedGarments,
  listedImages,
  objectPath,
  publicUrl,
  withPhotos,
} from "./storage.mjs"

const data = `export const costumes: Costume[] = [
  {
    slug: "ghostface",
    images: ["ghostface.png"],
    stores: [],
  },
  {
    slug: "dollface",
    images: ["dollface.png", "strangers_1.png"],
    stores: [],
  },
]
`

const photo = (file: string) => ({
  file,
  url: `https://example.com/${file}?alt=media&token=t`,
  width: 1000,
  height: 1500,
})

describe("objectPath", () => {
  it("names the object after the file and its content", () => {
    const path = objectPath("ghostface.png", new Uint8Array([1, 2, 3]))
    expect(path).toMatch(/^costumes\/ghostface\.[a-f0-9]{10}\.png$/)
    expect(objectPath("ghostface.png", new Uint8Array([1, 2, 3]))).toBe(path)
    expect(objectPath("ghostface.png", new Uint8Array([1, 2, 4]))).not.toBe(
      path
    )
  })

  it("names a web copy after its master, with its own type and content", () => {
    expect(objectPath("ghostface.png", new Uint8Array([7]), "webp")).toMatch(
      /^costumes\/ghostface\.[a-f0-9]{10}\.webp$/
    )
  })

  it("only makes names storage.rules lets anyone read", () => {
    // The pattern in storage.rules, as the rules engine applies it: whole.
    const rules = readFileSync(
      fileURLToPath(new URL("../../storage.rules", import.meta.url)),
      "utf8"
    )
    const [, pattern] = /photo\.matches\('([^']+)'\)/.exec(rules) ?? []
    const readable = new RegExp(`^${pattern}$`)
    for (const type of ["png", "webp"] as const) {
      const path = objectPath("strangers_1.png", new Uint8Array([9]), type)
      expect(path.split("/")[1]).toMatch(readable)
    }
    expect("strangers_1.0123456789.svg").not.toMatch(readable)
  })

  it("refuses anything but a costume photo name and type", () => {
    expect(() => objectPath("Ghostface.jpg", new Uint8Array())).toThrow()
    expect(() => objectPath("../x.png", new Uint8Array())).toThrow()
    expect(() =>
      // @ts-expect-error: only png and webp are stored
      objectPath("ghostface.png", new Uint8Array(), "svg")
    ).toThrow()
  })
})

describe("publicUrl", () => {
  it("is the object's address on Firebase Storage, with no token", () => {
    expect(
      publicUrl(
        "kostuma-73f77.firebasestorage.app",
        "costumes/strangers_1.0123456789.webp"
      )
    ).toBe(
      "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fstrangers_1.0123456789.webp?alt=media"
    )
  })
})

describe("listedImages and withPhotos", () => {
  it("lists each costume's files in order", () => {
    expect(listedImages(data)).toEqual([
      ["ghostface.png"],
      ["dollface.png", "strangers_1.png"],
    ])
  })

  it("writes the photos in place of the names, and reads them back", () => {
    const photos = new Map(
      ["ghostface.png", "dollface.png", "strangers_1.png"].map((file) => [
        file,
        photo(file),
      ])
    )
    const updated = withPhotos(data, photos)
    expect(updated).toContain(
      'images: [{ file: "ghostface.png", url: "https://example.com/ghostface.png?alt=media&token=t", width: 1000, height: 1500 }],'
    )
    expect(listedImages(updated)).toEqual(listedImages(data))
    // Running it again (new URLs) replaces the photos, never duplicates them.
    expect(listedImages(withPhotos(updated, photos))).toEqual(
      listedImages(data)
    )
  })

  it("fails when a listed file has no photo", () => {
    expect(() => withPhotos(data, new Map())).toThrow(/ghostface\.png/)
  })
})

describe("listedGarments and withPhotos", () => {
  const withGarment = `export const costumes: Costume[] = [
  {
    slug: "pirate-clark",
    garment: "pirate-clark-costume.png",
    images: ["pirate-clark.png"],
    stores: [],
  },
  {
    slug: "ghostface",
    images: ["ghostface.png"],
    stores: [],
  },
]
`
  const photos = new Map(
    ["pirate-clark-costume.png", "pirate-clark.png", "ghostface.png"].map(
      (file) => [file, photo(file)]
    )
  )

  it("lists the garments, apart from the photos shown", () => {
    expect(listedGarments(withGarment)).toEqual(["pirate-clark-costume.png"])
    expect(listedImages(withGarment)).toEqual([
      ["pirate-clark.png"],
      ["ghostface.png"],
    ])
    expect(listedGarments(data)).toEqual([])
  })

  it("writes the garment's photo in place of its name, and reads it back", () => {
    const written = withPhotos(withGarment, photos)
    expect(written).toContain(
      `garment: { file: "pirate-clark-costume.png", url: "https://example.com/pirate-clark-costume.png?alt=media&token=t", width: 1000, height: 1500 },\n    images: [{ file: "pirate-clark.png"`
    )
    expect(listedGarments(written)).toEqual(["pirate-clark-costume.png"])
    // Written again (as Prettier spreads it over lines): the same.
    const spread = written.replace(
      /garment: \{ (.*?) \},/,
      (_, inner: string) =>
        `garment: {\n      ${inner.split(", ").join(",\n      ")},\n    },`
    )
    expect(withPhotos(spread, photos)).toBe(written)
  })

  it("fails when a garment has no photo", () => {
    const shown = new Map(
      ["pirate-clark.png", "ghostface.png"].map((file) => [file, photo(file)])
    )
    expect(() => withPhotos(withGarment, shown)).toThrow(
      "No uploaded photo for pirate-clark-costume.png"
    )
  })
})
