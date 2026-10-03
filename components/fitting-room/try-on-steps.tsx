"use client"

import { RiArrowRightUpLine } from "@remixicon/react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import type { Photo } from "@/lib/catalog/types"
import {
  photoUrl,
  type StepView,
  type TryOnView,
} from "@/lib/fitting-room/try-on"
import { cn } from "@/lib/utils"

/** A costume's makeup guide, as the page reads it (content/makeup.ts). */
export type GuideText = {
  look: string
  steps: { title: string; howTo: string; products: string[] }[]
  finish?: string
}

/** Where a product is looked for: a shop's search (owner: shops are links). */
export const shopSearch = (product: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(product)}`

/**
 * A try-on as it develops, then as it came out (owner, 2026-10-03): the
 * outfit on the visitor's body photo (or, for a character who is all
 * makeup, a line saying so), then their face before and after each makeup
 * step, with what to do and what to buy. Every step renders on the picture
 * the one before left, so they come one at a time: a step not done yet is
 * the character's silhouette in the dark (as the costume photos wait on the
 * home page), the one rendering now breathing in red light; a finished
 * picture comes into the light as those photos do.
 */
export function TryOnSteps({
  tryOn,
  name,
  photo,
  guide,
}: {
  tryOn: TryOnView
  /** The character. */
  name: string
  /** The costume's photo: its silhouette stands in for a step not done. */
  photo?: Photo
  guide: GuideText
}) {
  const t = useTranslations("FittingRoom")
  const outfit = tryOn.outfit ? tryOn.steps[0] : null
  const makeup = tryOn.outfit ? tryOn.steps.slice(1) : tryOn.steps
  const ready = makeup.filter((step) => step.status === "done").length
  // The step rendering now: the first not done (each waits on the last).
  const current =
    tryOn.status === "running"
      ? tryOn.steps.find((step) => step.status !== "done")
      : undefined

  const status =
    tryOn.status === "done"
      ? t("progress.done")
      : tryOn.status === "running"
        ? outfit && outfit.status !== "done"
          ? t("progress.outfit")
          : t("progress.makeup", { done: ready, count: makeup.length })
        : ""

  return (
    <div className="flex flex-col gap-14">
      <p
        aria-live="polite"
        className="text-lead text-muted-foreground empty:hidden"
      >
        {status}
      </p>

      <section aria-labelledby="try-on-outfit" className="flex flex-col gap-6">
        <h2 id="try-on-outfit" className="font-heading text-h2 font-semibold">
          {t("outfit")}
        </h2>
        {outfit ? (
          <Picture
            step={outfit}
            alt={t("outfitAlt", { name })}
            photo={photo}
            current={outfit === current}
            className="aspect-2/3 w-full max-w-md"
          />
        ) : (
          <p className="max-w-[60ch] text-body-lg">
            {t("allMakeup", { name })}
          </p>
        )}
      </section>

      <section aria-labelledby="try-on-makeup" className="flex flex-col gap-6">
        <h2 id="try-on-makeup" className="font-heading text-h2 font-semibold">
          {t("makeup")}
        </h2>
        <p className="max-w-[60ch] text-body-lg">{guide.look}</p>
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          <figure className="flex flex-col gap-4">
            <div className="aspect-3/4 w-full overflow-hidden border border-foreground/10 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element -- the visitor's own photo, through the server only */}
              <img
                src={photoUrl("face", tryOn.face)}
                alt={t("beforeAlt")}
                className="size-full object-contain"
              />
            </div>
            <figcaption className="text-micro caps text-muted-foreground">
              {t("before")}
            </figcaption>
          </figure>
          {/* `contents`: the steps share the grid with "Before"; the role
              keeps the list a list (Safari drops it with display: contents). */}
          <ol role="list" className="contents">
            {guide.steps.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-4">
                <Picture
                  step={makeup[index]}
                  alt={t("stepAlt", { number: index + 1, title: step.title })}
                  photo={photo}
                  current={makeup[index] === current}
                  className="aspect-3/4 w-full"
                />
                <div className="flex flex-col gap-2">
                  <p className="text-micro caps text-blood-text">
                    {t("step", { number: index + 1 })}
                  </p>
                  <h3 className="font-heading text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-medium">
                    {step.title}
                  </h3>
                  <p className="text-body-lg">{step.howTo}</p>
                  <p className="sr-only">{t("youNeed")}</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-1">
                    {step.products.map((product) => (
                      <li key={product}>
                        <a
                          href={shopSearch(product)}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          aria-label={t("shopNamed", { product })}
                          className="inline-flex min-h-6 items-center gap-1 text-blood-text underline underline-offset-4 hover:text-foreground"
                        >
                          {product}
                          <RiArrowRightUpLine
                            aria-hidden="true"
                            className="size-4"
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
        {guide.finish && (
          <p className="max-w-[60ch] text-body-lg">
            <span className="me-2 text-micro caps text-blood-text">
              {t("finish")}
            </span>
            {guide.finish}
          </p>
        )}
      </section>
    </div>
  )
}

/**
 * A step's picture once it is done, brought into the light; until then the
 * character's silhouette (breathing while it renders); or "Not rendered".
 */
function Picture({
  step,
  alt,
  photo,
  current,
  className,
}: {
  step: StepView | undefined
  alt: string
  photo?: Photo
  /** It renders now (the steps after it wait for it). */
  current: boolean
  className?: string
}) {
  const t = useTranslations("FittingRoom")
  if (step?.status === "done" && step.image)
    return <Lit src={step.image} alt={alt} className={className} />
  if (step?.status === "failed") {
    return (
      <div
        className={cn(
          "flex items-center justify-center border border-foreground/10 bg-card",
          className
        )}
      >
        <span className="text-micro caps text-muted-foreground">
          {t("stepFailed")}
        </span>
      </div>
    )
  }
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-foreground/10 bg-black",
        className
      )}
    >
      <span className="step-silhouette" data-current={current || undefined}>
        {photo && (
          <Image
            src={photo.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain object-bottom"
          />
        )}
      </span>
      <span className="sr-only">{t("developing")}</span>
    </div>
  )
}

/** A finished picture, coming into the light once it has loaded. */
function Lit({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  const image = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  // Loaded before the page was ready: no load event comes.
  useEffect(() => {
    const done = image.current
    if (done?.complete && done.naturalWidth > 0) setLoaded(true)
  }, [])
  return (
    <div
      className={cn(
        "relative overflow-hidden border border-foreground/10 bg-black",
        className
      )}
    >
      <span className="photo-reveal" data-revealed={loaded || undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the visitor's own picture, through the server only */}
        <img
          ref={image}
          src={src}
          alt={alt}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth > 0) setLoaded(true)
          }}
          className="size-full object-contain"
        />
      </span>
    </div>
  )
}
