// Builds the costume photos' masters from the owner's cut-outs (gitignored),
// all of them at once (one new photo without the rest: add-masters.mjs):
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
import { existsSync } from "node:fs"
import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

import { buildMaster } from "./build.mjs"

const photos = fileURLToPath(new URL("../../photos/", import.meta.url))
const SOURCE = `${photos}no_bg/`
const OUT = `${photos}masters/`
const mb = (bytes) => `${(bytes / 1e6).toFixed(2)} MB`

/** One master: the subject with a margin, at most MASTER_SIDE, lossless. */
async function build(name) {
  return { name, ...(await buildMaster(`${SOURCE}${name}`, `${OUT}${name}`)) }
}

// The sources first: without them, the masters (maybe the only local copy)
// must stay as they are.
const names = existsSync(SOURCE)
  ? (await readdir(SOURCE)).filter((name) => name.endsWith(".png")).sort()
  : []
if (!names.length) {
  console.error(
    "No cut-outs in photos/no_bg: nothing to build, photos/masters left as it is."
  )
  process.exit(1)
}
await rm(OUT, { recursive: true, force: true })
await mkdir(OUT, { recursive: true })
const masters = []
for (const name of names) masters.push(await build(name))
await writeFile(`${OUT}report.json`, JSON.stringify(masters, null, 2) + "\n")

// Every photo the data names has its master, and every master a costume
// (the photos shown, and the garments only the try-on uses).
const { costumes } = await import("../../content/costumes.ts")
const named = new Set(
  costumes.flatMap((costume) => [
    ...costume.images.map((photo) => photo.file),
    ...(costume.garment ? [costume.garment.file] : []),
  ])
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
