import {
  type PhotoProblem,
  SEND_QUALITY,
  sendLongSide,
  sizeProblem,
} from "./photo-rules"
import type { PhotoKind } from "./try-on"

/**
 * A photo the visitor picked, read in their browser: checked at once (the
 * same rules the server holds it to, photo-rules.ts), then shrunk to the
 * size the server keeps, as a JPEG (a few hundred kilobytes, quick on a
 * phone's data). Nothing leaves the browser until they confirm.
 */

export type PickedPhoto = {
  /** The JPEG to send. */
  blob: Blob
  /** Its preview, until the page lets it go (URL.revokeObjectURL). */
  url: string
  width: number
  height: number
}

/** A file no phone's photo comes near: not opened at all. */
const MAX_FILE_BYTES = 50 * 1024 * 1024

export async function readPhoto(
  kind: PhotoKind,
  file: File
): Promise<PickedPhoto | { problem: PhotoProblem }> {
  if (file.size > MAX_FILE_BYTES) return { problem: "too_big" }
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
  } catch {
    return { problem: "unreadable" }
  }
  try {
    const problem = sizeProblem(kind, bitmap.width, bitmap.height)
    if (problem) return { problem }

    const scale = Math.min(
      1,
      sendLongSide(kind) / Math.max(bitmap.width, bitmap.height)
    )
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) return { problem: "unreadable" }
    // A transparent PNG goes on white, as the server would put it.
    context.fillStyle = "#FFFFFF"
    context.fillRect(0, 0, width, height)
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", SEND_QUALITY)
    )
    if (!blob) return { problem: "unreadable" }
    return { blob, url: URL.createObjectURL(blob), width, height }
  } finally {
    bitmap.close()
  }
}
