// Puts the home page's sample transformation on Firebase Storage and its
// URLs in the data:
//
//   npm run photos:samples [-- <slug> [<run>]]
//
// The pictures are a real try-on of the owner's sample photos, saved once
// in photos/fitting-room/results/<run>/ (gitignored; checkpoint §3.1d; the
// run's folder is the costume's slug unless named): they are never
// rendered again. Each frame (samples.mjs; its cut-out when the run has
// one, `cut-out/<name>.png`) gets a web copy (web.mjs) at
// costumes/sample-<slug>-<nn>.<hash>.webp, unless that object is already
// there, and content/sample-transformation.ts lists them, formatted with
// Prettier. Without arguments, the costume and run in that file. The
// storage rules already open costumes/ to everyone: nothing is deployed.
//
// Credentials: see admin.mjs.
import { existsSync } from "node:fs"
import { readFile, readdir, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { getStorage } from "firebase-admin/storage"
import prettier from "prettier"

import { adminApp, BUCKET, storeOnce } from "./admin.mjs"
import {
  frameFiles,
  frameSource,
  sampleIn,
  sampleModule,
  samplePath,
} from "./samples.mjs"
import { publicUrl } from "./storage.mjs"
import { webCopy } from "./web.mjs"

const root = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const DATA = root("content/sample-transformation.ts")

const [named, namedRun] = process.argv.slice(2)
const sample = named
  ? { slug: named, run: namedRun ?? named }
  : existsSync(DATA)
    ? sampleIn(await readFile(DATA, "utf8"))
    : null
if (!sample) {
  console.error("Name the costume: npm run photos:samples -- <slug> [<run>]")
  process.exit(1)
}
const { slug, run } = sample
if (!/^[a-z0-9-]+$/.test(run)) {
  console.error(`Not a run's folder: ${run}`)
  process.exit(1)
}
const RUN = root(`photos/fitting-room/results/${run}/`)
if (!existsSync(RUN)) {
  console.error(`No sample run in photos/fitting-room/results/${run}/.`)
  process.exit(1)
}

const files = frameFiles(await readdir(RUN))
const bucket = getStorage(await adminApp()).bucket()
const frames = []
let uploaded = 0
for (const [index, frame] of files.entries()) {
  const file = frameSource(frame, (path) => existsSync(`${RUN}${path}`))
  const web = await webCopy(await readFile(`${RUN}${file}`))
  const path = samplePath(slug, index, web.content)
  uploaded += Number(await storeOnce(bucket, path, web.content, "image/webp"))
  frames.push({
    file,
    url: publicUrl(BUCKET, path),
    width: web.width,
    height: web.height,
  })
}
console.log(
  `frames: ${files.length} web copies, ${uploaded} uploaded, the rest already there`
)

const options = await prettier.resolveConfig(DATA)
await writeFile(
  DATA,
  await prettier.format(sampleModule(slug, run, frames), {
    ...options,
    filepath: DATA,
  })
)
console.log(`data: content/sample-transformation.ts (${slug}, ${run})`)
