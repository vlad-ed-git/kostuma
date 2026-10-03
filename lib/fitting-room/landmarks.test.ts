// @vitest-environment node
import sharp from "sharp"
import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { findFace, locate } = await import("./landmarks")

const W = 600
const H = 800

/** A plain face picture, with these ellipses painted on it. */
async function picture(...shapes: string[]) {
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#E8D2C4"/>${shapes.join("")}</svg>`
  return new Uint8Array(
    await sharp(Buffer.from(svg)).jpeg({ quality: 95 }).toBuffer()
  )
}

const eyes = [
  '<ellipse cx="220" cy="330" rx="45" ry="25" fill="#3A1C45"/>',
  '<ellipse cx="380" cy="334" rx="45" ry="25" fill="#3A1C45"/>',
]
const mouth = '<ellipse cx="300" cy="470" rx="50" ry="18" fill="#C0141C"/>'
// A brow: in the step before the eyes, so it never counts as one.
const brow = '<rect x="170" y="280" width="100" height="10" fill="#2A2A2A"/>'

describe("findFace", () => {
  it("finds the eyes and the mouth where the eye and lip steps changed the face", async () => {
    const plain = await picture(brow)
    const withEyes = await picture(brow, ...eyes)
    const withLips = await picture(brow, ...eyes, mouth)
    const face = await findFace(
      { before: plain, after: withEyes },
      { before: withEyes, after: withLips }
    )
    expect(face).not.toBeNull()
    const [left, right] = face!.eyes
    expect(left.x).toBeCloseTo(220, -1)
    expect(left.y).toBeCloseTo(330, -1)
    expect(right.x).toBeCloseTo(380, -1)
    expect(face!.mouth.x).toBeCloseTo(300, -1)
    expect(face!.mouth.left).toBeLessThan(260)
    expect(face!.mouth.right).toBeGreaterThan(340)
  })

  it("finds nothing when a step changed no eyes", async () => {
    const plain = await picture()
    expect(
      await findFace(
        { before: plain, after: plain },
        { before: plain, after: await picture(mouth) }
      )
    ).toBeNull()
  })

  it("finds no mouth above the eyes", async () => {
    const plain = await picture()
    const withEyes = await picture(...eyes)
    const high = '<ellipse cx="300" cy="200" rx="50" ry="18" fill="#C0141C"/>'
    expect(
      await findFace(
        { before: plain, after: withEyes },
        { before: withEyes, after: await picture(...eyes, high) }
      )
    ).toBeNull()
  })
})

describe("locate", () => {
  const spot = (x: number, y: number) => ({
    x,
    y,
    left: x - 40,
    right: x + 40,
    top: y - 20,
    bottom: y + 20,
    area: 100,
  })
  const face = {
    eyes: [spot(200, 300), spot(400, 300)] as [
      ReturnType<typeof spot>,
      ReturnType<typeof spot>,
    ],
    mouth: { ...spot(300, 500), left: 250, right: 350 },
  }

  it("places anchors on the face, in eye spans", () => {
    expect(locate(face, { at: "eye" })).toMatchObject({
      x: 200,
      y: 300,
      span: 200,
    })
    expect(locate(face, { at: "eye", dy: 0.5 })).toMatchObject({
      x: 200,
      y: 400,
    })
    expect(locate(face, { at: "mouthCorner" })).toMatchObject({
      x: 250,
      y: 500,
    })
    const nose = locate(face, { at: "nose" })
    expect(nose.x).toBeCloseTo(300)
    expect(nose.y).toBeCloseTo(424)
  })

  it("mirrors a mark onto the other side", () => {
    expect(locate(face, { at: "eye", dx: -0.1 }, true)).toMatchObject({
      x: 420,
      y: 300,
    })
    expect(locate(face, { at: "mouthCorner" }, true)).toMatchObject({ x: 350 })
  })

  it("follows a tilted head", () => {
    const tilted = {
      ...face,
      eyes: [spot(200, 300), spot(400, 340)] as typeof face.eyes,
    }
    const below = locate(tilted, { at: "eye", dy: 1 })
    // Down the face, not down the picture.
    expect(below.x).toBeLessThan(200)
  })
})
