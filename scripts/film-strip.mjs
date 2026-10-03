// Draws the home page's film strip (public/images/film-strip.webp): the
// owner's example of a red, burnt strip of film (design/film-strip-example.png,
// enlarged 4× with Real-ESRGAN into design/film-strip-example@4x.png), cut
// into one frame per picture of the sample transformation
// (content/sample-transformation.ts) and joined again, a black frame line
// between each two. Each frame is another stretch of the example, four
// sprocket holes wide, so no two look alike; the holes run on evenly across
// the joins. The pictures, the frame numbers and the burns go on top
// (components/home/transformation-reel.tsx); its frame's width and height
// are lib/film-strip.ts's STRIP. Run it with `npm run images`.
import { fileURLToPath } from "node:url"

import sharp from "sharp"

import { sampleTransformation } from "../content/sample-transformation.ts"

/** The strip in the enlarged example: its rows, from the top band's edge to
 * the bottom band's. */
const TOP = 40
const HEIGHT = 444
/** The sprocket holes' spacing, and the first hole's middle. */
const PITCH = 418 / 6
const FIRST_HOLE = 107 - PITCH
/** A frame is four holes wide: a hole an eighth in from each side. */
const FRAME = 4 * PITCH
/** The window's rows inside the strip (the frame lines span them). */
const WINDOW = { top: 60, bottom: 382 }

const source = fileURLToPath(
  new URL("../design/film-strip-example@4x.png", import.meta.url)
)
const target = fileURLToPath(
  new URL("../public/images/film-strip.webp", import.meta.url)
)

const { width: sourceWidth } = await sharp(source).metadata()
const frames = sampleTransformation.frames.length
/** Where each frame starts in the example: half a hole before a hole. */
const starts = []
for (
  let hole = 0;
  FIRST_HOLE + hole * PITCH - PITCH / 2 + FRAME <= sourceWidth;
  hole++
)
  starts.push(FIRST_HOLE + hole * PITCH - PITCH / 2)

/** Whole pixels per frame, so the joins never blur; the strip's width. */
const FRAME_WIDTH = Math.round(FRAME)
const width = frames * FRAME_WIDTH

const pieces = await Promise.all(
  Array.from({ length: frames }, (_, index) =>
    sharp(source)
      .extract({
        left: Math.max(0, Math.round(starts[index % starts.length])),
        top: TOP,
        width: FRAME_WIDTH,
        height: HEIGHT,
      })
      .toBuffer()
  )
)

/** A frame line: black, its edges burnt soft, across the window's rows. */
const LINE = 18
const line =
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${LINE * 2}" height="${HEIGHT}">
  <defs><linearGradient id="l"><stop offset="0" stop-color="#050203" stop-opacity="0"/><stop offset=".3" stop-color="#050203"/><stop offset=".7" stop-color="#050203"/><stop offset="1" stop-color="#050203" stop-opacity="0"/></linearGradient>
  <linearGradient id="v" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".08" stop-color="#fff"/><stop offset=".92" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <mask id="m"><rect y="${WINDOW.top - 10}" width="${LINE * 2}" height="${WINDOW.bottom - WINDOW.top + 20}" fill="url(#v)"/></mask></defs>
  <rect width="${LINE * 2}" height="${HEIGHT}" fill="url(#l)" mask="url(#m)"/>
</svg>`)

const info = await sharp({
  create: { width, height: HEIGHT, channels: 3, background: "#050203" },
})
  .composite([
    ...pieces.map((input, index) => ({
      input,
      left: index * FRAME_WIDTH,
      top: 0,
    })),
    ...Array.from({ length: frames - 1 }, (_, index) => ({
      input: line,
      left: (index + 1) * FRAME_WIDTH - LINE,
      top: 0,
    })),
  ])
  .webp({ quality: 82, effort: 6 })
  .toFile(target)
console.log(
  `film strip → public/images/film-strip.webp (${width} × ${HEIGHT}, ${frames} frames, ${info.size} bytes)`
)
