// The home page's sample transformation (upload-samples.mjs): which
// pictures of a sample run make its frames, how they are named on Cloud
// Storage, and the data module that lists them. Tested in samples.test.ts.
import { createHash } from "node:crypto"

import { FOLDER } from "./storage.mjs"

/**
 * The frames of a sample run, in order, from the names of the files in its
 * folder (photos/fitting-room/results/<run>/, as the run saves them): the
 * body photo and the outfit tried on, then the makeup's first step, its
 * middle one and its last (owner, 2026-10-04: no more on the strip). A
 * costume that is all makeup has no outfit: its face photo comes first.
 * Throws when a picture is missing.
 * @param {string[]} names
 * @returns {string[]}
 */
export function frameFiles(names) {
  const steps = names
    .map((name) => ({ name, match: /^(\d{2})-[a-z0-9-]+\.jpg$/.exec(name) }))
    .filter(({ match }) => match && Number(match[1]) > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, match }, index) => {
      if (Number(match[1]) !== index + 1)
        throw new Error(`Step ${index + 1} is missing (found ${name}).`)
      return name
    })
  if (!steps.length) throw new Error("No step pictures in the run.")
  const first = names.includes("00-outfit.jpg")
    ? ["00-your-body.jpg", "00-outfit.jpg"]
    : ["00-your-face.jpg"]
  for (const name of first) {
    if (!names.includes(name)) throw new Error(`${name} is missing.`)
  }
  // The middle: of six steps the fourth, of five the third.
  const picked = [0, Math.floor(steps.length / 2), steps.length - 1]
  return [...first, ...new Set(picked.map((index) => steps[index]))]
}

/**
 * The picture a frame is made from, in its run's folder: its cut-out
 * (`cut-out/<name>.png`, the person without the white behind them, for
 * the strip: owner, 2026-10-04) when the run has one, else the picture as
 * the run saved it.
 * @param {string} file the frame, e.g. "01-white-pancake.jpg"
 * @param {(path: string) => boolean} exists whether the run has that file
 * @returns {string}
 */
export function frameSource(file, exists) {
  const cutOut = `cut-out/${file.replace(/\.jpg$/, ".png")}`
  return exists(cutOut) ? cutOut : file
}

/**
 * Where a frame's web copy lives: beside the costume photos, in the folder
 * storage.rules opens to everyone (`costumes/`), named after the costume,
 * the frame's place and the first ten hex digits of its content's SHA-256,
 * so a changed picture gets a new name.
 * @param {string} slug the costume, e.g. "longlegs"
 * @param {number} index the frame's place, from 0
 * @param {Uint8Array} content the web copy (WebP)
 * @returns {string} e.g. "costumes/sample-longlegs-00.1a2b3c4d5e.webp"
 */
export function samplePath(slug, index, content) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))
    throw new Error(`Not a costume: ${slug}`)
  if (!Number.isInteger(index) || index < 0 || index > 99)
    throw new Error(`Not a frame: ${index}`)
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 10)
  return `${FOLDER}/sample-${slug}-${String(index).padStart(2, "0")}.${hash}.webp`
}

/**
 * The data module the site reads (content/sample-transformation.ts),
 * before Prettier formats it.
 * @param {string} slug the costume
 * @param {string} run the run's folder in photos/fitting-room/results
 * @param {{ file: string, url: string, width: number, height: number }[]} frames
 * @returns {string}
 */
export function sampleModule(slug, run, frames) {
  return `/**
 * The home page's film strip (components/home/transformation-reel.tsx): a
 * real try-on of the owner's sample photos by the Fitting Room's own
 * renders, made once (photos/fitting-room/results/<run>/, gitignored): the
 * body photo, the outfit tried on, then the makeup's first, middle and
 * last steps. Written by \`npm run photos:samples\`: don't edit by hand.
 */

export type SampleFrame = {
  /** The picture's file in the run (its cut-out, when it has one). */
  file: string
  /** Its web copy on Cloud Storage, public, beside the costume photos. */
  url: string
  /** The web copy's size in pixels. */
  width: number
  height: number
}

export const sampleTransformation: {
  slug: string
  run: string
  frames: SampleFrame[]
} = {
  slug: ${JSON.stringify(slug)},
  run: ${JSON.stringify(run)},
  frames: ${JSON.stringify(frames)},
}
`
}

/**
 * The costume and the run of the sample in the data module, if it has one.
 * @param {string} source the module's text
 * @returns {{ slug: string, run: string } | null}
 */
export function sampleIn(source) {
  const slug = /^\s*slug: "([a-z0-9-]+)",$/m.exec(source)?.[1]
  const run = /^\s*run: "([a-z0-9-]+)",$/m.exec(source)?.[1]
  return slug ? { slug, run: run ?? slug } : null
}
