import "server-only"

import { randomUUID } from "node:crypto"

import sharp from "sharp"

import {
  ProviderError,
  type ProviderRender,
  type RenderImages,
  type RenderProvider,
} from "./provider"
import { fromHex } from "./render-plan"

/**
 * A stand-in for YouCam that costs nothing: local development and tests
 * (TRY_ON_PROVIDER=fake). Each render takes a moment, like the real one. An
 * outfit sets the garment beside the visitor; a makeup or hair step washes
 * the picture in its colors, so every step looks different.
 * Its tasks live in this server's memory: one process only, never on
 * Vercel.
 *
 * A photo whose top-left corner is pure red (#FF0000, give or take what JPEG
 * does to it) can't be read (no face, no person), so the tests can watch a
 * render fail.
 */

type Task = { render: ProviderRender; images: RenderImages; startedAt: number }

// Kept on globalThis: `next dev` reloads modules, and running tasks must
// survive that.
const store = globalThis as typeof globalThis & {
  __fakeRenderTasks?: Map<string, Task>
}
const tasks = (store.__fakeRenderTasks ??= new Map<string, Task>())

/** How long a fake render takes: FAKE_RENDER_MS, else 2.5 s. */
function renderTime() {
  const ms = Number(process.env.FAKE_RENDER_MS)
  return Number.isFinite(ms) && ms >= 0 ? ms : 2_500
}

export const fakeProvider: RenderProvider = {
  async start(render, images) {
    const task = randomUUID()
    tasks.set(task, { render, images, startedAt: Date.now() })
    return task
  },

  async check(task) {
    const found = tasks.get(task)
    if (!found) throw new ProviderError("Unknown fake task.", "failed", false)
    if (Date.now() - found.startedAt < renderTime())
      return { status: "running" }
    const { render, images } = found
    if (await unreadable(images.source)) {
      return {
        status: "error",
        reason: render.tool === "clothes" ? "body_photo" : "face_photo",
        retry: false,
        detail: "fake: the photo's top-left corner is red",
      }
    }
    const image =
      render.tool === "clothes"
        ? await dress(images.source, images.garment)
        : await paint(render, images.source)
    return { status: "done", image }
  },

  async discard(task) {
    tasks.delete(task)
  },
}

async function unreadable(image: Uint8Array) {
  const { data } = await sharp(image)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return data[0] > 235 && data[1] < 25 && data[2] < 25
}

/** The garment set over the right half of the body photo. */
async function dress(body: Uint8Array, garment?: Uint8Array) {
  const picture = sharp(body)
  const { width = 2, height = 2 } = await picture.metadata()
  if (!garment) return new Uint8Array(await picture.jpeg().toBuffer())
  const inset = await sharp(garment)
    .resize({
      width: Math.round(width / 2),
      height,
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .toBuffer()
  return new Uint8Array(
    await picture
      .composite([
        { input: inset, top: 0, left: width - Math.round(width / 2) },
      ])
      .jpeg({ quality: 88 })
      .toBuffer()
  )
}

type Painted = Extract<ProviderRender, { tool: "makeup" | "hair" }>

/** The step's colors: every palette color of its effects, or its hair. */
function colorsOf(render: Painted): string[] {
  const palettes =
    render.tool === "hair"
      ? render.palettes
      : render.effects.flatMap((effect) =>
          "palettes" in effect ? effect.palettes : []
        )
  return palettes.map((palette) => palette.color)
}

async function paint(render: Painted, image: Uint8Array) {
  const picture = sharp(image)
  const { width = 1, height = 1 } = await picture.metadata()
  const colors = colorsOf(render)
  const [red, green, blue] = average(colors)

  // Hair: the top third. Makeup: the whole face, more with each step.
  const band = render.tool === "hair" ? Math.round(height / 3) : height
  const alpha =
    render.tool === "hair" ? 0.55 : Math.min(0.45, 0.08 * colors.length)
  const wash = await sharp({
    create: {
      width,
      height: band,
      channels: 4,
      background: { r: red, g: green, b: blue, alpha },
    },
  })
    .png()
    .toBuffer()

  return new Uint8Array(
    await picture
      .composite([{ input: wash, top: 0, left: 0 }])
      .jpeg({ quality: 88 })
      .toBuffer()
  )
}

function average(colors: string[]): [number, number, number] {
  if (colors.length === 0) return [128, 128, 128]
  const sum = colors
    .map(fromHex)
    .reduce(
      (total, rgb) => [total[0] + rgb[0], total[1] + rgb[1], total[2] + rgb[2]],
      [0, 0, 0]
    )
  return sum.map((channel) => Math.round((channel / colors.length) * 255)) as [
    number,
    number,
    number,
  ]
}
