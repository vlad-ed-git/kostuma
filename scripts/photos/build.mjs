// Makes one master from a photo (build-masters.mjs, add-masters.mjs): the
// subject with a margin (cut-outs: trimmed to what isn't transparent), a
// long side of at most MASTER_SIDE, lossless PNG, checked pixel for pixel
// against the trimmed, resized source. The source is never touched.
import { stat, writeFile } from "node:fs/promises"
import sharp from "sharp"

import { masterSize, subjectBox, withMargin } from "./masters.mjs"

sharp.cache(false)

/**
 * @param {string} source the photo's path
 * @param {string} out where the master goes
 */
export async function buildMaster(source, out) {
  const meta = await sharp(source).metadata()
  let box = { left: 0, top: 0, width: meta.width, height: meta.height }
  if (meta.hasAlpha) {
    const alpha = await sharp(source).extractChannel(3).raw().toBuffer()
    const subject = subjectBox(alpha, meta.width, meta.height)
    if (subject) box = withMargin(subject, meta.width, meta.height)
  }
  const size = masterSize(box.width, box.height)
  const pipeline = () =>
    sharp(source)
      .extract(box)
      .resize({ ...size, fit: "fill", kernel: "lanczos3" })
  const png = await pipeline()
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer()
  const expected = await pipeline().ensureAlpha().raw().toBuffer()
  const decoded = await sharp(png).ensureAlpha().raw().toBuffer()
  await writeFile(out, png)
  return {
    from: { ...box, bytes: (await stat(source)).size },
    ...size,
    bytes: png.length,
    lossless: expected.equals(decoded),
  }
}
