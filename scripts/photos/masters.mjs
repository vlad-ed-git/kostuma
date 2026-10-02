// The rules for a costume photo's master (see build-masters.mjs): its size
// and the box around the cut-out's subject. Tested in masters.test.ts.

/** The long side of every master, in pixels: enough for YouCam's try-on and
 * for the costume page at 2×, and never an enlargement. */
export const MASTER_SIDE = 2048

/** The transparent margin kept around a cut-out's subject, as a share of the
 * subject's longer side. */
export const MARGIN = 0.04

/**
 * @typedef {{ left: number, top: number, width: number, height: number }} Box
 */

/**
 * The size a master gets: the source scaled to fit a MASTER_SIDE square,
 * never enlarged.
 * @param {number} width
 * @param {number} height
 * @returns {{ width: number, height: number }}
 */
export function masterSize(width, height) {
  const scale = Math.min(1, MASTER_SIDE / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

/**
 * The smallest box holding every pixel whose alpha reaches `threshold`
 * (faint specks below it are ignored). Null when nothing is that opaque.
 * @param {Uint8Array} alpha one byte per pixel, row by row
 * @param {number} width
 * @param {number} height
 * @param {number} [threshold]
 * @returns {Box | null}
 */
export function subjectBox(alpha, width, height, threshold = 16) {
  if (alpha.length !== width * height) {
    throw new Error(
      `Expected ${width * height} alpha values, got ${alpha.length}`
    )
  }
  let left = width
  let right = -1
  let top = height
  let bottom = -1
  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 0; x < width; x++) {
      if (alpha[row + x] >= threshold) {
        if (x < left) left = x
        if (x > right) right = x
        if (y < top) top = y
        bottom = y
      }
    }
  }
  if (right < 0) return null
  return { left, top, width: right - left + 1, height: bottom - top + 1 }
}

/**
 * The box grown by `ratio` of its longer side on every side, kept inside the
 * image: a subject cut by the frame gets no margin on that side.
 * @param {Box} box
 * @param {number} width the image's width
 * @param {number} height the image's height
 * @param {number} [ratio]
 * @returns {Box}
 */
export function withMargin(box, width, height, ratio = MARGIN) {
  const margin = Math.round(Math.max(box.width, box.height) * ratio)
  const left = Math.max(0, box.left - margin)
  const top = Math.max(0, box.top - margin)
  const right = Math.min(width, box.left + box.width + margin)
  const bottom = Math.min(height, box.top + box.height + margin)
  return { left, top, width: right - left, height: bottom - top }
}
