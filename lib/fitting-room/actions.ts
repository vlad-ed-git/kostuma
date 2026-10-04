"use server"

import { makeupGuides } from "@/content/makeup"
import { getUser } from "@/lib/auth/session"
import { getCostume, tryOnGarment } from "@/lib/catalog"
import { START_LIMIT } from "@/lib/limits"
import { withinLimit } from "@/lib/rate-limit"

import { PhotoError, preparePhoto, type Prepared } from "./photo"
import type { PhotoProblem } from "./photo-rules"
import { fittingRoom } from "./service"
import { begin, type Fitting, mayBegin } from "./steps"
import {
  type FacePhoto,
  type Photo,
  type PhotoKind,
  toView,
  type TryOnView,
} from "./try-on"

/** Why a try-on didn't start: each a message on the page (FittingRoom.errors). */
export type StartError =
  | "signed_out"
  | "unknown_costume"
  | "missing_photo"
  | "closed"
  | "out_of_units"
  | "too_many_starts"
  | "unknown"
  | PhotoProblem

export type StartResult =
  | { ok: true; tryOn: TryOnView }
  | { ok: false; error: StartError; photo?: PhotoKind }

/**
 * Starts a costume's try-on, once the visitor has confirmed their photos
 * (owner, 2026-10-03): the face, and head to toe unless the costume is all
 * makeup. Checks each photo (an image, big enough, a photo's shape: no AI),
 * prepares it (upright, shrunk, JPEG), keeps it, and starts the renders,
 * which the page then follows (app/api/fitting-room). A photo is a new
 * file, or the one the account used last (`keepFace`, `keepBody`: its id).
 * The same photos and costume again give the try-on already made, free; a
 * new try-on needs the account's free costume (free-costume.ts), and keeps
 * nothing without it.
 */
export async function startTryOn(form: FormData): Promise<StartResult> {
  try {
    const user = await getUser()
    if (!user) return { ok: false, error: "signed_out" }

    const slug = form.get("costume")
    const guide = typeof slug === "string" ? makeupGuides[slug] : undefined
    const costume = typeof slug === "string" ? getCostume(slug) : undefined
    if (typeof slug !== "string" || !guide || !costume?.images[0])
      return { ok: false, error: "unknown_costume" }

    const deps = fittingRoom()
    if (!deps) return { ok: false, error: "closed" }
    // Before a photo is opened.
    if (!(await withinLimit(START_LIMIT, `account:${user.uid}`)))
      return { ok: false, error: "too_many_starts" }

    const room = await deps.store.room(user.uid)
    const fresh: {
      face?: Prepared<FacePhoto>
      body?: Prepared<Photo>
    } = {}
    for (const kind of ["face", "body"] as const) {
      const file = form.get(kind)
      if (!(file instanceof File) || file.size === 0) continue
      try {
        const bytes = new Uint8Array(await file.arrayBuffer())
        if (kind === "face") fresh.face = await preparePhoto("face", bytes)
        else fresh.body = await preparePhoto("body", bytes)
      } catch (error) {
        if (error instanceof PhotoError)
          return { ok: false, error: error.problem, photo: kind }
        throw error
      }
    }

    const keep = (kind: PhotoKind) => {
      const id = form.get(kind === "face" ? "keepFace" : "keepBody")
      const last = room[kind]
      return last && id === last.id ? last : null
    }
    const face = fresh.face?.photo ?? (keep("face") as FacePhoto | null)
    // A costume that is all makeup needs no body photo, and uses none.
    const body = guide.allMakeup ? null : (fresh.body?.photo ?? keep("body"))
    if (!face) return { ok: false, error: "missing_photo", photo: "face" }
    if (!body && !guide.allMakeup)
      return { ok: false, error: "missing_photo", photo: "body" }

    const garment = guide.allMakeup
      ? null
      : (tryOnGarment(costume)?.url ?? null)
    const fitting: Fitting = { slug, guide, face, body, garment }
    const may = await mayBegin(deps, user.uid, fitting)
    if (may !== "ok") return { ok: false, error: may }

    if (fresh.face || fresh.body) {
      await deps.store.savePhotos(user.uid, {
        face: fresh.face && [fresh.face.photo, fresh.face.image],
        body: fresh.body && [fresh.body.photo, fresh.body.image],
      })
    }
    const begun = await begin(deps, user.uid, fitting)
    if (begun.outcome === "out_of_units" || begun.outcome === "closed")
      return { ok: false, error: begun.outcome }
    return { ok: true, tryOn: toView(begun.tryOn) }
  } catch (error) {
    console.error("A try-on could not start.", error)
    return { ok: false, error: "unknown" }
  }
}
