import type { Hex } from "@/lib/makeup"

import type { RenderFailure } from "./provider"
import type { Render } from "./render-plan"

/**
 * A try-on: one costume on the visitor's photos (body and face, or only the
 * face for a costume that is all makeup), rendered step by step
 * (lib/fitting-room/steps.ts drives it): the outfit, then each step of the
 * costume's makeup guide. Kept per account, under an id made of the photos,
 * the costume and the pipeline's version, so the same try-on is never
 * rendered twice.
 */

export type PhotoKind = "face" | "body"

/** A photo of the visitor, as kept (lib/fitting-room/photo.ts). */
export type Photo = {
  /** The content's hash: the same photo, the same id. */
  id: string
  width: number
  height: number
}

/** The face close-up, with its skin's color (for paler foundations). */
export type FacePhoto = Photo & { skin: Hex }

/**
 * A step's render:
 * waiting → starting (being sent) → running → saving → done, or failed.
 * "starting" and "saving" are claims: one request does the work, and a
 * claim older than a minute (its request died) may be taken over.
 */
export type StepStatus =
  "waiting" | "starting" | "running" | "saving" | "done" | "failed"

export type StoredStep = {
  render: Render
  status: StepStatus
  /** The provider's task, while it runs. */
  task: string | null
  /** When the status last changed (ms since the epoch). */
  since: number
  /** Renders tried and given up (a hiccup), at most MAX_ATTEMPTS. */
  attempts: number
  failure: RenderFailure | null
}

export type TryOnStatus = "running" | "done" | "failed"

export type TryOn = {
  id: string
  /** The costume (content/costumes.ts). */
  slug: string
  /** Who renders it: real YouCam, or the free fake. */
  renderer: "youcam" | "fake"
  /** The photos' ids; no body photo for a costume that is all makeup. */
  face: string
  body: string | null
  /**
   * The outfit picture tried on (its URL); null without an outfit. Missing
   * on try-ons made before garments (2026-10-03): those used the costume's
   * first photo.
   */
  garment?: string | null
  version: number
  status: TryOnStatus
  steps: StoredStep[]
  failure: RenderFailure | null
  createdAt: number
  updatedAt: number
}

/** The photos the account used last, offered again for the next costume. */
export type Room = { face: FacePhoto | null; body: Photo | null }

/** What starting a try-on came to: a new one, or the one already made. */
export type Begun = { outcome: "started" | "existing"; tryOn: TryOn }

/**
 * Where try-ons, photos and pictures are kept: Firestore and Cloud Storage
 * (store.ts), or memory (memory-store.ts: tests and the e2e build).
 */
export interface FittingRoomStore {
  room(uid: string): Promise<Room>
  /** Keeps the visitor's photos and makes them the ones in use. */
  savePhotos(
    uid: string,
    photos: { face?: [FacePhoto, Uint8Array]; body?: [Photo, Uint8Array] }
  ): Promise<void>
  photo(uid: string, kind: PhotoKind, id: string): Promise<Uint8Array | null>
  tryOn(uid: string, id: string): Promise<TryOn | null>
  /** The account's try-ons, the latest first. */
  tryOns(uid: string): Promise<TryOn[]>
  /**
   * In one transaction: the try-on if it exists and hasn't failed; else
   * keeps `fresh` (a failed one starts over).
   */
  begin(uid: string, fresh: TryOn): Promise<Begun>
  /**
   * Changes a step only if `when` still holds for it, in one transaction:
   * false when another request changed it first.
   */
  updateStep(
    uid: string,
    id: string,
    index: number,
    when: (step: StoredStep) => boolean,
    change: Partial<StoredStep>
  ): Promise<boolean>
  /** Ends a running try-on, in one transaction: false if it had ended already. */
  finish(
    uid: string,
    id: string,
    status: "done" | "failed",
    failure: RenderFailure | null
  ): Promise<boolean>
  saveStepImage(
    uid: string,
    id: string,
    index: number,
    image: Uint8Array
  ): Promise<void>
  stepImage(uid: string, id: string, index: number): Promise<Uint8Array | null>
}

/** A step as the page shows it. */
export type StepView = {
  status: "working" | "done" | "failed"
  /** Its picture, once done. */
  image: string | null
}

/** A try-on as the page shows it. */
export type TryOnView = {
  id: string
  slug: string
  status: TryOnStatus
  failure: RenderFailure | null
  /** The photos it was made from. */
  face: string
  body: string | null
  /** Whether the first step is the outfit (not for a costume all makeup). */
  outfit: boolean
  steps: StepView[]
}

/** Where the page loads one of the visitor's photos: only its owner may. */
export const photoUrl = (kind: PhotoKind, id: string) =>
  `/api/fitting-room/photos/${kind}/${id}`

/** Where the page loads a step's picture: only its owner may. */
export const stepUrl = (id: string, index: number, version: number) =>
  `/api/fitting-room/try-ons/${id}/${index}?v=${version}`

export function toView(tryOn: TryOn): TryOnView {
  return {
    id: tryOn.id,
    slug: tryOn.slug,
    status: tryOn.status,
    failure: tryOn.failure,
    face: tryOn.face,
    body: tryOn.body,
    outfit: tryOn.steps[0]?.render.tool === "clothes",
    steps: tryOn.steps.map((step, index) => ({
      // A failed try-on stops every step it hadn't finished.
      status:
        step.status === "done"
          ? "done"
          : step.status === "failed" || tryOn.status === "failed"
            ? "failed"
            : "working",
      image:
        step.status === "done" ? stepUrl(tryOn.id, index, step.since) : null,
    })),
  }
}
