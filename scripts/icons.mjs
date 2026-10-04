// Renders Kostuma's icon (design/icon.svg, the K in bloody, gritty ink on
// black) to every size the site serves: `npm run images`. Commit the output.
// - app/icon.svg: the browser tab, as drawn;
// - app/favicon.ico: 16 and 32 px, for browsers that ask for it, without
//   the ink's grit (#grit), which at that size is only noise;
// - app/apple-icon.png: 180 px, an iPhone's home screen (no corners: iOS
//   rounds them);
// - public/icons/icon-{192,512}.png, maskable-512.png: the manifest's,
//   the maskable one full-bleed, the mark inside the safe zone.
import { copyFile, readFile, writeFile } from "node:fs/promises"
import sharp from "sharp"

const source = new URL("../design/icon.svg", import.meta.url)
const app = new URL("../app/", import.meta.url)
const icons = new URL("../public/icons/", import.meta.url)

const svg = await readFile(source, "utf8")

/** `markup` with `from` replaced: the design must still have it. */
function swap(markup, from, to) {
  if (!markup.includes(from)) throw new Error(`design/icon.svg: no ${from}`)
  return markup.replace(from, to)
}

// Square corners where the platform shapes the icon itself.
const square = swap(svg, 'rx="112"', 'rx="0"')
// The mark scaled into the maskable safe zone: a circle of 80 % of the
// icon; at 75 % the drops at the K's feet stay inside it.
const maskable = swap(
  square,
  '<g id="mark">',
  '<g id="mark" transform="translate(64 64) scale(0.75)">'
)
// Favicon sizes: the K and its blood, clean.
const small = swap(svg, ' filter="url(#grit)"', "")

/**
 * The icon at `size` px: drawn larger, then scaled down, so it stays
 * smooth; in a palette of 256 colors, a quarter of the bytes, the same
 * to the eye.
 */
async function png(markup, size) {
  const drawn = Math.max(size * 2, 512)
  return sharp(Buffer.from(markup), { density: (72 * drawn) / 512 })
    .resize(size, size, { kernel: "lanczos3" })
    .png({ palette: true, quality: 95, effort: 10, compressionLevel: 9 })
    .toBuffer()
}

/** An .ico holding PNG images (every current browser reads these). */
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, index) => {
    const entry = 6 + 16 * index
    header.writeUInt8(size >= 256 ? 0 : size, entry)
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    header.writeUInt8(0, entry + 2)
    header.writeUInt8(0, entry + 3)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(data.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map(({ data }) => data)])
}

await copyFile(source, new URL("icon.svg", app))
await writeFile(
  new URL("favicon.ico", app),
  ico([
    { size: 16, data: await png(small, 16) },
    { size: 32, data: await png(small, 32) },
  ])
)
await writeFile(new URL("apple-icon.png", app), await png(square, 180))
await writeFile(new URL("icon-192.png", icons), await png(svg, 192))
await writeFile(new URL("icon-512.png", icons), await png(svg, 512))
await writeFile(new URL("maskable-512.png", icons), await png(maskable, 512))
console.log(
  "icons: app/icon.svg, app/favicon.ico, app/apple-icon.png, public/icons/*"
)
