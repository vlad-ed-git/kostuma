import type { Render } from "./render-plan"

/**
 * Who renders the Fitting Room's pictures: YouCam, or a fake that costs
 * nothing (local development and tests). lib/fitting-room/renderer.ts
 * picks one.
 */

/** Why a render failed, in the terms the visitor is told. */
export type RenderFailure =
  /** The face photo can't be read: no face found, not facing the camera. */
  | "face_photo"
  /** The body photo can't be read: no person found, or not standing facing it. */
  | "body_photo"
  /** A photo can't be used at all (its size, its content). */
  | "photo_rejected"
  /** The service is closed (no units left, no key). */
  | "unavailable"
  /** Anything else. */
  | "failed"

export type TaskState =
  | { status: "running" }
  | { status: "done"; /** A JPEG. */ image: Uint8Array }
  | {
      status: "error"
      reason: RenderFailure
      /** Worth trying again (a hiccup, not the photo). */
      retry: boolean
      /** For the server's log, never the visitor. */
      detail: string
    }

/** What a provider renders: everything but the marks Kostuma paints itself. */
export type ProviderRender = Exclude<Render, { tool: "paint" }>

/** The pictures a render works on: JPEGs. */
export type RenderImages = {
  /** The visitor's photo, or an earlier step's picture. */
  source: Uint8Array
  /** The garment (an outfit's render only). */
  garment?: Uint8Array
}

export interface RenderProvider {
  /** Starts a render; the task's id. Throws a ProviderError. */
  start(render: ProviderRender, images: RenderImages): Promise<string>
  /** Where a task is. Throws a ProviderError when it can't be asked. */
  check(task: string, tool: ProviderRender["tool"]): Promise<TaskState>
  /** Deletes a task and its files from the service (best effort). */
  discard(task: string): Promise<void>
}

export class ProviderError extends Error {
  readonly reason: RenderFailure
  readonly retry: boolean

  constructor(message: string, reason: RenderFailure, retry: boolean) {
    super(message)
    this.name = "ProviderError"
    this.reason = reason
    this.retry = retry
  }
}
