"use client"

import { RiArrowRightUpLine } from "@remixicon/react"
import { useTranslations } from "next-intl"

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
 * outfit on the visitor's body photo, then their face before and after
 * each makeup step, with what to do and what to buy. A step still rendering
 * sits in the darkroom's red light; a finished one comes up out of the black.
 */
export function TryOnSteps({
  tryOn,
  name,
  guide,
}: {
  tryOn: TryOnView
  /** The character. */
  name: string
  guide: GuideText
}) {
  const t = useTranslations("FittingRoom")
  const [outfit, ...makeup] = tryOn.steps
  const ready = makeup.filter((step) => step.status === "done").length

  const status =
    tryOn.status === "done"
      ? t("progress.done")
      : tryOn.status === "running"
        ? outfit?.status !== "done"
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
        <Picture
          step={outfit}
          alt={t("outfitAlt", { name })}
          className="aspect-2/3 w-full max-w-md"
        />
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

/** A step's picture: developing, come out, or not rendered. */
function Picture({
  step,
  alt,
  className,
}: {
  step: StepView | undefined
  alt: string
  className?: string
}) {
  const t = useTranslations("FittingRoom")
  if (step?.status === "done" && step.image) {
    return (
      <div
        className={cn(
          "overflow-hidden border border-foreground/10 bg-black",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- the visitor's own picture, through the server only */}
        <img
          src={step.image}
          alt={alt}
          className="developed size-full object-contain"
        />
      </div>
    )
  }
  const failed = step?.status === "failed"
  return (
    <div
      className={cn(
        "flex items-center justify-center border border-foreground/10",
        failed ? "bg-card" : "developing",
        className
      )}
    >
      <span className="text-micro caps text-muted-foreground">
        {failed ? t("stepFailed") : t("developing")}
      </span>
    </div>
  )
}
