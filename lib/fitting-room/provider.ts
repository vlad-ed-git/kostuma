import type { ClosedFor } from "./budget"
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

/** The pictures a render works on. */
export type RenderImages = {
  /** The visitor's photo, or an earlier step's picture: a JPEG. */
  source: Uint8Array
  /** The garment (an outfit's render only): a JPEG. */
  garment?: Uint8Array
}

export interface RenderProvider {
  /** Which it is: a try-on made by one is never shown as the other's. */
  readonly name: "youcam" | "fake"
  /** Starts a render; the task's id. Throws a ProviderError. */
  start(render: Render, images: RenderImages): Promise<string>
  /**
   * Where a task is; its picture, once done, comes out at the render's size.
   * Throws a ProviderError when it can't be asked.
   */
  check(task: string, render: Render): Promise<TaskState>
  /** Deletes a task and its files from the service (best effort). */
  discard(task: string): Promise<void>
  /**
   * The units left to render with (the daily check, budget.ts); null when
   * the renderer has none to count (the fake). Throws a ProviderError.
   */
  balance(): Promise<number | null>
}

export class ProviderError extends Error {
  readonly reason: RenderFailure
  readonly retry: boolean
  /** The service can't render for anyone: the Fitting Room closes (budget.ts). */
  readonly closes: ClosedFor | null

  constructor(
    message: string,
    reason: RenderFailure,
    retry: boolean,
    { closes = null }: { closes?: ClosedFor | null } = {}
  ) {
    super(message)
    this.name = "ProviderError"
    this.reason = reason
    this.retry = retry
    this.closes = closes
  }
}
