// The web copy of a costume photo: what the site shows (see upload.mjs). The
// master stays the lossless original and the try-on reference; the copy is
// about a tenth of its weight, so the image optimizer fetches it quickly.
// Tested in web.test.ts.
import sharp from "sharp"

/** The long side of a web copy, in pixels: the costume page's largest frame
 * (448 px tall on a phone) at 3×, and never an enlargement. */
export const WEB_SIDE = 1400

/** Near-lossless color, and full-quality alpha for the cut-out's edges. */
export const WEB_OPTIONS = { quality: 90, alphaQuality: 100, effort: 4 }

/**
 * The web copy of a master: fitted inside a WEB_SIDE square, WebP with its
 * transparency. The same master always gives the same bytes.
 * @param {Uint8Array} master the master's PNG
 * @returns {Promise<{ content: Buffer, width: number, height: number }>}
 */
export async function webCopy(master) {
  const { data, info } = await sharp(master)
    .resize(WEB_SIDE, WEB_SIDE, {
      fit: "inside",
      withoutEnlargement: true,
      kernel: "lanczos3",
    })
    .webp(WEB_OPTIONS)
    .toBuffer({ resolveWithObject: true })
  return { content: data, width: info.width, height: info.height }
}
