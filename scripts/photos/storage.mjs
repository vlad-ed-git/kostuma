// How costume photos are named on Cloud Storage, and how their URLs are
// written into content/costumes.ts (see upload.mjs). Tested in
// storage.test.ts.
import { createHash } from "node:crypto"

/** Where the costume photos live in the bucket (storage.rules opens it). */
export const FOLDER = "costumes"

/** A year: the names change with the content, so a cached copy never lies. */
export const CACHE_CONTROL = "public, max-age=31536000, immutable"

/**
 * @typedef {{ file: string, url: string, width: number, height: number }} Photo
 */

/**
 * The object's path for a master: its name plus the first ten hex digits of
 * its SHA-256, so a changed photo gets a new name (and URL).
 * @param {string} file e.g. "ghostface.png"
 * @param {Uint8Array} content the master's bytes
 * @returns {string} e.g. "costumes/ghostface.1a2b3c4d5e.png"
 */
export function objectPath(file, content) {
  const match = /^([a-z0-9_-]+)\.png$/.exec(file)
  if (!match) throw new Error(`Not a costume photo name: ${file}`)
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 10)
  return `${FOLDER}/${match[1]}.${hash}.png`
}

/**
 * The file names of every costume's `images` in content/costumes.ts, in
 * order, whether they are listed as names or as photos already.
 * @param {string} source the file's text
 * @returns {string[][]}
 */
export function listedImages(source) {
  return [...source.matchAll(IMAGES)].map((match) => namesIn(match[1]))
}

/**
 * The file with every costume's `images` replaced by its photos, looked up by
 * file name. Throws when a listed file has no photo.
 * @param {string} source the file's text
 * @param {Map<string, Photo>} photos by file name
 * @returns {string}
 */
export function withPhotos(source, photos) {
  return source.replace(IMAGES, (_, body, indent) => {
    const list = namesIn(body).map((file) => {
      const photo = photos.get(file)
      if (!photo) throw new Error(`No uploaded photo for ${file}`)
      return `{ file: ${JSON.stringify(photo.file)}, url: ${JSON.stringify(photo.url)}, width: ${photo.width}, height: ${photo.height} }`
    })
    return `images: [${list.join(", ")}],\n${indent}stores:`
  })
}

// `images` always comes right before `stores` in a costume.
const IMAGES = /images: \[(.*?)\],\n(\s*)stores:/gs

/** The file names in an `images` list: bare strings or `file:` entries. */
function namesIn(body) {
  return [...body.matchAll(/(?:file: |^|[[,\s])"([a-z0-9_-]+\.png)"/g)].map(
    (match) => match[1]
  )
}
