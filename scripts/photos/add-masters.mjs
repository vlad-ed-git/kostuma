// Adds masters for new photos, without the other sources (the owner's
// cut-outs are no longer kept: photos/masters is the local copy):
//
//   npm run photos:add -- photos/costumes-to-use/aunt-gladys-costume.png …
//
// Each photo becomes photos/masters/<its name> as photos:masters makes
// them (build.mjs). A master already there is never replaced: a changed
// photo takes a new name. The sources are left where they are. Then list the
// photo in content/costumes.ts (`images`, or `garment` for the try-on only)
// and run npm run photos:upload.
import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
import { basename } from "node:path"
import { fileURLToPath } from "node:url"

import { buildMaster } from "./build.mjs"

const OUT = fileURLToPath(new URL("../../photos/masters/", import.meta.url))
const sources = process.argv.slice(2)
if (!sources.length) {
  console.error("Name the photos to add: npm run photos:add -- <photo.png> …")
  process.exit(1)
}

let failed = false
for (const source of sources) {
  const name = basename(source)
  if (!/^[a-z0-9_-]+\.png$/.test(name)) {
    console.error(`✗ ${name}: a PNG named with a-z, 0-9, - and _ only`)
    failed = true
    continue
  }
  if (existsSync(`${OUT}${name}`)) {
    console.error(`✗ ${name}: a master of that name exists, left as it is`)
    failed = true
    continue
  }
  const master = await buildMaster(source, `${OUT}${name}`)
  if (!master.lossless) {
    await rm(`${OUT}${name}`)
    console.error(`✗ ${name}: the master isn't lossless, not kept`)
    failed = true
    continue
  }
  console.log(
    `✓ ${name}: ${master.width} × ${master.height}, ${(master.bytes / 1e6).toFixed(2)} MB`
  )
}
if (failed) process.exit(1)
