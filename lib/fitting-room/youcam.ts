import "server-only"

import sharp from "sharp"

import {
  ProviderError,
  type RenderFailure,
  type RenderProvider,
  type TaskState,
} from "./provider"
import type { Render } from "./render-plan"

/**
 * YouCam's AI Clothes (cloth-v4), Makeup VTO and Hair Color
 * (docs.perfectcorp.com, API v2.0; the facts in checkpoint §5.4). A render:
 * the pictures go up through the File API (no units), the task starts on
 * them (2 units for an outfit, 1 for makeup or hair), the task is polled
 * until it has a result (a URL that lives 2 hours, fetched at once, and
 * kept as a JPEG on white: makeup and hair come back as PNGs with an alpha
 * channel), then deleted with its files. A failed task costs no units.
 */

const BASE = "https://yce-api-01.makeupar.com"

/** Each call gives up after this long: the next poll tries again. */
const TIMEOUT_MS = 20_000

const endpoints: Record<Render["tool"], string> = {
  clothes: "/s2s/v2.0/task/cloth-v4",
  makeup: "/s2s/v2.0/task/makeup-vto",
  hair: "/s2s/v2.0/task/hair-color",
}

type Failure = { reason: RenderFailure; retry: boolean }

/** The visitor's own photo could not be read: theirs to retake. */
const unreadable = (tool: Render["tool"]): Failure => ({
  reason: tool === "clothes" ? "body_photo" : "face_photo",
  retry: false,
})

// The engine's errors (a finished task whose `task_status` is "error"),
// in the visitor's terms. Anything not listed is "failed", worth retrying.
const engineErrors: Record<string, (tool: Render["tool"]) => Failure> = {
  error_no_face: unreadable,
  error_face_position_invalid: unreadable,
  error_face_position_too_small: unreadable,
  error_face_position_out_of_boundary: unreadable,
  error_face_angle_invalid: unreadable,
  error_face_parsing: unreadable,
  error_pose: unreadable,
  error_invalid_src: unreadable,
  error_apply_region_mismatch: unreadable,
  error_multi_person: unreadable,
  error_below_min_image_size: () => ({
    reason: "photo_rejected",
    retry: false,
  }),
  error_exceed_max_image_size: () => ({
    reason: "photo_rejected",
    retry: false,
  }),
  exceed_max_filesize: () => ({ reason: "photo_rejected", retry: false }),
  error_decode_image: () => ({ reason: "photo_rejected", retry: false }),
  error_nsfw_content_detected: () => ({
    reason: "photo_rejected",
    retry: false,
  }),
  // The garment (the costume's photo) or the request: Kostuma's to fix.
  error_invalid_ref: () => ({ reason: "failed", retry: false }),
  invalid_parameter: () => ({ reason: "failed", retry: false }),
  // The outfit came out the same as the photo: no point paying again.
  error_editing_failed: () => ({ reason: "failed", retry: false }),
}

type Fetch = typeof fetch

/** The YouCam provider, with the account's API key (YOUCAM_API_GENERATED_KEY). */
export function youcamProvider(
  key: string,
  fetcher: Fetch = fetch
): RenderProvider {
  async function call(path: string, init: RequestInit = {}) {
    let response: Response
    try {
      response = await fetcher(BASE + path, {
        ...init,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (error) {
      throw new ProviderError(
        `YouCam ${path}: ${String(error)}`,
        "failed",
        true
      )
    }
    const body: unknown = await response.json().catch(() => null)
    if (!response.ok) throw refusal(path, response.status, body)
    return dataOf(body)
  }

  return {
    async start(render, { source, garment }) {
      /** Puts a JPEG on YouCam; its file id. */
      async function upload(image: Uint8Array, name: string) {
        const answer = await call("/s2s/v2.0/file", {
          method: "POST",
          body: JSON.stringify({
            files: [
              {
                content_type: "image/jpeg",
                file_name: name,
                file_size: image.byteLength,
              },
            ],
          }),
        })
        const file = (
          answer.files as Record<string, unknown>[] | undefined
        )?.[0]
        const request = (
          file?.requests as Record<string, unknown>[] | undefined
        )?.[0]
        const fileId = file?.file_id
        if (typeof fileId !== "string" || typeof request?.url !== "string") {
          throw new ProviderError("YouCam gave no upload URL.", "failed", true)
        }
        await put(fetcher, request, image)
        return fileId
      }

      let params: Record<string, unknown>
      if (render.tool === "clothes") {
        if (!garment) {
          throw new ProviderError(
            "An outfit needs its garment.",
            "failed",
            false
          )
        }
        params = {
          src_file_id: await upload(source, "body.jpg"),
          ref_file_id: await upload(garment, "garment.jpg"),
          garment_category: render.category,
          change_shoes: true,
          // The largest person is the visitor; a busy background is fine.
          filter_multi_person: "off",
        }
      } else {
        const src_file_id = await upload(source, "face.jpg")
        params =
          render.tool === "makeup"
            ? { src_file_id, version: "1.0", effects: render.effects }
            : {
                src_file_id,
                pattern: render.pattern,
                palettes: render.palettes,
              }
      }

      const started = await call(endpoints[render.tool], {
        method: "POST",
        body: JSON.stringify(params),
      })
      if (typeof started.task_id !== "string") {
        throw new ProviderError("YouCam gave no task id.", "failed", true)
      }
      return started.task_id
    },

    async check(task, tool): Promise<TaskState> {
      const data = await call(`${endpoints[tool]}/${encodeURIComponent(task)}`)
      if (data.task_status === "success") {
        const url = resultUrl(data.results)
        if (!url) {
          return {
            status: "error",
            reason: "failed",
            retry: true,
            detail: "YouCam: a success without a result URL",
          }
        }
        return {
          status: "done",
          image: await asJpeg(await download(fetcher, url)),
        }
      }
      if (data.task_status === "error") {
        const code = typeof data.error === "string" ? data.error : "unknown"
        const known = engineErrors[code]?.(tool) ?? {
          reason: "failed",
          retry: true,
        }
        return {
          status: "error",
          ...known,
          detail: `YouCam: ${code} ${String(data.error_message ?? "")}`.trim(),
        }
      }
      return { status: "running" }
    },

    async discard(task) {
      await call("/s2s/v2.0/task/delete", {
        method: "POST",
        body: JSON.stringify({ task_id: task }),
      }).catch((error: unknown) => {
        console.warn("Could not delete a YouCam task.", error)
      })
    },
  }
}

function dataOf(body: unknown): Record<string, unknown> {
  if (typeof body === "object" && body !== null && "data" in body) {
    const { data } = body as { data: unknown }
    if (typeof data === "object" && data !== null)
      return data as Record<string, unknown>
  }
  return {}
}

/** The result's URL: `results.url` (the schema) or `results[0].download_url`. */
function resultUrl(results: unknown): string | null {
  if (Array.isArray(results)) return resultUrl(results[0])
  if (typeof results !== "object" || results === null) return null
  const { url, download_url } = results as Record<string, unknown>
  if (typeof url === "string") return url
  return typeof download_url === "string" ? download_url : null
}

/** A refused call, in the visitor's terms. */
function refusal(path: string, status: number, body: unknown) {
  const code =
    typeof body === "object" && body !== null && "error_code" in body
      ? String((body as { error_code: unknown }).error_code)
      : ""
  const message = `YouCam ${path}: HTTP ${status} ${code}`.trim()
  // No units left, or the key is wrong, off or expired: closed until fixed.
  if (status === 401 || code === "CreditInsufficiency")
    return new ProviderError(message, "unavailable", false)
  // Too many requests, or YouCam's own trouble: later.
  if (status === 429 || status >= 500)
    return new ProviderError(message, "failed", true)
  // Anything else is a request Kostuma got wrong: trying again won't help.
  return new ProviderError(message, "failed", false)
}

async function put(
  fetcher: Fetch,
  request: Record<string, unknown>,
  image: Uint8Array
) {
  const headers = Object.fromEntries(
    Object.entries((request.headers as Record<string, unknown>) ?? {}).map(
      ([name, value]) => [name, String(value)]
    )
  )
  try {
    const response = await fetcher(String(request.url), {
      method: typeof request.method === "string" ? request.method : "PUT",
      headers,
      // A copy on its own ArrayBuffer, which fetch takes as a body.
      body: image.slice(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (response.ok) return
    throw new Error(`HTTP ${response.status}`)
  } catch (error) {
    throw new ProviderError(`YouCam upload: ${String(error)}`, "failed", true)
  }
}

async function download(fetcher: Fetch, url: string) {
  try {
    const response = await fetcher(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return new Uint8Array(await response.arrayBuffer())
  } catch (error) {
    throw new ProviderError(`YouCam result: ${String(error)}`, "failed", true)
  }
}

/** A result as the Fitting Room keeps every picture: a JPEG on white. */
async function asJpeg(image: Uint8Array) {
  try {
    return new Uint8Array(
      await sharp(image)
        .flatten({ background: "#FFFFFF" })
        .toColourspace("srgb")
        .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
        .toBuffer()
    )
  } catch (error) {
    throw new ProviderError(
      `YouCam result unreadable: ${String(error)}`,
      "failed",
      true
    )
  }
}
