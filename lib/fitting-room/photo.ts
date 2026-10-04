import "server-only"

import { createHash } from "node:crypto"

import sharp from "sharp"

import type { Hex } from "@/lib/makeup"

import {
  MAX_PHOTO_BYTES,
  MAX_SIDE,
  photoRules,
  type PhotoProblem,
  sizeProblem,
} from "./photo-rules"
import { toHex } from "./render-plan"
import type { FacePhoto, Photo, PhotoKind } from "./try-on"

/**
 * The visitor's photos, checked and prepared on the server before anything
 * is rendered (photo-rules.ts): turned upright, shrunk to the size the
 * renders take, flattened onto white, saved as JPEG without the camera's
 * metadata (no location, no device). A face photo also gets its skin's
 * color, for the guides' paler foundations.
 */

export class PhotoError extends Error {
  readonly problem: PhotoProblem

  constructor(problem: PhotoProblem) {
    super(`Photo: ${problem}`)
    this.name = "PhotoError"
    this.problem = problem
  }
}

const formats = new Set(["jpeg", "png", "webp"])

/**
 * Pixels sharp may decode: 25 megapixels, more than any phone's photo the
 * browser shrank first (a crafted file of a few kilobytes can claim far
 * more, and cost hundreds of megabytes to open).
 */
const PIXEL_LIMIT = 25_000_000

export type Prepared<P extends Photo> = { photo: P; image: Uint8Array }

export async function preparePhoto(
  kind: "face",
  file: Uint8Array
): Promise<Prepared<FacePhoto>>
export async function preparePhoto(
  kind: "body",
  file: Uint8Array
): Promise<Prepared<Photo>>
export async function preparePhoto(
  kind: PhotoKind,
  file: Uint8Array
): Promise<Prepared<Photo | FacePhoto>> {
  if (file.byteLength > MAX_PHOTO_BYTES) throw new PhotoError("too_big")

  let upright: { width: number; height: number }
  try {
    const metadata = await sharp(file, {
      limitInputPixels: PIXEL_LIMIT,
    }).metadata()
    if (!metadata.format || !formats.has(metadata.format))
      throw new PhotoError("unreadable")
    // From the header alone, before a pixel is decoded.
    if ((metadata.width ?? 0) > MAX_SIDE || (metadata.height ?? 0) > MAX_SIDE)
      throw new PhotoError("too_big")
    upright = metadata.autoOrient
  } catch (error) {
    if (error instanceof PhotoError) throw error
    throw new PhotoError("unreadable")
  }
  const problem = sizeProblem(kind, upright.width, upright.height)
  if (problem) throw new PhotoError(problem)

  const [boxWidth, boxHeight] = photoRules[kind].box
  const portrait = upright.height >= upright.width
  let output: Buffer
  try {
    output = await sharp(file, { limitInputPixels: PIXEL_LIMIT })
      .autoOrient()
      .resize({
        width: portrait ? boxWidth : boxHeight,
        height: portrait ? boxHeight : boxWidth,
        fit: "inside",
        withoutEnlargement: true,
      })
      .flatten({ background: "#FFFFFF" })
      .toColourspace("srgb")
      .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
      .toBuffer()
  } catch {
    // A truncated or broken file that only fails once decoded.
    throw new PhotoError("unreadable")
  }

  const image = new Uint8Array(output)
  const { width = 0, height = 0 } = await sharp(image).metadata()
  const id = createHash("sha256").update(image).digest("hex").slice(0, 32)
  const photo: Photo = { id, width, height }
  if (kind === "body") return { photo, image }
  return { photo: { ...photo, skin: await measureSkin(image) }, image }
}

/** When too little of the middle looks like skin: a medium skin. */
const UNKNOWN_SKIN: Hex = "#C69C82"

/**
 * The skin's color on a head-and-shoulders photo: the median of the pixels
 * in the middle of the picture (where the face is) whose color is a skin's,
 * by the classic YCbCr skin range (Chai & Ngan), which holds for light and
 * deep skin alike. Hair, eyes, lips and the background fall outside it.
 */
export async function measureSkin(image: Uint8Array): Promise<Hex> {
  const { data, info } = await sharp(image)
    .resize({ width: 96, height: 128, fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const reds: number[] = []
  const greens: number[] = []
  const blues: number[] = []
  const { width, height } = info
  for (let y = Math.floor(height * 0.2); y < Math.floor(height * 0.75); y++) {
    for (let x = Math.floor(width * 0.25); x < Math.floor(width * 0.75); x++) {
      const at = (y * width + x) * 3
      const [r, g, b] = [data[at], data[at + 1], data[at + 2]]
      const luma = 0.299 * r + 0.587 * g + 0.114 * b
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
      if (luma < 35 || luma > 245) continue
      if (cb < 77 || cb > 127 || cr < 133 || cr > 173) continue
      reds.push(r)
      greens.push(g)
      blues.push(b)
    }
  }
  const middle = Math.floor(height * 0.55) * Math.floor(width * 0.5)
  if (reds.length < middle * 0.05) return UNKNOWN_SKIN
  return toHex([median(reds) / 255, median(greens) / 255, median(blues) / 255])
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}
