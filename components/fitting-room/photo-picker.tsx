"use client"

import { RiImageAddLine, RiLoader4Line } from "@remixicon/react"
import { useTranslations } from "next-intl"
import { useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { type PickedPhoto, readPhoto } from "@/lib/fitting-room/browser-photo"
import type { PhotoProblem } from "@/lib/fitting-room/photo-rules"
import { type PhotoKind, photoUrl } from "@/lib/fitting-room/try-on"
import { cn } from "@/lib/utils"

/** A photo slot's content: the one used last (kept), or one just picked. */
export type Slot =
  { kind: "kept"; id: string } | { kind: "picked"; photo: PickedPhoto } | null

export const previewOf = (kind: PhotoKind, slot: Slot) =>
  slot?.kind === "kept"
    ? photoUrl(kind, slot.id)
    : slot?.kind === "picked"
      ? slot.photo.url
      : null

/** The frame each photo sits in: a close-up is 3:4, head to toe 2:3. */
export const frameOf: Record<PhotoKind, string> = {
  face: "aspect-3/4",
  body: "aspect-2/3",
}

/**
 * One of the two photos (owner, 2026-10-03): what it must show, the photo
 * (or an empty frame), and a button to choose or change it. A photo that
 * can't be used is said at once, under it; the slot keeps what it had.
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
      className="flex flex-col gap-4"
    >
      <h3
        id={`${id}-title`}
        className="font-heading text-[clamp(1.5rem,2.4vw,2rem)] leading-tight font-medium"
      >
        {t(titleKey)}
      </h3>
      <div
        className={cn(
          "relative flex w-full max-w-80 items-center justify-center overflow-hidden border bg-card",
          frameOf[kind],
          error ? "border-destructive/60" : "border-foreground/10"
        )}
      >
        {preview ? (
          // The visitor's own photo, from the server or this browser: no
          // optimizer (it would fetch it without their session).
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="size-full object-contain" />
        ) : (
          <RiImageAddLine
            aria-hidden="true"
            className="size-12 text-muted-foreground"
          />
        )}
      </div>
      <ul className="flex max-w-80 flex-col gap-1 text-muted-foreground">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2">
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
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        onChange={(event) => {
          const file = event.target.files?.[0]
          // The same file may be picked again after a change of mind.
          event.target.value = ""
          void pick(file)
        }}
      />
      <Button
        type="button"
        variant="outline"
        aria-label={
          preview
            ? t(kind === "face" ? "changeFace" : "changeBody")
            : t(kind === "face" ? "chooseFace" : "chooseBody")
        }
        aria-busy={reading || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => input.current?.click()}
        className="w-fit gap-2"
      >
        {reading && (
          <RiLoader4Line
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        )}
        {reading ? t("reading") : preview ? t("change") : t("choose")}
      </Button>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="max-w-80 text-destructive"
        >
          {error}
        </p>
      )}
    </section>
  )
}
