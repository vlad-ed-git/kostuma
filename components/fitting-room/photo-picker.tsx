"use client"

import { RiImageAddLine, RiLoader4Line } from "@remixicon/react"
import { useTranslations } from "next-intl"
import { type ReactNode, useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { type PickedPhoto, readPhoto } from "@/lib/fitting-room/browser-photo"
import type { PhotoProblem } from "@/lib/fitting-room/photo-rules"
import { type PhotoKind, photoUrl } from "@/lib/fitting-room/try-on"

import { FigureGuide, Mirror } from "./dressing-room"

/** A photo slot's content: the one used last (kept), or one just picked. */
export type Slot =
  { kind: "kept"; id: string } | { kind: "picked"; photo: PickedPhoto } | null

export const previewOf = (kind: PhotoKind, slot: Slot) =>
  slot?.kind === "kept"
    ? photoUrl(kind, slot.id)
    : slot?.kind === "picked"
      ? slot.photo.url
      : null

/**
 * The mirror each photo goes in: the face in the vanity, ringed with bulbs
 * (3:4), the whole body in the full-length mirror (2:3). Both glasses are
 * `--photo-h` tall (set by the stage), so they stand level.
 */
export function PhotoMirror({
  kind,
  error = false,
  children,
}: {
  kind: PhotoKind
  error?: boolean
  children: ReactNode
}) {
  return (
    <Mirror
      bulbs={kind === "face" ? "sm" : undefined}
      ratio={kind === "face" ? 3 / 4 : 2 / 3}
      height="var(--photo-h)"
      error={error}
      fog
    >
      {children}
    </Mirror>
  )
}

/**
 * One of the two photos (owner, 2026-10-03): its mirror, holding the photo
 * or, empty, the shape it should show; a button to choose or change it, and
 * three tips. A photo that can't be used is said at once, under the button;
 * the slot keeps what it had. Phones: the mirror and its title side by
 * side, the button under them the width of the screen (todo UX-01: beside
 * the mirror it ran off a 360 px screen), the tips last.
 */
export function PhotoPicker({
  kind,
  slot,
  error,
  onPick,
  onProblem,
}: {
  kind: PhotoKind
  slot: Slot
  /** Why the photo can't be used, as a message. */
  error?: string
  onPick: (photo: PickedPhoto) => void
  onProblem: (problem: PhotoProblem) => void
}) {
  const t = useTranslations("FittingRoom.photos")
  const input = useRef<HTMLInputElement>(null)
  const [reading, setReading] = useState(false)
  const id = useId()
  const preview = previewOf(kind, slot)
  const tips =
    kind === "face"
      ? (["faceTip1", "faceTip2", "faceTip3"] as const)
      : (["bodyTip1", "bodyTip2", "bodyTip3"] as const)
  const titleKey = kind === "face" ? "face" : "body"

  async function pick(file: File | undefined) {
    if (!file) return
    setReading(true)
    const result = await readPhoto(kind, file)
    setReading(false)
    if ("problem" in result) onProblem(result.problem)
    else onPick(result)
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      data-photo={kind}
      className="grid grid-cols-[auto_minmax(0,1fr)] content-start items-center gap-x-5 gap-y-5 sm:flex sm:w-min sm:flex-col sm:items-stretch"
    >
      <PhotoMirror kind={kind} error={Boolean(error)}>
        {preview ? (
          // The visitor's own photo, from the server or this browser: no
          // optimizer (it would fetch it without their session).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-contain" />
        ) : (
          <FigureGuide kind={kind} />
        )}
      </PhotoMirror>
      <div className="flex flex-col items-start gap-4 max-sm:contents">
        <h3
          id={`${id}-title`}
          className="font-heading text-h4 font-medium text-balance"
        >
          {t(titleKey)}
        </h3>
        <Button
          type="button"
          variant={preview ? "outline" : "default"}
          aria-label={
            preview
              ? t(kind === "face" ? "changeFace" : "changeBody")
              : t(kind === "face" ? "chooseFace" : "chooseBody")
          }
          aria-busy={reading || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onClick={() => input.current?.click()}
          className="gap-2 max-sm:col-span-2 max-sm:w-full"
        >
          {reading ? (
            <RiLoader4Line
              aria-hidden="true"
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <RiImageAddLine aria-hidden="true" className="size-4" />
          )}
          {reading ? t("reading") : preview ? t("change") : t("choose")}
        </Button>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="col-span-2 text-destructive"
        >
          {error}
        </p>
      )}
      <ul className="col-span-2 flex flex-col gap-1.5 text-muted-foreground">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2.5">
            <span
              aria-hidden="true"
              className="mt-[0.6em] size-1.5 shrink-0 bg-blood-text"
            />
            {t(tip)}
          </li>
        ))}
      </ul>
      <input
        ref={input}
        type="file"
        hidden
        name={kind}
        // No HEIC: iOS then hands over a JPEG (todo ENG-14).
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          const file = event.target.files?.[0]
          // The same file may be picked again after a change of mind.
          event.target.value = ""
          void pick(file)
        }}
      />
    </section>
  )
}
