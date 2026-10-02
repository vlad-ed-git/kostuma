import type { PhotoKind } from "./try-on"

/**
 * What the visitor's two photos must be, checked twice: in the browser when
 * one is picked (a quick answer), and on the server before anything is
 * rendered (the answer that counts, lib/fitting-room/photo.ts). Plain
 * checks: whether the file is an image, its size and shape. No AI.
 */

/** Why a photo can't be used. */
export type PhotoProblem =
  /** Not an image this site can open (JPEG, PNG or WebP). */
  | "unreadable"
  /** Smaller than the renders need. */
  | "too_small"
  /** A long strip, not a photo of a person. */
  | "odd_shape"
  /** A file far too big to be a photo. */
  | "too_big"

export type PhotoRule = {
  /** The shorter and the longer side's least pixels. */
  minShort: number
  minLong: number
  /**
   * The size it is kept at, upright (width × height); a landscape photo
   * turns the box. YouCam's limits: makeup and hair under 1080 px tall,
   * outfits up to 4096 px a side, 1024 × 768 recommended.
   */
  box: readonly [number, number]
}

export const photoRules: Record<PhotoKind, PhotoRule> = {
  // A head-and-shoulders close-up: the face at least ~300 px wide.
  face: { minShort: 480, minLong: 640, box: [768, 1024] },
  // Head to toe: enough height for the outfit's details.
  body: { minShort: 512, minLong: 768, box: [1080, 1440] },
}

/** The longest side may be at most this many times the shortest. */
export const MAX_RATIO = 3

/** The browser shrinks a photo to this long side before sending it. */
export const SEND_LONG_SIDE = 2048

/** The largest file the server takes for one photo. */
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024

/** What's wrong with a photo of this size, if anything. */
export function sizeProblem(
  kind: PhotoKind,
  width: number,
  height: number
): PhotoProblem | null {
  const short = Math.min(width, height)
  const long = Math.max(width, height)
  if (!(short > 0)) return "unreadable"
  if (long / short > MAX_RATIO) return "odd_shape"
  const rule = photoRules[kind]
  if (short < rule.minShort || long < rule.minLong) return "too_small"
  return null
}
