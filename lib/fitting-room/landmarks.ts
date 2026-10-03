import "server-only"

import sharp from "sharp"

import type { Anchor, Point } from "@/lib/makeup"

/**
 * Where the eyes and the mouth are on the visitor's face, read from
 * YouCam's own renders: the eye step's picture differs from the one before
 * it only where the eye makeup went, and the lip step's only on the mouth.
 * No face-detection model and no extra call: what changed is the feature.
 */

/** A patch of changed pixels: its weighted center and its box. */
export type Spot = {
  x: number
  y: number
  left: number
  right: number
  top: number
  bottom: number
  /** Changed pixels in it. */
  area: number
}

export type Face = {
  /** The eyes, the picture's left one first. */
  eyes: [Spot, Spot]
  mouth: Spot
}

/** A pixel counts as changed when a channel moved this much. */
const THRESHOLD = 28
/** Pixels are grouped in cells of GRID × GRID. */
const GRID = 4

/** The patches where `after` differs from `before`, the largest first. */
export async function changes(
  before: Uint8Array,
  after: Uint8Array
): Promise<{ spots: Spot[]; width: number; height: number }> {
  const first = await sharp(before)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width, height } = first.info
  const second = await sharp(after)
    .resize(width, height, { fit: "fill" })
    .removeAlpha()
    .raw()
    .toBuffer()

  const cols = Math.ceil(width / GRID)
  const rows = Math.ceil(height / GRID)
  const counts = new Uint16Array(cols * rows)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3
      const moved = Math.max(
        Math.abs(first.data[i] - second[i]),
        Math.abs(first.data[i + 1] - second[i + 1]),
        Math.abs(first.data[i + 2] - second[i + 2])
      )
      if (moved > THRESHOLD)
        counts[Math.floor(y / GRID) * cols + Math.floor(x / GRID)]++
    }
  }

  // Cells with a few changed pixels, joined with their eight neighbors.
  const on = (cell: number) => counts[cell] >= 3
  const seen = new Uint8Array(cols * rows)
  const spots: Spot[] = []
  for (let start = 0; start < cols * rows; start++) {
    if (seen[start] || !on(start)) continue
    const stack = [start]
    seen[start] = 1
    let area = 0
    let sx = 0
    let sy = 0
    let left = Infinity
    let right = -Infinity
    let top = Infinity
    let bottom = -Infinity
    while (stack.length) {
      const cell = stack.pop()!
      const cx = cell % cols
      const cy = Math.floor(cell / cols)
      const weight = counts[cell]
      area += weight
      sx += (cx + 0.5) * GRID * weight
      sy += (cy + 0.5) * GRID * weight
      left = Math.min(left, cx * GRID)
      right = Math.max(right, (cx + 1) * GRID)
      top = Math.min(top, cy * GRID)
      bottom = Math.max(bottom, (cy + 1) * GRID)
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx
          const ny = cy + dy
          if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue
          const next = ny * cols + nx
          if (!seen[next] && on(next)) {
            seen[next] = 1
            stack.push(next)
          }
        }
      }
    }
    spots.push({ x: sx / area, y: sy / area, left, right, top, bottom, area })
  }
  spots.sort((a, b) => b.area - a.area)
  return { spots, width, height }
}

/** The two eyes among the eye step's changes: level, apart, alike. */
export function pickEyes(
  spots: Spot[],
  width: number,
  height: number
): [Spot, Spot] | null {
  const big = spots.filter((spot) => spot.area >= width * height * 0.0004)
  let best: [Spot, Spot] | null = null
  let bestArea = 0
  for (let i = 0; i < big.length; i++) {
    for (let j = i + 1; j < big.length; j++) {
      const [a, b] = big[i].x < big[j].x ? [big[i], big[j]] : [big[j], big[i]]
      const apart = b.x - a.x
      if (Math.abs(a.y - b.y) > height * 0.06) continue
      if (apart < width * 0.12 || apart > width * 0.7) continue
      if (Math.max(a.area, b.area) / Math.min(a.area, b.area) > 4) continue
      if (a.area + b.area > bestArea) {
        best = [a, b]
        bestArea = a.area + b.area
      }
    }
  }
  return best
}

/** The mouth among the lip step's changes: below the eyes, under the nose. */
export function pickMouth(spots: Spot[], eyes: [Spot, Spot]): Spot | null {
  const span = eyes[1].x - eyes[0].x
  const middle = (eyes[0].x + eyes[1].x) / 2
  const eyeLine = (eyes[0].y + eyes[1].y) / 2
  return (
    spots.find(
      (spot) =>
        spot.y > eyeLine + span * 0.5 &&
        spot.y < eyeLine + span * 2 &&
        Math.abs(spot.x - middle) < span * 0.6 &&
        spot.right - spot.left > span * 0.2
    ) ?? null
  )
}

/** The face from the eye and lip steps' pictures and those before them. */
export async function findFace(
  eyes: { before: Uint8Array; after: Uint8Array },
  lips: { before: Uint8Array; after: Uint8Array }
): Promise<Face | null> {
  const eyeChanges = await changes(eyes.before, eyes.after)
  const pair = pickEyes(eyeChanges.spots, eyeChanges.width, eyeChanges.height)
  if (!pair) return null
  const mouth = pickMouth((await changes(lips.before, lips.after)).spots, pair)
  return mouth ? { eyes: pair, mouth } : null
}

/**
 * A mark's point in the picture: its anchor on this face, moved by
 * `dx`, `dy` eye spans along the face (it follows a tilted head). `other`
 * takes the anchor on the face's other side, mirrored.
 */
export function locate(face: Face, point: Point, other = false) {
  const [left, right] = face.eyes
  const span = Math.hypot(right.x - left.x, right.y - left.y)
  // Along the eyes, and down the face.
  const across = { x: (right.x - left.x) / span, y: (right.y - left.y) / span }
  const down = { x: -across.y, y: across.x }
  const middle = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 }
  const { mouth } = face
  // How far the mouth sits below the eyes, along the face.
  const drop = (mouth.x - middle.x) * down.x + (mouth.y - middle.y) * down.y
  const along = (from: { x: number; y: number }, by: number) => ({
    x: from.x + down.x * by,
    y: from.y + down.y * by,
  })
  const mouthMiddle = { x: (mouth.left + mouth.right) / 2, y: mouth.y }

  const anchors: Record<Anchor, { x: number; y: number }> = {
    eye: other ? right : left,
    mouthCorner: other
      ? { x: mouth.right, y: mouth.y }
      : { x: mouth.left, y: mouth.y },
    nose: along(middle, drop * 0.62),
    mouth: mouthMiddle,
    chin: along(mouthMiddle, drop * 0.55),
    forehead: along(middle, -span * 0.75),
  }
  const base = anchors[point.at]
  const dx = (point.dx ?? 0) * (other ? -1 : 1) * span
  const dy = (point.dy ?? 0) * span
  return {
    x: base.x + across.x * dx + down.x * dy,
    y: base.y + across.y * dx + down.y * dy,
    span,
  }
}
