"use client"

import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowRightUpLine,
  RiCloseLine,
  RiDownload2Line,
} from "@remixicon/react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import {
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"

import { Buy } from "@/components/basket/buy"
import { Button } from "@/components/ui/button"
import type { Photo, ShopLink } from "@/lib/catalog/types"
import {
  type Frame,
  framesOf,
  pictureName,
  renderingFrame,
  shownFrame,
} from "@/lib/fitting-room/frames"
import type { TryOnView } from "@/lib/fitting-room/try-on"
import { minutesOf, productsOf } from "@/lib/guide-kit"
import type { GuideText, Product } from "@/lib/guides"
import { cn } from "@/lib/utils"

import { Mirror } from "./dressing-room"

export type { GuideText } from "@/lib/guides"

/** Where a product is looked for: a shop's search (owner: shops are links). */
export const shopSearch = (product: string) =>
  `https://www.amazon.com/s?k=${encodeURIComponent(product)}`

/** The big vanity's glass: as tall as the screen allows, at most 42 rem. */
const GLASS_HEIGHT = "min(100svh - 18rem, 42rem)"

/**
 * A try-on as it develops, then as it came out (owner, 2026-10-03; spec
 * §11.4b): the visitor sits at the vanity. Its mirror shows one picture
 * at a time, large: the outfit, then their face after each makeup step.
 * Beside it, the main thing: "Step n of N", the step's how-to and what to
 * buy, and the way to the previous and next step. Under them, the film
 * strip holds every picture as a frame: a frame not done yet is the
 * character's silhouette in the dark, the one rendering now breathing red;
 * a picture that comes out comes into the light. `failure` (what went
 * wrong and what to do) heads the card; `after` (starting over) closes the
 * try-on. How it is going is told to screen readers only.
 *
 * Until the visitor picks a frame, the mirror follows the newest picture,
 * and once done shows the last: the whole transformation.
 */
export function TryOnSteps({
  tryOn,
  name,
  photo,
  guide,
  shops,
  title,
  failure,
  after,
}: {
  tryOn: TryOnView
  /** The character. */
  name: string
  /** The costume's photo: its silhouette stands in for a step not done. */
  photo?: Photo
  guide: GuideText
  /** Where to buy the costume: Buy on the outfit's card. */
  shops?: readonly [ShopLink, ...ShopLink[]]
  /** The try-on's heading (for screen readers: the page names the character). */
  title: ReactNode
  failure?: ReactNode
  after?: ReactNode
}) {
  const t = useTranslations("FittingRoom")
  const frames = framesOf(tryOn, guide.steps.length)
  const now = renderingFrame(frames, tryOn)
  const [chosen, setChosen] = useState<number | null>(null)
  const last = frames.length - 1
  const shown = Math.min(chosen ?? shownFrame(frames, tryOn), last)
  const frame = frames[shown]
  const previous = useRef<HTMLButtonElement>(null)
  const next = useRef<HTMLButtonElement>(null)
  const strip = useRef<HTMLOListElement>(null)
  const mirror = useRef<HTMLElement>(null)

  const makeup = frames.filter((each) => each.kind === "step")
  const ready = makeup.filter((each) => each.step?.status === "done").length
  const outfit = frames[0]?.kind === "outfit" ? frames[0].step : null
  // The outfit on the face too: still the outfit, as far as the visitor knows.
  const dressing = tryOn.dressed ? tryOn.steps[1] : null
  const status =
    tryOn.status === "done"
      ? t("progress.done")
      : tryOn.status === "running"
        ? (outfit && outfit.status !== "done") || dressing?.status === "working"
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

  // The first makeup step: where a finished try-on's guide starts.
  const firstStep = frames.findIndex((each) => each.kind === "step")
  // Before step 1, what the whole makeup asks (todo COPY-12): on the
  // outfit's card, the makeup's way in; without an outfit, on step 1's.
  const beforeMakeup = shown === Math.max(0, firstStep - 1)
  /**
   * At the last frame of a finished try-on, the way on is back to step 1:
   * the visitor's next job is to sit at the vanity and follow it (todo
   * UX-03).
   */
  const restartsAt = (index: number) =>
    tryOn.status === "done" &&
    index === last &&
    firstStep >= 0 &&
    firstStep < last
  const restart = restartsAt(shown)

  function go(by: -1 | 1) {
    const to = Math.max(0, Math.min(last, shown + by))
    setChosen(to)
    // The button pressed is gone at either end: the other one keeps focus.
    if (to === 0) next.current?.focus()
    if (to === last && !restartsAt(to)) previous.current?.focus()
  }

  /**
   * A frame picked on the strip. Below `lg` the strip sits under the card,
   * the mirror above them both: it comes into view, or the picture changes
   * out of sight (todo UX-02).
   */
  function pick(index: number) {
    setChosen(index)
    const glass = mirror.current
    if (!glass || !matchMedia("(max-width: 1023.98px)").matches) return
    const { top, bottom } = glass.getBoundingClientRect()
    if (top >= 0 && bottom <= innerHeight) return
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    glass.scrollIntoView({
      block: "start",
      behavior: still ? "auto" : "smooth",
    })
  }

  const frameName = (each: Frame) =>
    each.kind === "outfit"
      ? t("outfit")
      : t("stepNamed", {
          number: each.number,
          title: guide.steps[each.number - 1].title,
        })
  const step = frame?.kind === "step" ? guide.steps[frame.number - 1] : null

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-10 [grid-template-areas:'mirror'_'card'_'strip'_'after'] lg:grid-cols-[auto_minmax(0,1fr)] lg:[grid-template-areas:'mirror_card'_'strip_strip'_'after_after'] xl:gap-x-20">
      {title}
      <p aria-live="polite" className="sr-only">
        {status}
      </p>

      <figure ref={mirror} className="scroll-mt-20 [grid-area:mirror]">
        <Mirror bulbs="lg" ratio={3 / 4} height={GLASS_HEIGHT} fog>
          {frame && (
            <FrameView
              frame={frame}
              photo={photo}
              current={shown === now}
              alt={
                frame.kind === "outfit"
                  ? t("outfitAlt", { name })
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
          )}
        </Mirror>
        {frame?.step?.status === "done" && frame.step.image && (
          <SavePicture
            key={frame.step.image}
            src={frame.step.image}
            name={pictureName(
              tryOn.slug,
              frame.kind === "outfit" ? "outfit" : frame.number
            )}
          />
        )}
        {tryOn.status === "running" && (
          // How long, and that leaving is fine: it goes on (todo UX-07).
          <p className="mt-6 max-w-[44ch] text-muted-foreground">
            {t("takesTime")}
          </p>
        )}
      </figure>

      <div className="flex flex-col items-start gap-5 [grid-area:card] lg:pt-2">
        {failure}
        {tryOn.busy && (
          // YouCam is busy: the try-on waits its turn (calls.ts).
          <p className="max-w-[60ch] text-lead text-blood-text">{t("busy")}</p>
        )}
        {beforeMakeup && frame?.kind === "step" && (
          <BeforeMakeup guide={guide} />
        )}
        {frame?.kind === "step" && (
          <p className="text-label caps text-blood-text">
            {t("stepOf", { number: frame.number, count: makeup.length })}
          </p>
        )}
        {frame && (
          <h3 className="font-heading text-h2 font-semibold text-balance">
            {step ? step.title : frameName(frame)}
          </h3>
        )}
        {frame?.kind === "outfit" && (
          // Before the makeup (owner, 2026-10-03): what to buy, then on;
          // Buy right there, as in the basket (todo UX-16).
          <div className="flex max-w-[60ch] flex-col items-start gap-3 text-lead">
            <p>{t("outfitNote")}</p>
            {shops && <Buy name={name} shops={shops} />}
            <p>{t("outfitThen")}</p>
            {beforeMakeup && makeup.length > 0 && (
              <BeforeMakeup guide={guide} />
            )}
          </div>
        )}
        {step && (
          <>
            <p className="max-w-[60ch] text-lead">{step.howTo}</p>
            <p className="sr-only">{t("youNeed")}</p>
            <ul className="flex flex-col gap-1.5">
              {step.products.map((product) => (
                <li key={product.name}>
                  <ProductLink product={product} />
                </li>
              ))}
            </ul>
          </>
        )}
        {shown === last && guide.finish && (
          <div className="flex max-w-[60ch] flex-col gap-2">
            <p className="text-micro caps text-blood-text">{t("finish")}</p>
            <p className="text-body-lg">{guide.finish}</p>
          </div>
        )}
        {frames.length > 1 && (
          // Phones: the next step first, the width of the screen.
          <div className="mt-3 flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row">
            <Button
              ref={previous}
              variant="outline"
              size="lg"
              onClick={() => go(-1)}
              className={cn(
                "gap-1.5",
                shown === 0 && "max-sm:hidden sm:invisible"
              )}
            >
              <RiArrowLeftSLine aria-hidden="true" className="size-5" />
              {t("previous")}
            </Button>
            <Button
              ref={next}
              size="lg"
              onClick={() => (restart ? pick(firstStep) : go(1))}
              className={cn(
                "gap-1.5",
                shown === last && !restart && "max-sm:hidden sm:invisible"
              )}
            >
              {restart
                ? t("startGuide")
                : frame?.kind === "outfit"
                  ? t("applyMakeup")
                  : t("next")}
              <RiArrowRightSLine aria-hidden="true" className="size-5" />
            </Button>
          </div>
        )}
      </div>

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
              onClick={() => pick(index)}
              className="group flex flex-col items-center gap-1.5 outline-offset-4"
            >
              <span className="film-frame relative block aspect-3/4 w-15 overflow-hidden bg-black sm:w-18">
                <FrameView
                  frame={each}
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
                {each.kind === "outfit" ? t("outfitShort") : each.number}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {after && <div className="[grid-area:after]">{after}</div>}
      {makeup.length > 0 && <PrintGuide name={name} guide={guide} />}
    </div>
  )
}

/**
 * "Save" under the mirror (todo OPP-11): the picture it shows, the same
 * JPEG, unaltered, as the visitor's own file. On a phone that can share
 * files, the share sheet, to keep it or send it on (Kostuma publishes
 * nothing); elsewhere, the download.
 */
function SavePicture({ src, name }: { src: string; name: string }) {
  const t = useTranslations("FittingRoom")
  const href = `${src}${src.includes("?") ? "&" : "?"}download=1`
  const link = useRef<HTMLAnchorElement>(null)
  // The share failed: the link downloads, as it does without one.
  const unshared = useRef(false)
  // Fetched before the tap (the browser has it already): a share must
  // start from the tap itself, with nothing awaited first.
  const [file, setFile] = useState<File | null>(null)
  useEffect(() => {
    if (!matchMedia("(pointer: coarse)").matches) return
    if (!("canShare" in navigator)) return
    let current = true
    fetch(src)
      .then((response) => (response.ok ? response.blob() : null))
      .then((blob) => {
        if (!current || !blob) return
        const ready = new File([blob], name, { type: "image/jpeg" })
        if (navigator.canShare({ files: [ready] })) setFile(ready)
      })
      // Not shareable: the download it is.
      .catch(() => {})
    return () => {
      current = false
    }
  }, [src, name])

  return (
    <a
      ref={link}
      href={href}
      download={name}
      aria-label={t("saveLabel")}
      onClick={(event) => {
        if (!file || unshared.current) return
        event.preventDefault()
        navigator.share({ files: [file] }).catch((error: unknown) => {
          // Closing the sheet is a choice; anything else, the download.
          if (error instanceof DOMException && error.name === "AbortError")
            return
          unshared.current = true
          link.current?.click()
        })
      }}
      className="mt-4 inline-flex h-10 items-center gap-2 text-ui caps text-foreground transition-colors hover:text-blood-text"
    >
      <RiDownload2Line aria-hidden="true" className="size-5" />
      {t("save")}
    </a>
  )
}

/** A product, as a link to a shop's search for it (new tab). */
function ProductLink({ product }: { product: Product }) {
  const t = useTranslations("FittingRoom")
  return (
    <a
      href={shopSearch(product.search)}
      target="_blank"
      rel="noopener noreferrer nofollow"
      aria-label={t("shopNamed", { product: product.name })}
      className="inline-flex min-h-6 items-center gap-1 text-lg text-blood-text underline decoration-blood/60 underline-offset-4 transition-colors hover:text-foreground"
    >
      {product.name}
      <RiArrowRightUpLine aria-hidden="true" className="size-4" />
    </a>
  )
}

/**
 * What the whole makeup asks before step 1: about how long it takes (todo
 * OPP-12: to plan Halloween night), every product once with its shop link
 * (one shopping trip), and its safety: products made for skin, a patch
 * test, paint and fake blood kept out of the eyes (todo COPY-12; the Terms
 * say it at length).
 */
function BeforeMakeup({ guide }: { guide: GuideText }) {
  const t = useTranslations("FittingRoom")
  const needs = useId()
  return (
    <div className="flex max-w-[60ch] flex-col gap-4">
      <p className="text-body-lg">{t("time", { minutes: minutesOf(guide) })}</p>
      <div className="flex flex-col gap-2">
        <p id={needs} className="text-micro caps text-blood-text">
          {t("whatYouNeed")}
        </p>
        <ul
          aria-labelledby={needs}
          className="grid gap-x-8 gap-y-1.5 sm:grid-cols-2"
        >
          {productsOf(guide).map((product) => (
            <li key={product.search}>
              <ProductLink product={product} />
            </li>
          ))}
        </ul>
      </div>
      <p className="text-body-lg text-muted-foreground">{t("safety")}</p>
    </div>
  )
}

const noChange = () => () => {}

/**
 * The makeup guide on paper (todo OPP-12): printing a try-on prints the
 * guide alone, black on white (globals.css), a page to prop against the
 * mirror: the character, how long, what you need, the safety, every step
 * with its products, and the finish. Never on screen. It hangs off <body>,
 * in the browser only, so print can show it and nothing else.
 */
function PrintGuide({ name, guide }: { name: string; guide: GuideText }) {
  const t = useTranslations("FittingRoom")
  const browser = useSyncExternalStore(
    noChange,
    () => true,
    () => false
  )
  if (!browser) return null
  return createPortal(
    <article className="print-guide">
      <h1>{name}</h1>
      <p>{t("time", { minutes: minutesOf(guide) })}</p>
      <h2>{t("whatYouNeed")}</h2>
      <ul className="print-guide-needs">
        {productsOf(guide).map((product) => (
          <li key={product.search}>{product.name}</li>
        ))}
      </ul>
      <p>{t("safety")}</p>
      <ol>
        {guide.steps.map((step, index) => (
          <li key={index}>
            <h2>
              {t("stepOf", { number: index + 1, count: guide.steps.length })}
            </h2>
            <h3>{step.title}</h3>
            <p>{step.howTo}</p>
            <p>{step.products.map((product) => product.name).join(" · ")}</p>
          </li>
        ))}
      </ol>
      {guide.finish && (
        <section>
          <h2>{t("finish")}</h2>
          <p>{guide.finish}</p>
        </section>
      )}
    </article>,
    document.body
  )
}

/**
 * What a frame holds, in the mirror (`large`) or on the strip: the picture
 * once done; until then the character's silhouette (breathing while it
 * renders, `current`); or nothing, "Not rendered".
 */
function FrameView({
  frame,
  photo,
  current,
  alt,
  reveal,
  sizes,
  large = false,
}: {
  frame: Frame
  photo?: Photo
  current: boolean
  alt: string
  /** Comes into the light, rather than surfacing at once. */
  reveal: boolean
  sizes: string
  large?: boolean
}) {
  const t = useTranslations("FittingRoom")
  const image = frame.step?.status === "done" ? frame.step.image : null

  if (image)
    return reveal ? (
      <Lit key={image} src={image} alt={alt} />
    ) : (
      // The visitor's own pictures, through the server only: no optimizer.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={image}
        src={image}
        alt={alt}
        className="mirror-swap absolute inset-0 size-full object-contain"
      />
    )

  if (frame.step?.status === "failed")
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
