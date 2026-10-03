"use client"

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowRightUpLine,
  RiCloseLine,
} from "@remixicon/react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { type ReactNode, useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import type { Photo } from "@/lib/catalog/types"
import {
  type Frame,
  framesOf,
  renderingFrame,
  shownFrame,
} from "@/lib/fitting-room/frames"
import { photoUrl, type TryOnView } from "@/lib/fitting-room/try-on"
import { cn } from "@/lib/utils"

import { Mirror } from "./dressing-room"

/** A costume's makeup guide, as the page reads it (content/makeup.ts). */
export type GuideText = {
  look: string
  steps: { title: string; howTo: string; products: string[] }[]
  finish?: string
}

/** Where a product is looked for: a shop's search (owner: shops are links). */
export const shopSearch = (product: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(product)}`

/** The big vanity's glass: as tall as the screen allows, at most 42 rem. */
const GLASS_HEIGHT = "min(100svh - 18rem, 42rem)"

/**
 * A try-on as it develops, then as it came out (owner, 2026-10-03; spec
 * §11.4b): the visitor sits at the vanity. Its mirror shows one picture
 * at a time, large: the outfit, their face before, then after each makeup
 * step. Under it, the film strip holds every picture as a frame: a frame
 * not done yet is the character's silhouette in the dark, the one
 * rendering now breathing red; a picture that comes out comes into the
 * light. Beside the mirror, the try-on's `title`, how it is going, the
 * look, its `actions`, then the card of the picture shown: the step's
 * how-to and what to buy, with the way to the previous and next.
 *
 * Until the visitor picks a frame, the mirror follows the newest picture,
 * and once done shows the last: the whole transformation.
 */
export function TryOnSteps({
  tryOn,
  name,
  photo,
  guide,
  title,
  actions,
}: {
  tryOn: TryOnView
  /** The character. */
  name: string
  /** The costume's photo: its silhouette stands in for a step not done. */
  photo?: Photo
  guide: GuideText
  /** The try-on's heading. */
  title: ReactNode
  /** What can be done about it (a failure's alert, starting over). */
  actions?: ReactNode
}) {
  const t = useTranslations("FittingRoom")
  const frames = framesOf(tryOn, guide.steps.length)
  const now = renderingFrame(frames, tryOn)
  const [chosen, setChosen] = useState<number | null>(null)
  const shown = Math.min(chosen ?? shownFrame(frames, tryOn), frames.length - 1)
  const last = frames.length - 1
  const frame = frames[shown]
  const previous = useRef<HTMLButtonElement>(null)
  const next = useRef<HTMLButtonElement>(null)
  const strip = useRef<HTMLOListElement>(null)

  const makeup = frames.filter((each) => each.kind === "step")
  const ready = makeup.filter((each) => each.step?.status === "done").length
  const outfit = frames[0]?.kind === "outfit" ? frames[0].step : null
  const running = tryOn.status === "running"
  const status =
    tryOn.status === "done"
      ? t("progress.done")
      : running
        ? outfit && outfit.status !== "done"
          ? t("progress.outfit")
          : t("progress.makeup", { done: ready, count: makeup.length })
        : ""

  // Left to follow the try-on, the strip keeps the frame that matters in
  // sight: the one rendering, else the one in the mirror.
  const followed = chosen === null ? (now === -1 ? shown : now) : -1
  useEffect(() => {
    const list = strip.current
    const item = list?.children[followed] as HTMLElement | undefined
    if (!list || !item) return
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    list.scrollTo({
      left: item.offsetLeft - (list.clientWidth - item.clientWidth) / 2,
      behavior: still ? "auto" : "smooth",
    })
  }, [followed])

  function go(by: -1 | 1) {
    const to = Math.max(0, Math.min(last, shown + by))
    setChosen(to)
    // The button pressed is gone at either end: the other one keeps focus.
    if (to === 0) next.current?.focus()
    if (to === last) previous.current?.focus()
  }

  const frameName = (each: Frame) =>
    each.kind === "outfit"
      ? t("outfit")
      : each.kind === "before"
        ? t("before")
        : t("stepNamed", {
            number: each.number,
            title: guide.steps[each.number - 1].title,
          })
  const step = frame.kind === "step" ? guide.steps[frame.number - 1] : null

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 [grid-template-areas:'head'_'mirror'_'strip'_'card'] lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-[auto_1fr_auto] lg:[grid-template-areas:'mirror_head'_'mirror_card'_'strip_strip'] xl:gap-x-20">
      <div className="flex flex-col items-start gap-4 [grid-area:head]">
        {title}
        <p
          aria-live="polite"
          className="flex items-center gap-3 text-lead text-muted-foreground empty:hidden"
        >
          {running && <span aria-hidden="true" className="rec-dot shrink-0" />}
          {status}
        </p>
        {!tryOn.outfit && (
          <p className="max-w-[60ch] text-body-lg text-muted-foreground">
            {t("allMakeup", { name })}
          </p>
        )}
        <p className="max-w-[60ch] text-body-lg">{guide.look}</p>
        {actions}
      </div>

      <figure className="[grid-area:mirror]">
        <Mirror bulbs="lg" ratio={3 / 4} height={GLASS_HEIGHT} fog>
          <FrameView
            frame={frame}
            tryOn={tryOn}
            photo={photo}
            current={shown === now}
            alt={
              frame.kind === "outfit"
                ? t("outfitAlt", { name })
                : frame.kind === "before"
                  ? t("beforeAlt")
                  : t("stepAlt", {
                      number: frame.number,
                      title: guide.steps[frame.number - 1].title,
                    })
            }
            // A picture the mirror shows by itself comes into the light;
            // one the visitor picks surfaces at once.
            reveal={chosen === null}
            sizes="(min-width: 1024px) 34rem, 90vw"
            large
          />
        </Mirror>
      </figure>

      <ol
        ref={strip}
        aria-label={t("frames")}
        className="film-strip relative flex gap-3 ps-4 pe-16 [grid-area:strip] sm:gap-4"
      >
        {frames.map((each, index) => (
          <li key={index} className="shrink-0">
            <button
              type="button"
              aria-label={frameName(each)}
              aria-current={index === shown || undefined}
              onClick={() => setChosen(index)}
              className="group flex flex-col items-center gap-1.5 outline-offset-4"
            >
              <span className="film-frame relative block aspect-3/4 w-15 overflow-hidden bg-black sm:w-18">
                <FrameView
                  frame={each}
                  tryOn={tryOn}
                  photo={photo}
                  current={index === now}
                  alt=""
                  reveal
                  sizes="72px"
                />
              </span>
              <span
                className={cn(
                  "text-micro caps transition-colors",
                  index === shown
                    ? "text-blood-text"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {each.kind === "outfit"
                  ? t("outfitShort")
                  : each.kind === "before"
                    ? t("before")
                    : each.number}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className="flex flex-col items-start gap-4 [grid-area:card]">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="text-micro caps text-blood-text">
            {frame.kind === "step" &&
              t("stepOf", { number: frame.number, count: makeup.length })}
          </p>
          <div className="-me-3 flex">
            <Button
              ref={previous}
              variant="ghost"
              size="sm"
              onClick={() => go(-1)}
              className={cn("gap-1", shown === 0 && "invisible")}
            >
              <RiArrowLeftSLine aria-hidden="true" className="size-5" />
              {t("previous")}
            </Button>
            <Button
              ref={next}
              variant="ghost"
              size="sm"
              onClick={() => go(1)}
              className={cn("gap-1", shown === last && "invisible")}
            >
              {t("next")}
              <RiArrowRightSLine aria-hidden="true" className="size-5" />
            </Button>
          </div>
        </div>
        <h3 className="font-heading text-h4 font-medium text-balance">
          {step ? step.title : frameName(frame)}
        </h3>
        {step && (
          <>
            <p className="max-w-[60ch] text-body-lg">{step.howTo}</p>
            <p className="sr-only">{t("youNeed")}</p>
            <ul className="flex flex-col gap-1.5">
              {step.products.map((product) => (
                <li key={product}>
                  <a
                    href={shopSearch(product)}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    aria-label={t("shopNamed", { product })}
                    className="inline-flex min-h-6 items-center gap-1 text-lg text-blood-text underline decoration-blood/60 underline-offset-4 transition-colors hover:text-foreground"
                  >
                    {product}
                    <RiArrowRightUpLine aria-hidden="true" className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        {shown === last && guide.finish && (
          <div className="mt-4 flex max-w-[60ch] flex-col gap-2">
            <p className="text-micro caps text-blood-text">{t("finish")}</p>
            <p className="text-body-lg">{guide.finish}</p>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * What a frame holds, in the mirror (`large`) or on the strip: the picture
 * once done; the face before; until then the character's silhouette
 * (breathing while it renders, `current`); or nothing, "Not rendered".
 */
function FrameView({
  frame,
  tryOn,
  photo,
  current,
  alt,
  reveal,
  sizes,
  large = false,
}: {
  frame: Frame
  tryOn: TryOnView
  photo?: Photo
  current: boolean
  alt: string
  /** Comes into the light, rather than surfacing at once. */
  reveal: boolean
  sizes: string
  large?: boolean
}) {
  const t = useTranslations("FittingRoom")
  const image =
    frame.kind === "before"
      ? photoUrl("face", tryOn.face)
      : frame.step?.status === "done"
        ? frame.step.image
        : null

  if (image)
    return frame.kind === "before" || !reveal ? (
      // The visitor's own photos, through the server only: no optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={image}
        src={image}
        alt={alt}
        className="mirror-swap absolute inset-0 size-full object-contain"
      />
    ) : (
      <Lit key={image} src={image} alt={alt} />
    )

  if (frame.kind !== "before" && frame.step?.status === "failed")
    return large ? (
      <span className="absolute inset-0 flex items-center justify-center text-micro caps text-muted-foreground">
        {t("stepFailed")}
      </span>
    ) : (
      <span className="absolute inset-0 flex items-center justify-center text-muted-foreground/60">
        <RiCloseLine aria-hidden="true" className="size-5" />
      </span>
    )

  return (
    <>
      <span className="step-silhouette" data-current={current || undefined}>
        {photo && (
          <Image
            src={photo.url}
            alt=""
            fill
            sizes={sizes}
            className="object-contain object-bottom"
          />
        )}
      </span>
      {large && <span className="sr-only">{t("developing")}</span>}
    </>
  )
}

/** A finished picture, coming into the light once it has loaded. */
function Lit({ src, alt }: { src: string; alt: string }) {
  const image = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  // Loaded before the page was ready: no load event comes.
  useEffect(() => {
    const done = image.current
    if (done?.complete && done.naturalWidth > 0) setLoaded(true)
  }, [])
  return (
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
  )
}
