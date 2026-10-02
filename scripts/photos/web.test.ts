// @vitest-environment node
import sharp from "sharp"
import { describe, expect, it } from "vitest"

import { WEB_SIDE, webCopy } from "./web.mjs"

/** A cut-out: an opaque red box in the middle of a transparent PNG. */
async function cutOut(width: number, height: number) {
  return sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: {
          create: {
            width: Math.round(width / 2),
            height: Math.round(height / 2),
            channels: 4,
            background: { r: 200, g: 16, b: 29, alpha: 1 },
          },
        },
        gravity: "center",
      },
    ])
    .png()
    .toBuffer()
}

describe("webCopy", () => {
  it("fits a master's long side to the web side, keeping its shape", async () => {
    const copy = await webCopy(await cutOut(1024, 2048))
    expect(copy).toMatchObject({ width: WEB_SIDE / 2, height: WEB_SIDE })
    const wide = await webCopy(await cutOut(2048, 1152))
    expect(wide).toMatchObject({ width: WEB_SIDE, height: 788 })
  })

  it("never enlarges a smaller master", async () => {
    expect(await webCopy(await cutOut(640, 853))).toMatchObject({
      width: 640,
      height: 853,
    })
  })

  it("is WebP, as wide and tall as it says, with its transparency", async () => {
    const { content, width, height } = await webCopy(await cutOut(800, 1000))
    const meta = await sharp(content).metadata()
    expect(meta).toMatchObject({
      format: "webp",
      width,
      height,
      hasAlpha: true,
    })
    // The corner stays see-through; the middle stays the subject's red.
    const pixels = await sharp(content).ensureAlpha().raw().toBuffer()
    expect(pixels[3]).toBe(0)
    const middle = ((height / 2) * width + width / 2) * 4
    expect(pixels[middle + 3]).toBe(255)
    expect(pixels[middle]).toBeGreaterThan(180)
  })

  it("is far lighter than the lossless master", async () => {
    const noise = await sharp({
      create: {
        width: 1024,
        height: 2048,
        channels: 4,
        background: { r: 90, g: 80, b: 70, alpha: 1 },
        noise: { type: "gaussian", mean: 128, sigma: 30 },
      },
    })
      .blur(1.2)
      .png({ compressionLevel: 9 })
      .toBuffer()
    const { content } = await webCopy(noise)
    expect(content.length).toBeLessThan(noise.length / 4)
  })

  it("gives the same bytes for the same master: its name never changes", async () => {
    const master = await cutOut(900, 1200)
    const [a, b] = await Promise.all([webCopy(master), webCopy(master)])
    expect(a.content.equals(b.content)).toBe(true)
  })
})
