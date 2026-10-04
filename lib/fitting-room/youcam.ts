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
 * YouCam's AI APIs the Fitting Room uses (docs.perfectcorp.com, API v2.0;
 * the facts in checkpoint §5.4): AI Clothes (cloth-v4) for the outfit, on
 * the body photo and on the face photo, and Makeup VTO and Hair Color for
 * the face. A render: the pictures go
 * up through the File API (no units), the task starts on them, the task is
 * polled until it has a result (a URL that lives 2 hours, fetched at once
 * and kept as a JPEG on white, at the face photo's size: makeup comes back
 * as a PNG with an alpha channel), then deleted with its files. A failed
 * task costs no units.
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
const unreadable = (render: Render): Failure => ({
  reason: render.from === "body" ? "body_photo" : "face_photo",
  retry: false,
})

/** A photo that can't be used at all. */
const rejected = (): Failure => ({ reason: "photo_rejected", retry: false })

// The engine's errors (a finished task whose `task_status` is "error"), in
// the visitor's terms. Anything not listed is "failed", worth retrying.
const engineErrors: Record<string, (render: Render) => Failure> = {
  error_no_face: unreadable,
  error_src_no_face: unreadable,
  error_face_position_invalid: unreadable,
  error_face_position_too_small: unreadable,
  error_face_position_out_of_boundary: unreadable,
  error_face_angle_invalid: unreadable,
  error_face_parsing: unreadable,
  error_pose: unreadable,
  error_invalid_src: unreadable,
  error_apply_region_mismatch: unreadable,
  error_multi_person: unreadable,
  error_below_min_image_size: rejected,
  error_exceed_max_image_size: rejected,
  exceed_max_filesize: rejected,
  error_decode_image: rejected,
  error_nsfw_content_detected: rejected,
  // The garment (the costume's photo) or the request: Kostuma's to fix.
  error_invalid_ref: () => ({ reason: "failed", retry: false }),
  invalid_parameter: () => ({ reason: "failed", retry: false }),
  // The outfit came out the same as the photo: no point paying again.
  error_editing_failed: () => ({ reason: "failed", retry: false }),
}

function engineFailure(code: string, render: Render): Failure {
  const known = engineErrors[code]
  if (known) return known(render)
  return { reason: "failed", retry: true }
}

type Fetch = typeof fetch

/** The YouCam provider, with the account's API key (YOUCAM_API_GENERATED_KEY). */
export function youcamProvider(
  key: string,
  fetcher: Fetch = fetch
): RenderProvider {
  async function call(path: string, init: RequestInit = {}) {
    return dataOf(await request(path, init))
  }

  /** A call to the API: its whole answer. */
  async function request(path: string, init: RequestInit = {}) {
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
    return body
  }

  /** Puts a picture on YouCam; its file id. */
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
    const file = (answer.files as Record<string, unknown>[] | undefined)?.[0]
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

  async function paramsOf(
    render: Render,
    { source, garment }: Parameters<RenderProvider["start"]>[1]
  ): Promise<Record<string, unknown>> {
    switch (render.tool) {
      case "clothes": {
        // Checked before anything is uploaded.
        if (!garment) {
          throw new ProviderError(
            "An outfit needs its garment.",
            "failed",
            false
          )
        }
        return {
          src_file_id: await upload(source, `${render.from}.jpg`),
          ref_file_id: await upload(garment, "garment.jpg"),
          garment_category: render.category,
          change_shoes: true,
          // The largest person is the visitor; a busy background is fine.
          filter_multi_person: "off",
        }
      }
      case "makeup":
        return {
          src_file_id: await upload(source, "face.jpg"),
          version: "1.0",
          effects: render.effects,
        }
      case "hair":
        return {
          src_file_id: await upload(source, "face.jpg"),
          pattern: render.pattern,
          palettes: render.palettes,
        }
    }
  }

  return {
    name: "youcam",

    async start(render, images) {
      const params = await paramsOf(render, images)
      const started = await call(endpoints[render.tool], {
        method: "POST",
        body: JSON.stringify(params),
      })
      if (typeof started.task_id !== "string") {
        throw new ProviderError("YouCam gave no task id.", "failed", true)
      }
      return started.task_id
    },

    async check(task, render): Promise<TaskState> {
      const data = await call(
        `${endpoints[render.tool]}/${encodeURIComponent(task)}`
      )
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
        const size = render.tool === "clothes" ? null : render.size
        return {
          status: "done",
          image: await asJpeg(await download(fetcher, url), size),
        }
      }
      if (data.task_status === "error") {
        const code = typeof data.error === "string" ? data.error : "unknown"
        return {
          status: "error",
          ...engineFailure(code, render),
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

    async balance() {
      return unitsLeft(await request("/s2s/v1.0/client/credit"))
    },
  }
}

/**
 * The units left, from the Unit API's answer: every batch not expired,
 * `amount_dec` (two decimals; `amount` is deprecated, read when it's alone).
 */
export function unitsLeft(body: unknown, now = Date.now()): number {
  const results =
    typeof body === "object" && body !== null && "results" in body
      ? (body as { results: unknown }).results
      : null
  if (!Array.isArray(results))
    throw new ProviderError("YouCam gave no unit balance.", "failed", true)
  let total = 0
  for (const batch of results as Record<string, unknown>[]) {
    const expiry = batch?.expiry
    if (typeof expiry === "number" && expiry > 0 && expiry <= now) continue
    const amount =
      typeof batch?.amount_dec === "number" ? batch.amount_dec : batch?.amount
    if (typeof amount === "number" && Number.isFinite(amount)) total += amount
  }
  return Math.round(total * 100) / 100
}

function dataOf(body: unknown): Record<string, unknown> {
  if (typeof body === "object" && body !== null && "data" in body) {
    const { data } = body as { data: unknown }
    if (typeof data === "object" && data !== null)
      return data as Record<string, unknown>
  }
  return {}
}

/**
 * The result's URL, wherever the tool puts it: `results.url` (the schemas),
 * `results[0].download_url`, or deeper.
 */
export function resultUrl(results: unknown, depth = 0): string | null {
  if (depth > 4 || typeof results !== "object" || results === null) return null
  if (Array.isArray(results)) {
    for (const item of results) {
      const url = resultUrl(item, depth + 1)
      if (url) return url
    }
    return null
  }
  const fields = results as Record<string, unknown>
  for (const name of ["url", "download_url"])
    if (typeof fields[name] === "string") return fields[name]
  for (const value of Object.values(fields)) {
    const url = resultUrl(value, depth + 1)
    if (url) return url
  }
  return null
}

/** A refused call, in the visitor's terms. */
function refusal(path: string, status: number, body: unknown) {
  const code =
    typeof body === "object" && body !== null && "error_code" in body
      ? String((body as { error_code: unknown }).error_code)
      : ""
  const message = `YouCam ${path}: HTTP ${status} ${code}`.trim()
  // No units left, or the key is wrong, off or expired: closed until fixed.
  if (code === "CreditInsufficiency")
    return new ProviderError(message, "unavailable", false, { closes: "units" })
  if (status === 401)
    return new ProviderError(message, "unavailable", false, { closes: "key" })
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

/**
 * A result as the Fitting Room keeps every picture: a JPEG on white, at the
 * face photo's size (`size`) should it come back another, so every step's
 * picture lines up with the one before.
 */
async function asJpeg(image: Uint8Array, size: [number, number] | null) {
  try {
    let picture = sharp(image).flatten({ background: "#FFFFFF" })
    if (size) {
      const { width, height } = await sharp(image).metadata()
      if (width !== size[0] || height !== size[1])
        picture = picture.resize(size[0], size[1], { fit: "fill" })
    }
    return new Uint8Array(
      await picture
        .toColourspace("srgb")
        .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
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
