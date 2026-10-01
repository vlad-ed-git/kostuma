// Builds the costume photos' masters from the owner's cut-outs (gitignored):
//
//   npm run photos:masters
//
//   photos/no_bg/<name>.png  →  photos/masters/<name>.png
//
// Each master is the cut-out trimmed to its subject plus MARGIN, with a long
// side of at most MASTER_SIDE, saved as lossless PNG (checked pixel for pixel
// against the trimmed, resized source). The sources are never touched. Then
// every photo content/costumes.ts names must have its master, and every
// master a costume.
import { mkdir, readdir, rm, stat, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

import { masterSize, subjectBox, withMargin } from "./masters.mjs"

const photos = fileURLToPath(new URL("../../photos/", import.meta.url))
const SOURCE = `${photos}no_bg/`
const OUT = `${photos}masters/`
const mb = (bytes) => `${(bytes / 1e6).toFixed(2)} MB`

sharp.cache(false)

/** One master: the subject with a margin, at most MASTER_SIDE, lossless. */
async function build(name) {
  const source = `${SOURCE}${name}`
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
  await writeFile(`${OUT}${name}`, png)
  return {
    name,
    from: { ...box, bytes: (await stat(source)).size },
    ...size,
    bytes: png.length,
    lossless: expected.equals(decoded),
  }
}

await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })

const names = (await readdir(SOURCE))
  .filter((name) => name.endsWith(".png"))
  .sort()
const masters = []
for (const name of names) masters.push(await build(name))
await writeFile(`${OUT}report.json`, JSON.stringify(masters, null, 2) + "\n")

// Every photo the data names has its master, and every master a costume.
const { costumes } = await import("../../content/costumes.ts")
const named = new Set(
  costumes.flatMap((costume) => costume.images.map((photo) => photo.file))
)
const built = new Set(masters.map((master) => master.name))
const missing = [...named].filter((name) => !built.has(name))
const unused = [...built].filter((name) => !named.has(name))
const altered = masters.filter((master) => !master.lossless)

const before = masters.reduce((sum, m) => sum + m.from.bytes, 0)
const after = masters.reduce((sum, m) => sum + m.bytes, 0)
const largest = masters.reduce((a, m) => (m.bytes > a.bytes ? m : a))
console.log(
  `${masters.length} masters: ${mb(before)} → ${mb(after)}; largest ${largest.name} ${mb(largest.bytes)}`
)
if (altered.length)
  console.log(`✗ not lossless: ${altered.map((m) => m.name).join(", ")}`)
if (missing.length)
  console.log(`✗ named in the data, no master: ${missing.join(", ")}`)
if (unused.length)
  console.log(`✗ masters no costume names: ${unused.join(", ")}`)
if (altered.length || missing.length || unused.length) process.exit(1)
