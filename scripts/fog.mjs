// Draws the fog texture (public/images/fog.webp): soft, cold blobs that wrap
// from the right edge to the left, so the layers in app/film.css can roll
// sideways forever without a seam. Seeded, so every run draws the same fog.
// Run it with `npm run images`.
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const width = 1200
const height = 360

// mulberry32: a tiny seeded random generator.
let seed = 1031
const random = () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const blobs = []
for (let i = 0; i < 220; i++) {
  const r = 30 + random() * 140
  const x = random() * width
  const y = height * 0.3 + random() * height * 0.75
  const alpha = (0.02 + random() * 0.06).toFixed(3)
  for (const dx of [-width, 0, width]) {
    blobs.push(
      `<circle cx="${(x + dx).toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#b)" fill-opacity="${alpha}"/>`
    )
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs><radialGradient id="b"><stop offset="0" stop-color="#becdde"/><stop offset="1" stop-color="#becdde" stop-opacity="0"/></radialGradient></defs>
  ${blobs.join("\n  ")}
</svg>`

const target = fileURLToPath(
  new URL("../public/images/fog.webp", import.meta.url)
)
// Drawn at full size, stored at half: fog is soft, the browser scales it up.
const info = await sharp(Buffer.from(svg))
  .resize(width / 2)
  .webp({ quality: 70, alphaQuality: 80 })
  .toFile(target)
console.log(`fog → public/images/fog.webp (${info.size} bytes)`)
