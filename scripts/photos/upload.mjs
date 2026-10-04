// Puts the costume photos on Firebase Storage and their URLs in the data:
//
//   npm run photos:upload
//
// 1. Deploys storage.rules (costume photos public and read-only, all else
//    closed) through the Admin SDK.
// 2. Uploads each master in photos/masters (npm run photos:masters) to
//    costumes/<name>.<hash>.png (the lossless original, kept for the try-on),
//    and its web copy (web.mjs) to costumes/<name>.<hash>.webp, each unless
//    that object is already there.
// 3. Writes every costume's photos (master's file name, the web copy's
//    public URL and size) into content/costumes.ts, formatted with
//    Prettier: the site shows the web copies of `images`; the try-on uses
//    the web copy of `garment` (the outfit alone), or else of `images[0]`.
//
// Credentials: see admin.mjs.
import { readFile, readdir, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { getSecurityRules } from "firebase-admin/security-rules"
import { getStorage } from "firebase-admin/storage"
import prettier from "prettier"

import { adminApp, BUCKET, storeOnce } from "./admin.mjs"
import {
  listedGarments,
  listedImages,
  objectPath,
  publicUrl,
  withPhotos,
} from "./storage.mjs"
import { webCopy } from "./web.mjs"

const root = (path) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const MASTERS = root("photos/masters/")
const DATA = root("content/costumes.ts")

const app = await adminApp()

// 1. The rules first: the photos must never be public by accident of order.
// Deployed only when they differ from the live ones (no pile of copies).
const rules = await readFile(root("storage.rules"), "utf8")
const securityRules = getSecurityRules(app)
const live = await securityRules.getStorageRuleset(BUCKET).catch(() => null)
if (live?.source.some((file) => file.content === rules)) {
  console.log(`rules: already live (${live.name})`)
} else {
  const release = await securityRules.releaseStorageRulesetFromSource(
    rules,
    BUCKET
  )
  console.log(`rules: deployed ${release.name}`)
}

// 2. The masters and their web copies, each uploaded once under its
// content-hashed name.
const bucket = getStorage(app).bucket()

const files = (await readdir(MASTERS))
  .filter((name) => name.endsWith(".png"))
  .sort()
if (!files.length) {
  console.error(
    "No masters in photos/masters: run npm run photos:masters first."
  )
  process.exit(1)
}
const photos = new Map()
let uploaded = 0
for (const file of files) {
  const master = await readFile(`${MASTERS}${file}`)
  const kept = await storeOnce(
    bucket,
    objectPath(file, master),
    master,
    "image/png"
  )
  const web = await webCopy(master)
  const path = objectPath(file, web.content, "webp")
  const shown = await storeOnce(bucket, path, web.content, "image/webp")
  uploaded += Number(kept) + Number(shown)
  photos.set(file, {
    file,
    url: publicUrl(BUCKET, path),
    width: web.width,
    height: web.height,
  })
}
console.log(
  `photos: ${files.length} masters and their web copies, ${uploaded} files uploaded, the rest already there`
)

// 3. The URLs into the data.
const source = await readFile(DATA, "utf8")
const listed = [...listedImages(source).flat(), ...listedGarments(source)]
const unlisted = files.filter((file) => !listed.includes(file))
const updated = withPhotos(source, photos)
const options = await prettier.resolveConfig(DATA)
await writeFile(
  DATA,
  await prettier.format(updated, { ...options, filepath: DATA })
)
console.log(`data: ${listed.length} photos set in content/costumes.ts`)
if (unlisted.length)
  console.log(`note: masters no costume lists: ${unlisted.join(", ")}`)
