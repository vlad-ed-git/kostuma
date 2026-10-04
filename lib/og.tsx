import "server-only"

import { readFile } from "node:fs/promises"
import { join } from "node:path"

import sharp from "sharp"

/**
 * What the social cards are drawn with (app/[locale]/opengraph-image.tsx,
 * app/[locale]/costumes/[slug]/opengraph-image.tsx): next/og's renderer,
 * which reads TTF, not WOFF2, and PNG, not WebP. Its font is the site's own
 * title face at 600: app/fonts/grenze-gotisch.woff2 instanced at wght 600
 * by fontTools (`varLib.instancer`), saved as app/fonts/og's TTF, under the
 * same license (app/fonts/OFL-GrenzeGotisch.txt). The cards hold only
 * Latin words (names stay as they are in every language), so one font
 * serves every language.
 */

/** The night's colors (app/globals.css), as hex. */
export const ink = {
  night: "#07080B",
  bone: "#ECE6DA",
  blood: "#C80F1F",
  bloodText: "#F03740",
}

let font: Promise<Buffer> | undefined

/** The title face, read once per server. */
export async function ogFonts() {
  font ??= readFile(join(process.cwd(), "app/fonts/og/grenze-gotisch-600.ttf"))
  return [
    {
      name: "Grenze Gotisch",
      data: await font,
      weight: 600 as const,
      style: "normal" as const,
    },
  ]
}

export type Picture = { src: string; width: number; height: number }

/**
 * A picture from Storage (a WebP) as a PNG data URL, inside `box`, or
 * filling it (`cover`: cropped to what draws the eye, a face first); null
 * when it can't be had: the card goes without it.
 */
export async function pictureAsPng(
  url: string,
  box: { width: number; height: number },
  fit: "inside" | "cover" = "inside"
): Promise<Picture | null> {
  try {
    const response = await fetch(url, {
      cache: "force-cache",
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const { data, info } = await sharp(
      Buffer.from(await response.arrayBuffer())
    )
      .resize({
        ...box,
        fit,
        position: sharp.strategy.attention,
        withoutEnlargement: true,
      })
      .png()
      .toBuffer({ resolveWithObject: true })
    return {
      src: `data:image/png;base64,${data.toString("base64")}`,
      width: info.width,
      height: info.height,
    }
  } catch (error) {
    console.error(`A social card goes without ${url}.`, error)
    return null
  }
}

/** "Kostuma", its o a drop of blood that glows (components/layout/wordmark.tsx). */
export function Wordmark({ size }: { size: number }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "Grenze Gotisch",
        fontSize: size,
        lineHeight: 1,
        color: ink.bone,
      }}
    >
      <span>K</span>
      <span
        style={{
          color: ink.bloodText,
          textShadow: `0 0 ${Math.round(size * 0.45)}px rgba(200, 15, 31, 0.75)`,
        }}
      >
        o
      </span>
      <span>stuma</span>
    </div>
  )
}
