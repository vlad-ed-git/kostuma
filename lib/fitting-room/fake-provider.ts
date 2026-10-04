import "server-only"

import { randomUUID } from "node:crypto"

import sharp from "sharp"
import { Webhook } from "standardwebhooks"

import {
  ProviderError,
  type RenderImages,
  type RenderProvider,
} from "./provider"
import { fromHex, type Render } from "./render-plan"

/**
 * A stand-in for YouCam that costs nothing, for the automated tests only
 * (the e2e build, through renderer.e2e.ts): never used by the app. Each
 * render takes a moment, like the real one. An outfit sets the garment
 * beside the visitor; a makeup or hair step washes the picture in its
 * colors, so every step looks different. Its tasks live in this server's
 * memory: one process only. Like YouCam, it deletes the garment's upload
 * with the task that made it, and announces each finished render with a
 * signed webhook (SITE_URL, YOUCAM_WEBHOOK_SECRET), so the tests drive
 * try-ons the way production does.
 *
 * A photo whose top-left corner is pure red (#FF0000, give or take what JPEG
 * does to it) can't be read (no face, no person), so the tests can watch a
 * render fail.
 */

type Task = {
  render: Render
  source: Uint8Array
  /** The garment's upload (an outfit), by its file id. */
  garmentFile?: string
  startedAt: number
}

// Kept on globalThis: modules may be loaded again, and running tasks must
// survive that.
const store = globalThis as typeof globalThis & {
  __fakeRenderTasks?: Map<string, Task>
  __fakeGarments?: Map<string, Uint8Array>
}
const tasks = (store.__fakeRenderTasks ??= new Map<string, Task>())
const garments = (store.__fakeGarments ??= new Map<string, Uint8Array>())

/** How long a fake render takes: FAKE_RENDER_MS, else 2.5 s. */
function renderTime() {
  const ms = Number(process.env.FAKE_RENDER_MS)
  return Number.isFinite(ms) && ms >= 0 ? ms : 2_500
}

export const fakeProvider: RenderProvider = {
  name: "fake",

  async start(render, { source, garment, garmentFile }: RenderImages) {
    const task = randomUUID()
    let file: string | undefined
    if (render.tool === "clothes") {
      file = garmentFile
      if (!file && garment) {
        file = `garment-${task}`
        garments.set(file, garment)
      }
    }
    tasks.set(task, {
      render,
      source,
      garmentFile: file,
      startedAt: Date.now(),
    })
    announce(task)
    return { task, ...(file && { garmentFile: file }) }
  },

  async check(task) {
    const found = tasks.get(task)
    if (!found) throw new ProviderError("Unknown fake task.", "failed", false)
    if (Date.now() - found.startedAt < renderTime())
      return { status: "running" }
    const { render, source, garmentFile } = found
    if (await unreadable(source)) {
      return {
        status: "error",
        reason: render.from === "body" ? "body_photo" : "face_photo",
        retry: false,
        detail: "fake: the photo's top-left corner is red",
      }
    }
    if (render.tool !== "clothes")
      return { status: "done", image: await wash(render, source) }
    const garment = garmentFile && garments.get(garmentFile)
    // As YouCam does once the task that uploaded it is deleted.
    if (!garment) {
      return {
        status: "error",
        reason: "failed",
        retry: false,
        detail: "fake: error_invalid_ref, the garment's file is gone",
      }
    }
    return { status: "done", image: await dress(source, garment) }
  },

  async discard(task) {
    tasks.delete(task)
    // A task goes with every file it uploaded (YouCam's task/delete).
    garments.delete(`garment-${task}`)
  },

  // Free: nothing to count.
  async balance() {
    return null
  },
}

/**
 * YouCam's webhook for a finished render (docs: Standard Webhooks), posted
 * to this server once the render is done, when the build knows where it
 * runs and the secret (playwright.config.ts).
 */
function announce(task: string) {
  const site = process.env.SITE_URL
  const secret = process.env.YOUCAM_WEBHOOK_SECRET
  if (!site || !secret) return
  setTimeout(() => {
    const body = JSON.stringify({
      created_at: Math.floor(Date.now() / 1000),
      data: { task_id: task, task_status: "success" },
    })
    const id = `msg_${task}`
    const sent = new Date()
    fetch(new URL("/api/youcam/webhook", site), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "webhook-id": id,
        "webhook-timestamp": String(Math.floor(sent.getTime() / 1000)),
        "webhook-signature": new Webhook(secret).sign(id, sent, body),
      },
      body,
    }).catch(() => {
      // The page's asking finds the picture anyway.
    })
  }, renderTime() + 50)
}

async function unreadable(image: Uint8Array) {
  const { data } = await sharp(image)
    .extract({ left: 0, top: 0, width: 1, height: 1 })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return data[0] > 235 && data[1] < 25 && data[2] < 25
}

/** The garment set over the right half of the body (or face) photo. */
async function dress(body: Uint8Array, garment: Uint8Array) {
  const picture = sharp(body)
  const { width = 2, height = 2 } = await picture.metadata()
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

type Painted = Exclude<Render, { tool: "clothes" }>

/** The step's colors: every palette color of its effects, or its hair's. */
function colorsOf(render: Painted): string[] {
  if (render.tool === "hair")
    return render.palettes.map((palette) => palette.color)
  return render.effects
    .flatMap((effect) => ("palettes" in effect ? effect.palettes : []))
    .map((palette) => palette.color)
}

async function wash(render: Painted, image: Uint8Array) {
  const picture = sharp(image)
  const { width = 1, height = 1 } = await picture.metadata()
  const colors = colorsOf(render)
  const [red, green, blue] = average(colors)

  // Hair: the top third. Makeup: the whole face, more with each color.
  const hair = render.tool === "hair"
  const band = hair ? Math.round(height / 3) : height
  const alpha = hair ? 0.55 : Math.min(0.45, 0.08 * Math.max(2, colors.length))
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
