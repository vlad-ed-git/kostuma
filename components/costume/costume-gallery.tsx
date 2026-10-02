"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import type { Photo } from "@/lib/catalog/types"

import { CostumeImage } from "./costume-image"

type CostumeGalleryProps = {
  /** The character, for the photo's description. */
  name: string
  photos: readonly Photo[]
}

/**
 * The costume page's photo (spec §11.3): the first one, large. With several
 * (The Strangers, The Purge), small thumbnails under it choose which one,
 * and each choice brings its photo in with the reveal. Without JavaScript
 * the thumbnails could do nothing, so they are hidden and the first photo
 * stays.
 */
export function CostumeGallery({ name, photos }: CostumeGalleryProps) {
  const t = useTranslations("Costume")
  const [index, setIndex] = useState(0)
  const photo = photos.at(index)

  return (
    <>
      <div className="relative aspect-4/5 overflow-hidden border border-foreground/8 bg-card shadow-[0_0_80px_color-mix(in_oklch,var(--blood)_22%,transparent)] [--rim:24px]">
        <CostumeImage
          // A new photo, a new reveal.
          key={photo?.url}
          photo={photo}
          alt={t("photoAlt", { name })}
          sizes="(min-width: 1280px) 470px, (min-width: 1024px) 37vw, calc(100vw - 2rem)"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      {photos.length > 1 && (
        <div
          role="group"
          aria-label={t("photos")}
          className="mt-4 flex flex-wrap gap-3 [@media(scripting:none)]:hidden"
        >
          {photos.map((thumbnail, i) => (
            <button
              key={thumbnail.url}
              type="button"
              aria-pressed={i === index}
              aria-label={t("showPhoto", {
                number: i + 1,
                count: photos.length,
              })}
              onClick={() => setIndex(i)}
              className="group/thumb relative aspect-4/5 w-18 overflow-hidden border border-foreground/8 bg-card transition-[border-color,box-shadow] duration-300 hover:border-blood-text/50 aria-pressed:border-blood-text/60 aria-pressed:shadow-[0_0_24px_color-mix(in_oklch,var(--blood)_40%,transparent)]"
            >
              <CostumeImage
                photo={thumbnail}
                alt=""
                sizes="72px"
                // Right under the large photo: on screen from the start.
                loading="eager"
                reveal={false}
                className="brightness-60 transition-[filter] duration-300 group-hover/thumb:brightness-100 group-aria-pressed/thumb:brightness-100"
              />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
