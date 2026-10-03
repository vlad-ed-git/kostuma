/**
 * The home page's film strip (components/home/transformation-reel.tsx): a
 * real try-on of the owner's sample photos by the Fitting Room's own
 * renders, made once (photos/fitting-room/results/<run>/, gitignored): the
 * body photo, the outfit tried on, then the makeup's first, middle and
 * last steps. Written by `npm run photos:samples`: don't edit by hand.
 */

export type SampleFrame = {
  /** The picture's file in the run (its cut-out, when it has one). */
  file: string
  /** Its web copy on Cloud Storage, public, beside the costume photos. */
  url: string
  /** The web copy's size in pixels. */
  width: number
  height: number
}

export const sampleTransformation: {
  slug: string
  run: string
  frames: SampleFrame[]
} = {
  slug: "longlegs",
  run: "longlegs-dressed",
  frames: [
    {
      file: "cut-out/00-your-body.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsample-longlegs-00.07ddc0f9a6.webp?alt=media",
      width: 933,
      height: 1400,
    },
    {
      file: "cut-out/00-outfit.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsample-longlegs-01.b34b052d98.webp?alt=media",
      width: 933,
      height: 1400,
    },
    {
      file: "cut-out/01-white-pancake.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsample-longlegs-02.f2e1001691.webp?alt=media",
      width: 768,
      height: 1024,
    },
    {
      file: "cut-out/04-pink-rimmed-eyes.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsample-longlegs-03.53c7b5d254.webp?alt=media",
      width: 768,
      height: 1024,
    },
    {
      file: "cut-out/06-white-blond-hair.png",
      url: "https://firebasestorage.googleapis.com/v0/b/kostuma-73f77.firebasestorage.app/o/costumes%2Fsample-longlegs-04.47577cc8af.webp?alt=media",
      width: 768,
      height: 1024,
    },
  ],
}
