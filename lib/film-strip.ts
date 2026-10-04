/**
 * The home page's film strip (components/home/transformation-reel.tsx): the
 * owner's red, burnt strip of film, one frame per picture of the sample
 * transformation, side by side in public/images/film-strip.webp (drawn by
 * scripts/film-strip.mjs).
 */

/** A frame's width and the strip's height, in the image's pixels. */
export const STRIP = { frameWidth: 279, height: 444 } as const

/**
 * Which frames carry a cue mark, a "cigarette burn": a projectionist's
 * signal at the end of a reel, the motor cue on the second-last frame and
 * the changeover cue on the last.
 */
export function cues(frames: number): Record<number, "motor" | "changeover"> {
  if (frames < 1) return {}
  if (frames === 1) return { 0: "changeover" }
  return { [frames - 2]: "motor", [frames - 1]: "changeover" }
}
