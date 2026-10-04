// Renders Kostuma's icon (design/icon.svg, a drop of blood on black) to
// every size the site serves: `npm run images`. Commit the output.
// - app/icon.svg: the browser tab, as drawn;
// - app/favicon.ico: 16 and 32 px, for browsers that ask for it;
// - app/apple-icon.png: 180 px, an iPhone's home screen (no corners: iOS
//   rounds them);
// - public/icons/icon-{192,512}.png, maskable-512.png: the manifest's,
//   the maskable one full-bleed, the drop inside the safe zone.
import { copyFile, readFile, writeFile } from "node:fs/promises"
import sharp from "sharp"

const source = new URL("../design/icon.svg", import.meta.url)
const app = new URL("../app/", import.meta.url)
const icons = new URL("../public/icons/", import.meta.url)

const svg = await readFile(source, "utf8")
// Square corners where the platform shapes the icon itself.
const square = svg.replace('rx="14"', 'rx="0"')
// The drop scaled into the maskable safe zone (the middle 80 %).
const maskable = square.replace(
  /(<circle[\s\S]*<\/svg>)/,
  (body) =>
    `<g transform="translate(6.4 6.4) scale(0.8)">${body.replace("</svg>", "")}</g></svg>`
)

async function png(markup, size) {
  return sharp(Buffer.from(markup), { density: (72 * size) / 64 })
    .resize(size, size)
    .png()
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
    { size: 16, data: await png(svg, 16) },
    { size: 32, data: await png(svg, 32) },
  ])
)
await writeFile(new URL("apple-icon.png", app), await png(square, 180))
await writeFile(new URL("icon-192.png", icons), await png(svg, 192))
await writeFile(new URL("icon-512.png", icons), await png(svg, 512))
await writeFile(new URL("maskable-512.png", icons), await png(maskable, 512))
console.log(
  "icons: app/icon.svg, app/favicon.ico, app/apple-icon.png, public/icons/*"
)
