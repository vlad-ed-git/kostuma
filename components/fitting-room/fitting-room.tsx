"use client"

import { RiLoader4Line } from "@remixicon/react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState, useTransition } from "react"

import { AddToBasket } from "@/components/basket/add-to-basket"
import { useBasket } from "@/components/basket/basket-provider"
import { CostumeImage } from "@/components/costume/costume-image"
import { Pumpkin } from "@/components/icons/pumpkin"
import { costumesHref } from "@/components/layout/nav"
import { Button, buttonVariants } from "@/components/ui/button"
import { Link, useRouter } from "@/i18n/navigation"
import {
  startTryOn,
  type StartError,
  type StartResult,
} from "@/lib/fitting-room/actions"
import type { PhotoProblem } from "@/lib/fitting-room/photo-rules"
import type { RenderFailure } from "@/lib/fitting-room/provider"
import type { PhotoKind, TryOnView } from "@/lib/fitting-room/try-on"
import type { CostumeSummary } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

import { frameOf, PhotoPicker, previewOf, type Slot } from "./photo-picker"
import { type GuideText, TryOnSteps } from "./try-on-steps"

/** How often the page asks how a running try-on is doing. */
export const POLL_MS = 2_000

/**
 * The costume being tried on, with its makeup guide; `allMakeup`: no outfit
 * to try on, only the face photo needed.
 */
export type FittingCostume = CostumeSummary & {
  guide: GuideText
  allMakeup: boolean
}

type ErrorCode = Exclude<StartError | RenderFailure, PhotoProblem>

type Problem = {
  /** Its message under FittingRoom: every code has one. */
  message:
    `problems.${PhotoProblem}` | `errors.${ErrorCode}` | "errors.missing_face"
  /** The photo it is about, if one. */
  photo?: PhotoKind
}

const problemOf = (problem: PhotoProblem) => `problems.${problem}` as const

/** A start or a render that failed, as a message, on the photo at fault. */
function failureProblem(
  error: StartError | RenderFailure,
  photo?: PhotoKind
): Problem {
  if (error === "face_photo")
    return { message: "errors.face_photo", photo: "face" }
  if (error === "body_photo")
    return { message: "errors.body_photo", photo: "body" }
  if (
    error === "unreadable" ||
    error === "too_small" ||
    error === "odd_shape" ||
    error === "too_big"
  )
    return { message: problemOf(error), photo }
  return { message: `errors.${error}`, photo }
}

/**
 * The Fitting Room (owner, 2026-10-03), for the costumes in My Pumpkin
 * Basket: pick one, give the photos (the face, and head to toe unless the
 * character is all makeup), confirm them, and the try-on runs: the outfit
 * first, then the costume's makeup on the visitor's face, step by step,
 * every picture shown as it comes out. Once started, nothing can be changed
 * until it's done or fails.
 */
export function FittingRoom({
  costumes,
  selected,
  room,
  tryOn,
  open,
}: {
  /** Every costume that can be tried on. */
  costumes: readonly CostumeSummary[]
  /** The costume chosen (`?costume=`), if any. */
  selected: FittingCostume | null
  /** The photos the account used last, offered again. */
  room: { face: string | null; body: string | null }
  /** The chosen costume's latest try-on, if any. */
  tryOn: TryOnView | null
  /** False while renders can't run. */
  open: boolean
}) {
  const t = useTranslations("FittingRoom")
  const { ready, slugs, has } = useBasket()
  const router = useRouter()

  const bySlug = new Map(costumes.map((costume) => [costume.slug, costume]))
  const items = [...slugs].reverse().flatMap((slug) => bySlug.get(slug) ?? [])
  const first = items[0]?.slug

  // Nothing chosen yet: the costume added last.
  useEffect(() => {
    if (ready && !selected && first)
      router.replace(`/basket/fitting-room?costume=${first}`, { scroll: false })
  }, [ready, selected, first, router])

  if (!ready) {
    return (
      <div
        aria-hidden="true"
        className="mt-10 flex gap-3 [@media(scripting:none)]:hidden"
      >
        {[0, 1, 2].map((tile) => (
          <span key={tile} className="skeleton aspect-4/5 w-18" />
        ))}
      </div>
    )
  }

  if (items.length === 0 && !selected) return <EmptyBasket />

  return (
    <div className="mt-10 flex flex-col gap-12">
      {items.length > 0 && (
        <nav aria-label={t("costumes")}>
          <ul className="flex flex-wrap gap-3">
            {items.map((costume) => {
              const current = costume.slug === selected?.slug
              return (
                <li key={costume.slug}>
                  <Link
                    href={`/basket/fitting-room?costume=${costume.slug}`}
                    scroll={false}
                    aria-current={current ? "page" : undefined}
                    title={costume.name}
                    className={cn(
                      "relative block aspect-4/5 w-18 overflow-hidden border bg-card outline-offset-4 transition-[border-color,box-shadow] duration-300",
                      current
                        ? "border-blood-text shadow-[0_0_24px_color-mix(in_oklch,var(--blood)_45%,transparent)]"
                        : "border-foreground/10 hover:border-blood-text/50"
                    )}
                  >
                    <CostumeImage
                      photo={costume.photo}
                      alt={costume.name}
                      sizes="72px"
                      reveal={false}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {selected &&
        (has(selected.slug) ? (
          <Fitting
            key={selected.slug}
            costume={selected}
            room={room}
            initial={tryOn}
            open={open}
          />
        ) : (
          <div className="flex flex-col items-start gap-4">
            <p className="text-lead">
              {t("notInBasket", { name: selected.name })}
            </p>
            <AddToBasket slug={selected.slug} name={selected.name} />
          </div>
        ))}
    </div>
  )
}

/** One costume's try-on: its photos, the confirmation, then the pictures. */
function Fitting({
  costume,
  room,
  initial,
  open,
}: {
  costume: FittingCostume
  room: { face: string | null; body: string | null }
  initial: TryOnView | null
  open: boolean
}) {
  const t = useTranslations("FittingRoom")
  const [tryOn, setTryOn] = useState(initial)
  const [stage, setStage] = useState<"photos" | "confirm" | "follow">(
    initial ? "follow" : "photos"
  )
  // The photos this costume needs: no body photo when it is all makeup.
  const kinds: readonly PhotoKind[] = costume.allMakeup
    ? ["face"]
    : ["face", "body"]
  const [slots, setSlots] = useState<Record<PhotoKind, Slot>>({
    face: room.face ? { kind: "kept", id: room.face } : null,
    body: room.body ? { kind: "kept", id: room.body } : null,
  })
  const [problem, setProblem] = useState<Problem | null>(null)
  const [pending, startTransition] = useTransition()
  const heading = useRef<HTMLHeadingElement>(null)

  useFollow(tryOn, setTryOn)

  // Each stage starts at its title.
  const moved = useRef(false)
  useEffect(() => {
    if (moved.current) heading.current?.focus()
    moved.current = true
  }, [stage])

  // Picked photos' previews live in this page's memory until it's left.
  const picked = Object.values(slots).flatMap((slot) =>
    slot?.kind === "picked" ? [slot.photo.url] : []
  )
  const urls = useRef<string[]>([])
  useEffect(() => {
    urls.current = picked
  })
  useEffect(
    () => () => urls.current.forEach((url) => URL.revokeObjectURL(url)),
    []
  )

  function setSlot(kind: PhotoKind, slot: Slot) {
    const before = slots[kind]
    if (before?.kind === "picked") URL.revokeObjectURL(before.photo.url)
    setSlots((current) => ({ ...current, [kind]: slot }))
    if (problem?.photo === kind || !problem?.photo) setProblem(null)
  }

  function start() {
    const form = new FormData()
    form.set("costume", costume.slug)
    for (const kind of kinds) {
      const slot = slots[kind]
      if (slot?.kind === "picked")
        form.set(
          kind,
          new File([slot.photo.blob], `${kind}.jpg`, { type: "image/jpeg" })
        )
      if (slot?.kind === "kept")
        form.set(kind === "face" ? "keepFace" : "keepBody", slot.id)
    }
    startTransition(async () => {
      let result: StartResult
      try {
        result = await startTryOn(form)
      } catch {
        result = { ok: false, error: "unknown" }
      }
      if (result.ok) {
        setProblem(null)
        setTryOn(result.tryOn)
        setStage("follow")
      } else {
        setProblem(failureProblem(result.error, result.photo))
        setStage(result.photo ? "photos" : "confirm")
      }
    })
  }

  const chosen = kinds.every((kind) => slots[kind] !== null)
  const alert = problem && !problem.photo && (
    <p
      role="alert"
      className="border border-destructive/40 px-4 py-3 text-destructive"
    >
      {t(problem.message)}
    </p>
  )

  if (stage === "follow" && tryOn) {
    const ended = tryOn.status !== "running"
    // A failed try-on says why, and the photos open on the one at fault.
    const failed = tryOn.failure ? failureProblem(tryOn.failure) : null
    return (
      <section aria-labelledby="fitting" className="flex flex-col gap-8">
        <h2
          id="fitting"
          ref={heading}
          tabIndex={-1}
          className="font-heading text-display-fit font-semibold text-balance outline-none"
        >
          {costume.name}
        </h2>
        {tryOn.status === "failed" && failed && (
          <p
            role="alert"
            className="max-w-[60ch] border border-destructive/40 px-4 py-3 text-destructive"
          >
            {t(failed.message)}
          </p>
        )}
        {ended && open && (
          <Button
            variant={tryOn.status === "failed" ? "default" : "outline"}
            size="lg"
            className="w-fit"
            onClick={() => {
              setProblem(failed?.photo ? failed : null)
              setStage("photos")
            }}
          >
            {tryOn.status === "failed" ? t("retry") : t("again")}
          </Button>
        )}
        <TryOnSteps
          tryOn={tryOn}
          name={costume.name}
          photo={costume.photo}
          guide={costume.guide}
        />
      </section>
    )
  }

  if (!open) {
    return <p className="text-lead text-muted-foreground">{t("closed")}</p>
  }

  if (stage === "confirm" && chosen) {
    return (
      <section aria-labelledby="fitting" className="flex flex-col gap-8">
        <h2
          id="fitting"
          ref={heading}
          tabIndex={-1}
          className="font-heading text-h2 font-semibold text-balance outline-none"
        >
          {t("confirm.title", { name: costume.name })}
        </h2>
        <p className="max-w-[60ch] text-lead">{t("confirm.line")}</p>
        <div className="flex flex-wrap items-end gap-6">
          <div className="relative aspect-4/5 w-32 overflow-hidden border border-foreground/10 bg-card">
            <CostumeImage
              photo={costume.photo}
              alt={costume.name}
              sizes="128px"
              reveal={false}
            />
          </div>
          {kinds.map((kind) => (
            <div
              key={kind}
              className={cn(
                "w-40 overflow-hidden border border-foreground/10 bg-black",
                frameOf[kind]
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- the visitor's own photo */}
              <img
                src={previewOf(kind, slots[kind]) ?? ""}
                alt={t(`photos.${kind}`)}
                className="size-full object-contain"
              />
            </div>
          ))}
        </div>
        {alert}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            size="lg"
            aria-busy={pending || undefined}
            disabled={pending}
            onClick={start}
            className="gap-2"
          >
            {pending && (
              <RiLoader4Line
                aria-hidden="true"
                className="size-4 animate-spin motion-reduce:animate-none"
              />
            )}
            {pending ? t("confirm.starting") : t("confirm.start")}
          </Button>
          {!pending && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setStage("photos")}
            >
              {t("confirm.back")}
            </Button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="fitting" className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2
          id="fitting"
          ref={heading}
          tabIndex={-1}
          className="font-heading text-h2 font-semibold text-balance outline-none"
        >
          {t("photos.title")}
        </h2>
        <p className="max-w-[60ch] text-lead text-muted-foreground">
          {costume.allMakeup
            ? t("photos.lineFace", { name: costume.name })
            : t("photos.line")}
        </p>
      </div>
      <div className="grid gap-10 sm:grid-cols-2">
        {kinds.map((kind) => (
          <PhotoPicker
            key={kind}
            kind={kind}
            slot={slots[kind]}
            error={problem?.photo === kind ? t(problem.message) : undefined}
            onPick={(photo) => setSlot(kind, { kind: "picked", photo })}
            onProblem={(found) =>
              setProblem({ message: problemOf(found), photo: kind })
            }
          />
        ))}
      </div>
      {alert}
      <Button
        size="lg"
        className="w-fit"
        onClick={() => {
          if (!chosen) {
            setProblem({
              message: costume.allMakeup
                ? "errors.missing_face"
                : "errors.missing_photo",
            })
            return
          }
          setProblem(null)
          setStage("confirm")
        }}
      >
        {t("photos.continue")}
      </Button>
    </section>
  )
}

/** Asks how a running try-on is doing every POLL_MS, until it ends. */
function useFollow(
  tryOn: TryOnView | null,
  setTryOn: (tryOn: TryOnView) => void
) {
  const id = tryOn?.id
  const running = tryOn?.status === "running"
  useEffect(() => {
    if (!id || !running) return
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    const ask = async () => {
      try {
        const response = await fetch(`/api/fitting-room/try-ons/${id}`, {
          cache: "no-store",
        })
        // Signed out meanwhile: stop asking; the page says so on reload.
        if (response.status === 401 || response.status === 404) return
        if (response.ok && !stopped)
          setTryOn((await response.json()) as TryOnView)
      } catch {
        // Offline for a moment: the next ask tries again.
      }
      if (!stopped) timer = setTimeout(ask, POLL_MS)
    }
    timer = setTimeout(ask, 0)
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [id, running, setTryOn])
}

/** No costume in the basket: where to find one. */
function EmptyBasket() {
  const t = useTranslations("FittingRoom")
  return (
    <div className="mt-16 flex flex-col items-center gap-4 text-center">
      <Pumpkin className="size-16 text-muted-foreground" />
      <h2 className="font-heading text-h2 font-semibold">{t("emptyBasket")}</h2>
      <p className="text-lead text-muted-foreground">{t("emptyLine")}</p>
      <Link
        href={costumesHref}
        className={buttonVariants({ size: "lg", className: "mt-4" })}
      >
        {t("browse")}
      </Link>
    </div>
  )
}
