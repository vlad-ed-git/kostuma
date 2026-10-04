import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { ImageResponse } from "next/og"

import { routing } from "@/i18n/routing"
import { getCostume } from "@/lib/catalog"
import { ink, ogFonts, pictureAsPng, Wordmark } from "@/lib/og"
import { OG_SIZE } from "@/lib/seo"

/**
 * A costume's card, when its page is shared (spec §14b): its name and year
 * in the title face, its photo standing in the red light, the wordmark
 * below. The same in every language: names stay as they are.
 */

export const size = OG_SIZE
export const contentType = "image/png"

type Params = {
  params:
    | Promise<{ locale: string; slug: string }>
    | {
        locale: string
        slug: string
      }
}

export async function generateImageMetadata({ params }: Params) {
  const { locale, slug } = await params
  const costume = getCostume(slug)
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    namespace: "Costume",
  })
  return [
    {
      id: "card",
      alt: t("photoAlt", { name: costume?.name ?? slug }),
      size,
      contentType,
    },
  ]
}

/** The name as large as it fits: long names on two lines, smaller. */
function nameSize(name: string) {
  if (name.length <= 10) return 124
  if (name.length <= 16) return 104
  if (name.length <= 24) return 86
  return 70
}

/** The photo's room: the right of the card, clear of the name. */
const PHOTO = { width: 560, height: 580 }

export default async function Image({ params }: Params) {
  const { locale, slug } = await params
  const costume = getCostume(slug)
  if (!costume || !hasLocale(routing.locales, locale))
    return new Response("Not found", { status: 404 })
  const first = costume.images[0]
  // A landscape photo standing whole would cover the name: it fills the
  // room instead, cropped to its subject.
  const wide = first && first.width / first.height > PHOTO.width / PHOTO.height
  const photo = first
    ? await pictureAsPng(first.url, PHOTO, wide ? "cover" : "inside")
    : null

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: ink.night,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 760,
          height: "100%",
          background:
            "radial-gradient(circle at 62% 62%, rgba(200, 15, 31, 0.55) 0%, rgba(200, 15, 31, 0.14) 36%, rgba(7, 8, 11, 0) 68%)",
        }}
      />
      {photo && (
        <img
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt=""
          style={{
            position: "absolute",
            right: 90,
            bottom: 0,
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 640,
          height: "100%",
          padding: "84px 0 64px 84px",
          fontFamily: "Grenze Gotisch",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: nameSize(costume.name),
              lineHeight: 1.04,
              color: ink.bone,
            }}
          >
            {costume.name}
          </div>
          <div style={{ marginTop: 26, fontSize: 44, color: ink.bloodText }}>
            {String(costume.films[0].year)}
          </div>
        </div>
        <Wordmark size={64} />
      </div>
    </div>,
    { ...size, fonts: await ogFonts() }
  )
}
