// @vitest-environment node
import sharp from "sharp"
import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const { paintMarks } = await import("./paint")
import { dot, line } from "@/lib/makeup"

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

async function white() {
  return new Uint8Array(
    await sharp({
      create: { width: 600, height: 800, channels: 3, background: "#FFFFFF" },
    })
      .jpeg()
      .toBuffer()
  )
}

async function pixel(image: Uint8Array, x: number, y: number) {
  const { data } = await sharp(image)
    .extract({ left: x, top: y, width: 1, height: 1 })
    .raw()
    .toBuffer({ resolveWithObject: true })
  return [...data]
}

describe("paintMarks", () => {
  it("paints a red nose on the nose, and nothing elsewhere", async () => {
    const painted = await paintMarks(await white(), face, [
      dot({ at: "nose" }, 0.1, "#C0141C"),
    ])
    const [r, g, b] = await pixel(painted, 300, 424)
    expect(r).toBeGreaterThan(150)
    expect(g).toBeLessThan(80)
    expect(b).toBeLessThan(80)
    expect(await pixel(painted, 100, 100)).toEqual([255, 255, 255])
  })

  it("paints a mirrored streak through both eyes", async () => {
    const painted = await paintMarks(await white(), face, [
      line({ at: "eye", dy: -0.5 }, { at: "eye", dy: 0.5 }, "#C0141C", {
        width: 0.05,
        mirror: true,
      }),
    ])
    for (const x of [200, 400]) {
      const [r, g] = await pixel(painted, x, 260)
      expect(r).toBeGreaterThan(150)
      expect(g).toBeLessThan(90)
    }
    expect(await pixel(painted, 300, 260)).toEqual([255, 255, 255])
  })

  it("keeps the skin under the paint: a dark mark only darkens", async () => {
    const painted = await paintMarks(await white(), face, [
      dot({ at: "mouth" }, 0.05, "#111111"),
    ])
    const [r] = await pixel(painted, 300, 500)
    expect(r).toBeLessThan(60)
  })
})
