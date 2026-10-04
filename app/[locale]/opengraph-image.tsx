import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { ImageResponse } from "next/og"

import { sampleTransformation } from "@/content/sample-transformation"
import { routing } from "@/i18n/routing"
import { ink, ogFonts, pictureAsPng, Wordmark } from "@/lib/og"
import { OG_SIZE } from "@/lib/seo"

/**
 * The card a shared link to Kostuma shows (spec §14b): the wordmark over the
 * home page's real transformation, five frames, in the night's red light.
 */

export const size = OG_SIZE
export const contentType = "image/png"

type Params = { params: Promise<{ locale: string }> | { locale: string } }

export async function generateImageMetadata({ params }: Params) {
  const { locale } = await params
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    namespace: "App",
  })
  return [{ id: "card", alt: t("tagline"), size, contentType }]
}

/** Each frame, and the picture filling it inside its 2 px border. */
const FRAME = { width: 190, height: 300 }
const PICTURE = { width: FRAME.width - 4, height: FRAME.height - 4 }

export default async function Image({ params }: Params) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale))
    return new Response("Not found", { status: 404 })
  const frames = await Promise.all(
    sampleTransformation.frames.map((frame) =>
      pictureAsPng(frame.url, PICTURE, "cover")
    )
  )
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        background: ink.night,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(ellipse at 50% 92%, rgba(200, 15, 31, 0.5) 0%, rgba(200, 15, 31, 0.12) 38%, rgba(7, 8, 11, 0) 70%)",
        }}
      />
      <div style={{ display: "flex", marginTop: 52 }}>
        <Wordmark size={150} />
      </div>
      <div style={{ display: "flex", marginTop: 40 }}>
        {frames.map((frame, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              width: FRAME.width,
              height: FRAME.height,
              marginLeft: index === 0 ? 0 : 18,
              background:
                "linear-gradient(180deg, rgba(120, 12, 20, 0.55), rgba(18, 6, 10, 0.9))",
              border: "2px solid rgba(240, 55, 64, 0.35)",
              overflow: "hidden",
            }}
          >
            {frame && (
              <img
                src={frame.src}
                width={frame.width}
                height={frame.height}
                alt=""
              />
            )}
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts: await ogFonts() }
  )
}
