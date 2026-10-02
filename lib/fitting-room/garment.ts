import "server-only"

import sharp from "sharp"

import { getCostume } from "@/lib/catalog"

import { ProviderError } from "./provider"

/**
 * The garment YouCam tries on: the costume's first photo (a cut-out of
 * someone wearing it, its web copy on Cloud Storage) set on white, as a
 * product shot is, and saved as JPEG (cloth-v4 takes JPEG or PNG). Kept in
 * memory per costume once made.
 */

const TIMEOUT_MS = 15_000

const kept = globalThis as typeof globalThis & {
  __garments?: Map<string, Promise<Uint8Array>>
}
const garments = (kept.__garments ??= new Map<string, Promise<Uint8Array>>())

export function garmentImage(slug: string): Promise<Uint8Array> {
  let garment = garments.get(slug)
  if (!garment) {
    garment = make(slug)
    garments.set(slug, garment)
    // A failure is tried again next time.
    garment.catch(() => garments.delete(slug))
  }
  return garment
}

async function make(slug: string) {
  const photo = getCostume(slug)?.images[0]
  if (!photo) {
    throw new ProviderError(
      `No photo for the costume ${slug}.`,
      "failed",
      false
    )
  }
  let file: ArrayBuffer
  try {
    const response = await fetch(photo.url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    file = await response.arrayBuffer()
  } catch (error) {
    throw new ProviderError(
      `The garment of ${slug} could not be loaded: ${String(error)}`,
      "failed",
      true
    )
  }
  return new Uint8Array(
    await sharp(file)
      .flatten({ background: "#FFFFFF" })
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toBuffer()
  )
}
