// @vitest-environment node
import { describe, expect, it } from "vitest"

import {
  frameFiles,
  frameSource,
  sampleIn,
  sampleModule,
  samplePath,
} from "./samples.mjs"

const run = [
  "00-your-body.jpg",
  "00-your-face.jpg",
  "00-outfit.jpg",
  "02-second-coat.jpg",
  "01-white-pancake.jpg",
  "03-white-blond-hair.jpg",
  "steps.txt",
  ".DS_Store",
]

const steps = (count: number) =>
  Array.from(
    { length: count },
    (_, i) => `${String(i + 1).padStart(2, "0")}-step.jpg`
  )

describe("frameFiles", () => {
  it("puts the body photo and the outfit first, then the first, middle and last steps", () => {
    expect(frameFiles(run)).toEqual([
      "00-your-body.jpg",
      "00-outfit.jpg",
      "01-white-pancake.jpg",
      "02-second-coat.jpg",
      "03-white-blond-hair.jpg",
    ])
    const six = frameFiles(["00-your-body.jpg", "00-outfit.jpg", ...steps(6)])
    expect(six.slice(2)).toEqual(["01-step.jpg", "04-step.jpg", "06-step.jpg"])
    const five = frameFiles(["00-your-face.jpg", ...steps(5)])
    expect(five.slice(1)).toEqual(["01-step.jpg", "03-step.jpg", "05-step.jpg"])
  })

  it("shows each step once when there are fewer than three", () => {
    expect(frameFiles(["00-your-face.jpg", ...steps(2)])).toEqual([
      "00-your-face.jpg",
      "01-step.jpg",
      "02-step.jpg",
    ])
    expect(frameFiles(["00-your-face.jpg", ...steps(1)])).toEqual([
      "00-your-face.jpg",
      "01-step.jpg",
    ])
  })

  it("starts from the face photo for a costume that is all makeup", () => {
    expect(
      frameFiles(["00-your-face.jpg", "01-white-base.jpg", "steps.txt"])
    ).toEqual(["00-your-face.jpg", "01-white-base.jpg"])
  })

  it("refuses a run with a step missing", () => {
    expect(() =>
      frameFiles(run.filter((name) => name !== "02-second-coat.jpg"))
    ).toThrow("Step 2 is missing")
    expect(() => frameFiles(["00-your-face.jpg", "02-x.jpg"])).toThrow(
      "Step 1 is missing"
    )
  })

  it("refuses a run without steps, or without the photo the outfit was made on", () => {
    expect(() => frameFiles(["00-your-face.jpg", "steps.txt"])).toThrow(
      "No step pictures"
    )
    expect(() => frameFiles([])).toThrow("No step pictures")
    expect(() =>
      frameFiles(run.filter((name) => name !== "00-your-body.jpg"))
    ).toThrow("00-your-body.jpg is missing")
    expect(() => frameFiles(["01-white-base.jpg"])).toThrow(
      "00-your-face.jpg is missing"
    )
  })
})

describe("frameSource", () => {
  it("takes the frame's cut-out when the run has one", () => {
    const has = new Set(["cut-out/01-white-pancake.png"])
    const exists = (path: string) => has.has(path)
    expect(frameSource("01-white-pancake.jpg", exists)).toBe(
      "cut-out/01-white-pancake.png"
    )
    expect(frameSource("02-second-coat.jpg", exists)).toBe("02-second-coat.jpg")
  })
})

describe("samplePath", () => {
  it("names the web copy after the costume, the frame and its content", () => {
    const path = samplePath("longlegs", 3, new Uint8Array([1, 2, 3]))
    expect(path).toMatch(/^costumes\/sample-longlegs-03\.[a-f0-9]{10}\.webp$/)
    expect(samplePath("longlegs", 3, new Uint8Array([1, 2, 3]))).toBe(path)
    expect(samplePath("longlegs", 3, new Uint8Array([1, 2, 4]))).not.toBe(path)
  })

  it("is a name the storage rules let anyone get", () => {
    // storage.rules: match /costumes/{photo}, photo.matches(…).
    const name = samplePath("art-the-clown", 12, new Uint8Array([9])).slice(
      "costumes/".length
    )
    expect(name).toMatch(/^[a-z0-9_-]+[.][a-f0-9]{10}[.](png|webp)$/)
  })

  it("refuses what isn't a costume or a frame", () => {
    const content = new Uint8Array([1])
    for (const slug of ["", "Longlegs", "../x", "a/b", "-x", "x-"]) {
      expect(() => samplePath(slug, 0, content), slug).toThrow("Not a costume")
    }
    for (const index of [-1, 1.5, 100, Number.NaN]) {
      expect(() => samplePath("longlegs", index, content)).toThrow(
        "Not a frame"
      )
    }
  })
})

describe("sampleModule and sampleIn", () => {
  const frames = [
    { file: "00-your-body.jpg", url: "https://x/a.webp", width: 9, height: 12 },
  ]

  it("writes the costume, the run and the frames, which read back", () => {
    const source = sampleModule("longlegs", "longlegs-dressed", frames)
    expect(source).toContain("export const sampleTransformation")
    expect(source).toContain('slug: "longlegs"')
    expect(source).toContain('run: "longlegs-dressed"')
    expect(source).toContain(JSON.stringify(frames))
    expect(sampleIn(source)).toEqual({
      slug: "longlegs",
      run: "longlegs-dressed",
    })
  })

  it("takes the costume's folder for a file without a run", () => {
    expect(sampleIn('  slug: "longlegs",\n')).toEqual({
      slug: "longlegs",
      run: "longlegs",
    })
  })

  it("finds no sample in a file without one", () => {
    expect(sampleIn("export const x = 1\n")).toBeNull()
  })
})
