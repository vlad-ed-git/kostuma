"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import type { Photo } from "@/lib/catalog/types"
import { onceInView } from "@/lib/in-view"
import { cn } from "@/lib/utils"
import placeholder from "@/public/images/costume-placeholder.webp"

/** How many times a photo that failed to load is asked for again. */
export const RETRIES = 2

/**
 * How long to wait before asking again: longer each time, and spread out,
 * so a list whose photos failed together (a cold image cache, a network
 * blip) does not ask again all at once.
 */
export function retryDelay(attempt: number, random = Math.random) {
  return 1500 * 2 ** attempt + random() * 1000
}

type CostumeImageProps = {
  /** The cut-out to show. Without one, the placeholder art. */
  photo?: Photo
  /** `""` where the name is written next to it (lists, thumbnails). */
  alt: string
  /** Which widths the image takes up, for the browser to pick a file. */
  sizes: string
  /** `eager` where it shows without scrolling. */
  loading?: "lazy" | "eager"
  /** `high` for the page's main image (LCP). */
  fetchPriority?: "high"
  /** Bring the photo in with the reveal (not for small controls). */
  reveal?: boolean
  className?: string
}

/**
 * A costume's photo, filling its frame: contained, never cropped (owner),
 * standing on the frame's floor. It waits as a black silhouette rimmed in
 * red light until it is loaded and in view, then the light flickers on
 * (`.photo-reveal` in app/film.css; reduced motion and no JavaScript show it
 * lit). To replay the reveal for another photo, give it a new `key`.
 *
 * A photo that fails to load is asked for again (`RETRIES`); if it still
 * fails, the placeholder art takes its place (decorative: the name is
 * always written nearby).
 */
export function CostumeImage({
  photo,
  alt,
  sizes,
  loading = "lazy",
  fetchPriority,
  reveal = true,
  className,
}: CostumeImageProps) {
  const [attempt, setAttempt] = useState(0)
  const [waiting, setWaiting] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [seen, setSeen] = useState(false)
  const frame = useRef<HTMLSpanElement>(null)
  const shown = photo !== undefined && !failed

  useEffect(() => {
    if (!shown || !reveal || !frame.current) return
    return onceInView(frame.current, () => setSeen(true))
  }, [shown, reveal])

  // After a failure, wait, then ask again with a fresh <img>.
  useEffect(() => {
    if (!waiting) return
    const timer = setTimeout(() => {
      setWaiting(false)
      setAttempt((count) => count + 1)
    }, retryDelay(attempt))
    return () => clearTimeout(timer)
  }, [waiting, attempt])

  if (!shown) {
    return (
      <Image
        src={placeholder}
        alt=""
        fill
        sizes={sizes}
        placeholder="blur"
        loading={loading}
        fetchPriority={fetchPriority}
        className={cn("object-contain", className)}
      />
    )
  }

  return (
    <span
      ref={frame}
      className={reveal ? "photo-reveal" : "absolute inset-0"}
      data-revealed={(reveal && loaded && seen) || undefined}
    >
      {/* Nothing while waiting to ask again: no broken-image icon. */}
      {!waiting && (
        <Image
          key={attempt}
          src={photo.url}
          alt={alt}
          fill
          sizes={sizes}
          loading={loading}
          fetchPriority={fetchPriority}
          // next/image also reports a broken image as loaded.
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0) setLoaded(true)
          }}
          onError={() =>
            attempt < RETRIES ? setWaiting(true) : setFailed(true)
          }
          className={cn("object-contain object-bottom", className)}
        />
      )}
    </span>
  )
}
