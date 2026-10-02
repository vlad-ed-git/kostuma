// Renders the costume placeholder (design/costume-placeholder.svg) to the
// AVIF and WebP files the site serves: `npm run images`. Commit the output.
import { readFile } from "node:fs/promises"
import sharp from "sharp"

const source = new URL("../design/costume-placeholder.svg", import.meta.url)
const output = new URL("../public/images/", import.meta.url)
const size = { width: 1200, height: 1500 }

const svg = await readFile(source)
const image = sharp(svg, { density: 72 }).resize(size)

const formats = [
  ["costume-placeholder.avif", (pipeline) => pipeline.avif({ quality: 55 })],
  ["costume-placeholder.webp", (pipeline) => pipeline.webp({ quality: 80 })],
]

for (const [name, encode] of formats) {
  const target = new URL(name, output)
  const info = await encode(image.clone()).toFile(target.pathname)
  console.log(`${name}: ${info.width}×${info.height}, ${info.size} bytes`)
}
