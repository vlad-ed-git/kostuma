import Image from "next/image"
import { getTranslations } from "next-intl/server"
import type { CSSProperties } from "react"

import { sampleTransformation } from "@/content/sample-transformation"
import { getCostume } from "@/lib/catalog"
import { cues, STRIP } from "@/lib/film-strip"
import { cn } from "@/lib/utils"

/** Each window's width: a fifth of the column, a little less. */
const SIZES = "(min-width: 1280px) 118px, (min-width: 1024px) 9vw, 17vw"

/**
 * Under "Transform into a monster." (spec §11.1): what the Fitting Room
 * does, without a word. A real try-on of the owner's sample photos
 * (content/sample-transformation.ts), each picture a frame of a red, burnt
 * strip of film, numbered on its edge: the photo, the outfit tried on, the
 * makeup's first, middle and last steps. The cigarette burns blink on the
 * last two frames. One picture for screen readers, named by its label.
 */
export async function TransformationReel({
  className,
}: {
  className?: string
}) {
  const t = await getTranslations("Home")
  const { slug, frames } = sampleTransformation
  const costume = getCostume(slug)
  if (!costume || !frames.length) return null
  const cue = cues(frames.length)

  return (
    <div
      role="img"
      aria-label={t("reel", { name: costume.name })}
      className={cn("home-reel", className)}
      style={
        {
          "--frames": frames.length,
          aspectRatio: `${frames.length * STRIP.frameWidth} / ${STRIP.height}`,
        } as CSSProperties
      }
    >
      {frames.map((frame, index) => (
        <div key={frame.file} className="home-reel-frame">
          <span className="home-reel-number">{index + 1}</span>
          <div className="home-reel-window">
            <Image
              src={frame.url}
              alt=""
              fill
              sizes={SIZES}
              className="object-contain object-bottom"
            />
            {cue[index] && (
              <span className="home-reel-burn" data-cue={cue[index]} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
