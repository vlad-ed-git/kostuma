import "server-only"

import sharp from "sharp"

import type { Mark } from "@/lib/makeup"

import { type Face, locate } from "./landmarks"

/**
 * Paints a step's marks (lib/makeup.ts `Mark`) on a made-up face: what
 * YouCam can't draw, such as Pennywise's red streaks and nose. The marks are
 * placed on the face found by landmarks.ts, sized in eye spans, softened a
 * little at the edges like greasepaint, and multiplied into the picture so
 * the skin's texture shows through. A mark lighter than the face under it
 * doesn't show: marks are dark or saturated colors.
 */
export async function paintMarks(
  image: Uint8Array,
  face: Face,
  marks: Mark[]
): Promise<Uint8Array> {
  const { width = 1, height = 1 } = await sharp(image).metadata()
  const shapes = marks
    .flatMap((mark) =>
      mark.mirror
        ? [svg(face, mark, false), svg(face, mark, true)]
        : [svg(face, mark, false)]
    )
    .join("")
  const span = locate(face, { at: "nose" }).span
  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
      `<defs><filter id="soft"><feGaussianBlur stdDeviation="${(span * 0.012).toFixed(2)}"/></filter></defs>` +
      `<g filter="url(#soft)" opacity="0.93">${shapes}</g></svg>`
  )
  return new Uint8Array(
    await sharp(image)
      .composite([{ input: overlay, blend: "multiply" }])
      .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
      .toBuffer()
  )
}

const n = (value: number) => value.toFixed(1)

/** One mark as SVG, on this side of the face or mirrored. */
function svg(face: Face, mark: Mark, other: boolean): string {
  const at = (point: Parameters<typeof locate>[1]) => locate(face, point, other)
  switch (mark.shape) {
    case "line": {
      const from = at(mark.from)
      const to = at(mark.to)
      const via = mark.via && at(mark.via)
      // A curve through `via`: the control point that makes it pass there.
      const path = via
        ? `M${n(from.x)} ${n(from.y)} Q${n(2 * via.x - (from.x + to.x) / 2)} ${n(2 * via.y - (from.y + to.y) / 2)} ${n(to.x)} ${n(to.y)}`
        : `M${n(from.x)} ${n(from.y)} L${n(to.x)} ${n(to.y)}`
      return `<path d="${path}" fill="none" stroke="${mark.color}" stroke-width="${n(mark.width * from.span)}" stroke-linecap="round"/>`
    }
    case "dot": {
      const center = at(mark.at)
      return `<circle cx="${n(center.x)}" cy="${n(center.y)}" r="${n(mark.radius * center.span)}" fill="${mark.color}"/>`
    }
    case "spiral": {
      const center = at(mark.at)
      const radius = mark.radius * center.span
      const turns = 2.5
      const points: string[] = []
      for (let step = 0; step <= turns * 36; step++) {
        const angle = (step / 36) * 2 * Math.PI * (other ? -1 : 1)
        const r = (radius * step) / (turns * 36)
        points.push(
          `${n(center.x + r * Math.cos(angle))} ${n(center.y + r * Math.sin(angle))}`
        )
      }
      return `<path d="M${points.join(" L")}" fill="none" stroke="${mark.color}" stroke-width="${n(mark.width * center.span)}" stroke-linecap="round" stroke-linejoin="round"/>`
    }
    case "stitches": {
      const from = at(mark.from)
      const to = at(mark.to)
      const length = Math.hypot(to.x - from.x, to.y - from.y) || 1
      // Across the seam, a fifth of an eye span long.
      const half = from.span * 0.1
      const cross = {
        x: (-(to.y - from.y) / length) * half,
        y: ((to.x - from.x) / length) * half,
      }
      const stroke = `stroke="${mark.color}" stroke-width="${n(mark.width * from.span)}" stroke-linecap="round"`
      let out = `<path d="M${n(from.x)} ${n(from.y)} L${n(to.x)} ${n(to.y)}" fill="none" ${stroke}/>`
      for (let i = 0; i < mark.count; i++) {
        const t = (i + 0.5) / mark.count
        const x = from.x + (to.x - from.x) * t
        const y = from.y + (to.y - from.y) * t
        out += `<path d="M${n(x - cross.x)} ${n(y - cross.y)} L${n(x + cross.x)} ${n(y + cross.y)}" fill="none" ${stroke}/>`
      }
      return out
    }
  }
}
