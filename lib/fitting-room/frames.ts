import type { StepView, TryOnView } from "./try-on"

/** One picture of a try-on, a frame of the Fitting Room's film strip. */
export type Frame =
  | { kind: "outfit"; step: StepView }
  | { kind: "before" }
  | { kind: "step"; number: number; step: StepView | undefined }

/**
 * Every picture of a try-on in the order it is made (spec §11.4b): the
 * outfit (not for a costume that is all makeup), the face before, then the
 * face after each of the guide's `steps`.
 */
export function framesOf(tryOn: TryOnView, steps: number): Frame[] {
  const outfit = tryOn.outfit ? tryOn.steps[0] : undefined
  const makeup = tryOn.outfit ? tryOn.steps.slice(1) : tryOn.steps
  return [
    ...(outfit ? [{ kind: "outfit", step: outfit } as const] : []),
    { kind: "before" },
    ...Array.from(
      { length: steps },
      (_, index) =>
        ({ kind: "step", number: index + 1, step: makeup[index] }) as const
    ),
  ]
}

/** A frame whose picture came out. */
const rendered = (frame: Frame) =>
  frame.kind !== "before" && frame.step?.status === "done"

/**
 * The frame rendering now, -1 if none: while the try-on runs, the first
 * not done (each waits on the picture of the one before).
 */
export function renderingFrame(frames: readonly Frame[], tryOn: TryOnView) {
  if (tryOn.status !== "running") return -1
  return frames.findIndex(
    (frame) => frame.kind !== "before" && frame.step?.status !== "done"
  )
}

/**
 * The frame the mirror shows until the visitor picks one: once done, the
 * last (the whole transformation); before that, the newest picture out;
 * with none yet, the frame rendering now, or, failed, the first that
 * wasn't rendered.
 */
export function shownFrame(frames: readonly Frame[], tryOn: TryOnView) {
  if (tryOn.status === "done") return frames.length - 1
  for (let index = frames.length - 1; index >= 0; index--)
    if (rendered(frames[index])) return index
  const waiting =
    tryOn.status === "running"
      ? renderingFrame(frames, tryOn)
      : frames.findIndex(
          (frame) => frame.kind !== "before" && frame.step?.status === "failed"
        )
  return waiting === -1
    ? frames.findIndex((frame) => frame.kind === "before")
    : waiting
}
