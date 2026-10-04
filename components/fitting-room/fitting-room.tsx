"use client"

import { RiLoader4Line } from "@remixicon/react"
import { useTranslations } from "next-intl"
import {
  type ReactNode,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react"

import { AddToBasket } from "@/components/basket/add-to-basket"
import { useBasket } from "@/components/basket/basket-provider"
import { CostumeImage } from "@/components/costume/costume-image"
import { costumesHref } from "@/components/layout/nav"
import { GetPro } from "@/components/pro/get-pro"
import { breaks } from "@/components/ui/breaks"
import { Button, buttonVariants } from "@/components/ui/button"
import { Link, useRouter } from "@/i18n/navigation"
import {
  startTryOn,
  type StartError,
  type StartResult,
} from "@/lib/fitting-room/actions"
import { fitsOneSend, type PhotoProblem } from "@/lib/fitting-room/photo-rules"
import { PHOTO_CONSENT_VERSION } from "@/lib/fitting-room/consent"
import { FAILED_TRIES } from "@/lib/fitting-room/free-costume"
import type { RenderFailure } from "@/lib/fitting-room/provider"
import type { PhotoKind, TryOnView } from "@/lib/fitting-room/try-on"
import type { CostumeSummary, ShopLink } from "@/lib/catalog/types"
import { cn } from "@/lib/utils"

import { Mirror } from "./dressing-room"
import { PhotoConsent } from "./photo-consent"
import { PhotoMirror, PhotoPicker, previewOf, type Slot } from "./photo-picker"
import { CostumeRail, EmptyRail, RailSkeleton } from "./rail"
import { ReplacePhotos } from "./replace-photos"
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
  /** Where to buy it: the outfit's card offers Buy (todo UX-16). */
  shops: readonly [ShopLink, ...ShopLink[]]
}

/** The costume the free costume went to: a link while its try-on is kept. */
export type UsedOn = { name: string; slug: string; linked: boolean }

type ErrorCode = Exclude<StartError | RenderFailure, PhotoProblem>

type Problem = {
  /** Its message under FittingRoom: every code has one. */
  message:
    | `problems.${PhotoProblem}`
    | `errors.${ErrorCode}`
    | "errors.missing_face"
    | "errors.same_photos"
    | "errors.too_large"
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
    error === "heic" ||
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
 * until it's done or fails. Every account tries one costume on free: once
 * it's used, Kostuma Pro instead.
 */
export function FittingRoom({
  costumes,
  selected,
  room,
  tryOn,
  open,
  free,
  triesLeft,
  usedOn,
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
  /** Whether the account's free costume is still there. */
  free: boolean
  /** While it is: the failures of their photos it still allows. */
  triesLeft: number
  /** The costume tried on with it, once used. */
  usedOn: UsedOn | null
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
      <div className="mt-8">
        <RailSkeleton />
      </div>
    )
  }

  if (items.length === 0 && !selected) return <EmptyBasket />

  return (
    <div className="mt-8 flex flex-col gap-10 lg:gap-14">
      {items.length > 0 && (
        <CostumeRail costumes={items} selected={selected?.slug} />
      )}

      {selected &&
        (has(selected.slug) ? (
          <Fitting
            key={selected.slug}
            costume={selected}
            room={room}
            initial={tryOn}
            open={open}
            free={free}
            triesLeft={triesLeft}
            usedOn={usedOn}
          />
        ) : (
          <div className="flex items-center gap-6 sm:gap-10">
            <div className="relative aspect-4/5 w-28 shrink-0 sm:w-40">
              <CostumeImage
                photo={selected.photo}
                alt={selected.name}
                sizes="160px"
              />
            </div>
            <div className="flex flex-col items-start gap-5">
              <p className="font-heading text-h4 font-medium text-balance">
                {t.rich("notInBasket", { name: selected.name, ...breaks })}
              </p>
              <AddToBasket slug={selected.slug} name={selected.name} />
            </div>
          </div>
        ))}
    </div>
  )
}

/**
 * A stage of the try-on (spec §11.4b): on large screens the mirrors on the
 * left and the words beside them; on phones the words first.
 */
const stageGrid =
  "grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-[auto_1fr] xl:gap-x-20"

/** The photos' mirrors: smaller on phones, beside their buttons. */
const photoHeight = "[--photo-h:10rem] sm:[--photo-h:clamp(15rem,34svh,21rem)]"

/**
 * One costume's try-on: its photos, the confirmation, then the pictures; or,
 * the free costume used, Kostuma Pro.
 */
function Fitting({
  costume,
  room,
  initial,
  open,
  free: freeHere,
  triesLeft,
  usedOn,
}: {
  costume: FittingCostume
  room: { face: string | null; body: string | null }
  initial: TryOnView | null
  open: boolean
  free: boolean
  triesLeft: number
  usedOn: UsedOn | null
}) {
  const t = useTranslations("FittingRoom")
  const router = useRouter()
  const [tryOn, setTryOn] = useState(initial)
  // A start the server refused: the free costume went meanwhile.
  const [refused, setRefused] = useState(false)
  // A try-on running or done holds the account's free costume; the page's
  // word (read again once a try-on ends) tells the rest.
  const free = freeHere && !refused && (!tryOn || tryOn.status === "failed")
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
  // Replacing the photos of a finished try-on: the photos as they were, to
  // keep them after all (nothing changes until the new try-on starts).
  const [kept, setKept] = useState<Record<PhotoKind, Slot> | null>(null)
  const [problem, setProblem] = useState<Problem | null>(null)
  // The consent to the photos' processing, asked before every start.
  const [agreed, setAgreed] = useState(false)
  const [unagreed, setUnagreed] = useState(false)
  const [pending, startTransition] = useTransition()
  const title = useRef<HTMLHeadingElement>(null)

  // Ended, a try-on may have given the free costume back, or used it up.
  useFollow(tryOn, setTryOn, () => router.refresh())

  // Each stage starts at its title.
  const moved = useRef(false)
  useEffect(() => {
    if (moved.current) title.current?.focus()
    moved.current = true
  }, [stage, free])

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
    if (before?.kind === "picked" && before !== kept?.[kind])
      URL.revokeObjectURL(before.photo.url)
    setSlots((current) => ({ ...current, [kind]: slot }))
    // As things stand when the photo is read: another may have been refused
    // meanwhile, and its message stays.
    setProblem((current) =>
      current?.photo === kind || !current?.photo ? null : current
    )
  }

  /** A slot still holding the photo the shown try-on was made from. */
  const unchanged = (kind: PhotoKind) => {
    const slot = slots[kind]
    const made = kind === "face" ? tryOn?.face : tryOn?.body
    return slot?.kind === "kept" && slot.id === made
  }

  /** From a finished try-on to the photos, once the visitor has agreed. */
  function replace() {
    setKept(slots)
    setProblem(null)
    setStage("photos")
  }

  /** Back to the finished try-on, with the photos it was made from. */
  function keepCurrent() {
    if (!kept) return
    for (const kind of ["face", "body"] as const) {
      const slot = slots[kind]
      if (slot?.kind === "picked" && slot !== kept[kind])
        URL.revokeObjectURL(slot.photo.url)
    }
    setSlots(kept)
    setKept(null)
    setProblem(null)
    setStage("follow")
  }

  /**
   * On to the confirmation, unless nothing new would come of it: after a
   * finished try-on, at least one photo must change (the same ones only
   * show it again); after a photo was at fault, that one must (it would
   * fail again, after paying for the outfit once more).
   */
  function proceed() {
    if (!chosen) {
      setProblem({
        message: costume.allMakeup
          ? "errors.missing_face"
          : "errors.missing_photo",
      })
      return
    }
    if (tryOn?.status === "failed" && tryOn.failure) {
      const fault = failureProblem(tryOn.failure)
      if (fault.photo && unchanged(fault.photo)) {
        setProblem(fault)
        return
      }
    } else if (tryOn && kinds.every(unchanged)) {
      setProblem({ message: "errors.same_photos" })
      return
    }
    setProblem(null)
    setStage("confirm")
  }

  function start() {
    if (!agreed) {
      setUnagreed(true)
      return
    }
    // Past the server's limit, the request would be refused unread.
    const sizes = kinds.map((kind) => {
      const slot = slots[kind]
      return slot?.kind === "picked" ? slot.photo.blob.size : 0
    })
    if (!fitsOneSend(sizes)) {
      setProblem({ message: "errors.too_large" })
      return
    }
    const form = new FormData()
    form.set("costume", costume.slug)
    form.set("consent", PHOTO_CONSENT_VERSION)
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
      if (!result.ok && result.error === "out_of_units") {
        // Used meanwhile (another tab): back to the try-on, if replacing
        // its photos, else Kostuma Pro.
        setRefused(true)
        if (kept) keepCurrent()
        else setProblem(null)
      } else if (!result.ok && result.error === "consent_required") {
        setAgreed(false)
        setUnagreed(true)
      } else if (result.ok) {
        // The photos are the account's now: kept by id, as a reload has
        // them, so the next change is told from them.
        const made = result.tryOn
        for (const kind of kinds) {
          const slot = slots[kind]
          if (slot?.kind === "picked") URL.revokeObjectURL(slot.photo.url)
        }
        setSlots((current) => ({
          face: { kind: "kept", id: made.face },
          body: made.body ? { kind: "kept", id: made.body } : current.body,
        }))
        setKept(null)
        setProblem(null)
        setTryOn(made)
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
      className="max-w-[60ch] border border-destructive/40 px-4 py-3 text-destructive"
    >
      {t(problem.message)}
    </p>
  )
  const heading = (text: ReactNode) => (
    <h2
      id="fitting"
      ref={title}
      tabIndex={-1}
      className="font-heading text-h2 font-semibold text-balance outline-none"
    >
      {text}
    </h2>
  )

  if (stage === "follow" && tryOn) {
    // A failed try-on says why, and the photos open on the one at fault:
    // nothing to keep, so no question asked.
    const failed = tryOn.failure ? failureProblem(tryOn.failure) : null
    const retry = () => {
      setKept(null)
      setProblem(failed?.photo ? failed : null)
      setStage("photos")
    }
    return (
      <section aria-labelledby="fitting">
        <TryOnSteps
          tryOn={tryOn}
          name={costume.name}
          photo={costume.photo}
          guide={costume.guide}
          shops={costume.shops}
          // The page's lead names the character: the heading is for
          // screen readers, and where each stage starts.
          title={
            <h2 id="fitting" ref={title} tabIndex={-1} className="sr-only">
              {costume.name}
            </h2>
          }
          failure={
            tryOn.status === "failed" &&
            failed && (
              <>
                <p
                  role="alert"
                  className="max-w-[60ch] border border-destructive/40 px-4 py-3 text-destructive"
                >
                  {t(failed.message)}
                </p>
                {open &&
                  (free ? (
                    <>
                      {/* What the failure cost (todo UX-10). */}
                      <div className="flex max-w-[60ch] flex-col gap-1 text-lead">
                        <p>{t("failedFree")}</p>
                        {triesLeft < FAILED_TRIES && (
                          <p>{t("triesLeft", { count: triesLeft })}</p>
                        )}
                      </div>
                      <Button size="lg" onClick={retry}>
                        {t("retry")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="max-w-[60ch] text-lead">{t("used.line")}</p>
                      <GetPro source="fitting-room" />
                    </>
                  ))}
              </>
            )
          }
          after={
            tryOn.status === "done" &&
            open && (
              <ReplacePhotos
                name={costume.name}
                free={free}
                onReplace={replace}
              />
            )
          }
        />
      </section>
    )
  }

  if (!open) {
    // Lights out at the vanity.
    return (
      <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-12">
        <Mirror bulbs="sm" ratio={3 / 4} height="12rem" off />
        <p className="max-w-[40ch] font-heading text-h4 font-medium text-balance">
          {t.rich("closed", breaks)}
        </p>
      </div>
    )
  }

  if (!free) {
    // The free costume used: the vanity dark, and Kostuma Pro.
    return (
      <section
        aria-labelledby="fitting"
        className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-12"
      >
        <Mirror bulbs="sm" ratio={3 / 4} height="12rem" off />
        <div className="flex max-w-[50ch] flex-col items-start gap-4">
          {heading(t.rich("used.title", breaks))}
          <p className="text-lead text-muted-foreground">
            {usedOn
              ? t.rich("used.named", {
                  name: usedOn.name,
                  // Its try-on, the guide they earned (todo UX-09).
                  costume: (chunks) =>
                    usedOn.linked ? (
                      <Link
                        href={`/basket/fitting-room?costume=${usedOn.slug}`}
                        className="text-foreground underline decoration-blood underline-offset-4 transition-colors hover:text-blood-text"
                      >
                        {chunks}
                      </Link>
                    ) : (
                      chunks
                    ),
                })
              : t("used.line")}
          </p>
          <GetPro source="fitting-room" className="mt-2" />
        </div>
      </section>
    )
  }

  if (stage === "confirm" && chosen) {
    return (
      <section
        aria-labelledby="fitting"
        className={cn(
          stageGrid,
          photoHeight,
          // The words beside the mirrors from `xl` only (three mirrors leave
          // them too narrow below), and the consent and the start under
          // both: beside the mirrors, that column grew tall and narrow.
          "[grid-template-areas:'head'_'mirrors'_'go'] lg:grid-cols-[minmax(0,1fr)] lg:[grid-template-areas:'head'_'mirrors'_'go'] xl:grid-cols-[auto_minmax(0,1fr)] xl:[grid-template-areas:'mirrors_head'_'go_go']"
        )}
      >
        <div className="flex flex-col gap-4 [grid-area:head]">
          {heading(t("confirm.title", { name: costume.name }))}
          <p className="max-w-[60ch] text-lead text-muted-foreground">
            {t("confirm.line")}
          </p>
          {/* Only a free costume gets here: starting uses it (todo UX-04). */}
          <p className="max-w-[60ch] text-lead font-semibold">
            {t("confirm.free")}
          </p>
        </div>
        <div className="flex items-end gap-5 [grid-area:mirrors] sm:gap-8">
          {/* Who they become, standing in the light beside their mirrors. */}
          <div className="relative hidden aspect-4/5 h-[calc(var(--photo-h)+2.5rem)] shrink-0 sm:block">
            <CostumeImage
              photo={costume.photo}
              alt={costume.name}
              sizes="280px"
            />
          </div>
          {kinds.map((kind) => (
            <PhotoMirror key={kind} kind={kind}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the visitor's own photo */}
              <img
                src={previewOf(kind, slots[kind]) ?? ""}
                alt={t(`photos.${kind}`)}
                className="size-full object-contain"
              />
            </PhotoMirror>
          ))}
        </div>
        <div className="flex flex-col items-start gap-6 [grid-area:go]">
          <PhotoConsent
            agreed={agreed}
            error={unagreed && !agreed}
            onChange={setAgreed}
          />
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
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="fitting"
      className={cn(
        stageGrid,
        photoHeight,
        "[grid-template-areas:'head'_'pickers'_'go'] lg:[grid-template-areas:'pickers_head'_'pickers_go']"
      )}
    >
      <div className="flex flex-col gap-4 [grid-area:head]">
        {heading(t("photos.title"))}
        <p className="max-w-[60ch] text-lead text-muted-foreground">
          {costume.allMakeup
            ? t("photos.lineFace", { name: costume.name })
            : t("photos.line")}
        </p>
      </div>
      <div className="flex flex-col gap-12 [grid-area:pickers] sm:flex-row sm:gap-10">
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
      <div className="flex flex-col items-start gap-6 [grid-area:go]">
        {alert}
        <div className="flex flex-wrap items-center gap-4">
          <Button
            size="lg"
            variant={chosen ? "default" : "outline"}
            onClick={proceed}
          >
            {t("photos.continue")}
          </Button>
          {kept && (
            <Button variant="ghost" size="lg" onClick={keepCurrent}>
              {t("replace.keep")}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Asks how a running try-on is doing every POLL_MS, until it ends (then
 * `onEnd`). Each ask also moves it along (POST): YouCam's webhook does
 * that too where it can reach the server, never on localhost.
 */
function useFollow(
  tryOn: TryOnView | null,
  setTryOn: (tryOn: TryOnView) => void,
  onEnd: () => void
) {
  const id = tryOn?.id
  const running = tryOn?.status === "running"
  const ended = useEffectEvent(onEnd)
  useEffect(() => {
    if (!id || !running) return
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    const ask = async () => {
      try {
        const response = await fetch(`/api/fitting-room/try-ons/${id}`, {
          method: "POST",
          cache: "no-store",
        })
        // Signed out meanwhile: stop asking; the page says so on reload.
        if (response.status === 401 || response.status === 404) return
        if (response.ok && !stopped) {
          const next = (await response.json()) as TryOnView
          setTryOn(next)
          if (next.status !== "running") ended()
        }
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

/** No costume in the basket: bare hangers, and where to find one. */
function EmptyBasket() {
  const t = useTranslations("FittingRoom")
  return (
    <div className="mt-12 flex flex-col items-center gap-5 text-center">
      <EmptyRail />
      <h2 className="mt-4 font-heading text-h2 font-semibold text-balance">
        {t.rich("emptyBasket", breaks)}
      </h2>
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
