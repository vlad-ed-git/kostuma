// @vitest-environment node
import sharp from "sharp"
import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { measureSkin, PhotoError, preparePhoto } = await import("./photo")
const { fitsOneSend, MAX_SEND_BYTES, sendLongSide, sizeProblem } =
  await import("./photo-rules")

/** A plain photo of this size: a color, with a skin-colored oval in the middle. */
async function photo(
  width: number,
  height: number,
  {
    format = "jpeg",
    skin = "#C68642",
    background = "#3050A0",
    orientation,
  }: {
    format?: "jpeg" | "png" | "webp" | "gif"
    skin?: string
    background?: string
    orientation?: number
  } = {}
) {
  const oval = Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${background}"/><ellipse cx="${width / 2}" cy="${height * 0.45}" rx="${width * 0.3}" ry="${height * 0.3}" fill="${skin}"/></svg>`
  )
  let image = sharp(oval)
  if (orientation) image = image.withMetadata({ orientation })
  return new Uint8Array(await image.toFormat(format).toBuffer())
}

const problemOf = (promise: Promise<unknown>) =>
  promise.then(
    () => null,
    (error: unknown) => (error instanceof PhotoError ? error.problem : error)
  )

describe("sizeProblem", () => {
  it("takes a photo big enough for its kind", () => {
    expect(sizeProblem("face", 768, 1024)).toBeNull()
    expect(sizeProblem("body", 960, 1440)).toBeNull()
  })

  it.each([
    ["face", 400, 600, "too_small"],
    ["face", 480, 600, "too_small"],
    ["body", 500, 900, "too_small"],
    ["body", 600, 700, "too_small"],
    ["face", 500, 1600, "odd_shape"],
    ["face", 0, 100, "unreadable"],
  ] as const)("refuses a %s photo of %i × %i: %s", (kind, w, h, problem) => {
    expect(sizeProblem(kind, w, h)).toBe(problem)
  })
})

describe("preparePhoto", () => {
  it("shrinks a big face photo into 768 × 1024, as a JPEG", async () => {
    const { photo: kept, image } = await preparePhoto(
      "face",
      await photo(1536, 2048, { format: "png" })
    )
    expect(kept).toMatchObject({ width: 768, height: 1024 })
    const metadata = await sharp(image).metadata()
    expect(metadata).toMatchObject({ format: "jpeg", width: 768, height: 1024 })
  })

  it("turns the box for a landscape photo", async () => {
    const { photo: kept } = await preparePhoto("face", await photo(2048, 1536))
    expect(kept).toMatchObject({ width: 1024, height: 768 })
  })

  it("shrinks a body photo into 1080 × 1440", async () => {
    const { photo: kept } = await preparePhoto("body", await photo(3000, 4000))
    expect(kept).toMatchObject({ width: 1080, height: 1440 })
  })

  it("never enlarges a photo already small enough", async () => {
    const { photo: kept } = await preparePhoto("face", await photo(600, 800))
    expect(kept).toMatchObject({ width: 600, height: 800 })
  })

  it("turns a photo upright and drops the camera's metadata", async () => {
    // Stored sideways (1000 × 700), shown upright (700 × 1000).
    const sideways = await photo(1000, 700, { orientation: 6 })
    const { photo: kept, image } = await preparePhoto("face", sideways)
    expect(kept).toMatchObject({ width: 700, height: 1000 })
    const metadata = await sharp(image).metadata()
    expect(metadata.orientation).toBeUndefined()
    expect(metadata.exif).toBeUndefined()
  })

  it("names a photo by its content", async () => {
    const file = await photo(800, 1000)
    const first = await preparePhoto("face", file)
    const second = await preparePhoto("face", file)
    expect(first.photo.id).toMatch(/^[0-9a-f]{32}$/)
    expect(second.photo.id).toBe(first.photo.id)
    const other = await preparePhoto(
      "face",
      await photo(800, 1000, { skin: "#8D5524" })
    )
    expect(other.photo.id).not.toBe(first.photo.id)
  })

  it("measures the skin of a face photo, not of a body photo", async () => {
    const face = await preparePhoto("face", await photo(800, 1000))
    expect(face.photo.skin).toMatch(/^#[0-9A-F]{6}$/)
    const body = await preparePhoto("body", await photo(800, 1200))
    expect(body.photo).not.toHaveProperty("skin")
  })

  it.each([
    ["too small", () => photo(300, 400), "too_small"],
    ["a strip", () => photo(600, 2400), "odd_shape"],
    ["a GIF", () => photo(800, 1000, { format: "gif" }), "unreadable"],
    [
      "not an image",
      async () => new TextEncoder().encode("hello"),
      "unreadable",
    ],
    ["empty", async () => new Uint8Array(), "unreadable"],
  ] as const)("refuses a photo that is %s", async (_name, make, problem) => {
    expect(await problemOf(preparePhoto("face", await make()))).toBe(problem)
  })

  it("calls an AVIF unreadable, never an iPhone's HEIC (both are HEIF)", async () => {
    const avif = new Uint8Array(
      await sharp({
        create: { width: 900, height: 1200, channels: 3, background: "#888" },
      })
        .avif()
        .toBuffer()
    )
    expect(await problemOf(preparePhoto("face", avif))).toBe("unreadable")
  })

  it("refuses a photo over 4096 px a side from its header, before decoding it", async () => {
    // Plain color: a few kilobytes that would open into 33 megabytes.
    const huge = new Uint8Array(
      await sharp({
        create: { width: 4097, height: 2800, channels: 3, background: "#888" },
      })
        .png()
        .toBuffer()
    )
    expect(await problemOf(preparePhoto("body", huge))).toBe("too_big")
  })

  it("refuses a file far too big before opening it", async () => {
    const huge = new Uint8Array(9 * 1024 * 1024)
    expect(await problemOf(preparePhoto("body", huge))).toBe("too_big")
  })

  it("refuses a photo cut short", async () => {
    const whole = await photo(800, 1000)
    const cut = whole.slice(0, Math.floor(whole.length / 3))
    expect(await problemOf(preparePhoto("face", cut))).toBe("unreadable")
  })
})

describe("measureSkin", () => {
  const distance = (a: string, b: string) => {
    const channels = (hex: string) =>
      [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16))
    const [x, y] = [channels(a), channels(b)]
    return Math.max(...x.map((value, index) => Math.abs(value - y[index])))
  }

  it.each(["#E8C4A8", "#C68642", "#8D5524", "#5A3A28"])(
    "finds the skin %s in the middle of the photo",
    async (skin) => {
      const measured = await measureSkin(await photo(600, 800, { skin }))
      expect(distance(measured, skin)).toBeLessThanOrEqual(6)
    }
  )

  it("falls back to a medium skin when nothing looks like skin", async () => {
    const measured = await measureSkin(
      await photo(600, 800, { skin: "#2040FF", background: "#20FF40" })
    )
    expect(measured).toBe("#C69C82")
  })
})

describe("sending the photos", () => {
  it("sends each photo at the size the server keeps", () => {
    expect(sendLongSide("face")).toBe(1024)
    expect(sendLongSide("body")).toBe(1440)
  })

  it("sends both together only within the server's 4 MB", () => {
    expect(MAX_SEND_BYTES).toBeLessThan(4 * 1024 * 1024)
    expect(fitsOneSend([400_000, 900_000])).toBe(true)
    expect(fitsOneSend([MAX_SEND_BYTES, 1])).toBe(false)
  })
})
