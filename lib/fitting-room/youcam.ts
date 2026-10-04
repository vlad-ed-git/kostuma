import "server-only"

import sharp from "sharp"

import {
  busyError,
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
 * task costs no units. Every API call first takes its token from the
 * site's call budget (`takeCalls`, calls.ts); a busy answer (429, 5xx) or
 * an empty budget is `busy`: the render waits, it doesn't fail. Deleting a
 * task deletes every file it used, so a garment's upload serves one
 * try-on's two outfits, no more (steps.ts).
 */

const BASE = "https://yce-api-01.makeupar.com"

/** Each call gives up after this long: the next poll tries again. */
const TIMEOUT_MS = 20_000

/**
 * A whole start (its uploads and the task) gives up after this long, well
 * within the claim's lease (steps.ts LEASE_MS): no other request takes the
 * step over and pays for it twice.
 */
export const START_MS = 40_000

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

/**
 * Takes tokens from the site's call budget (FittingRoomStore `takeCalls`):
 * false when there aren't enough now. `debt`: a little past empty.
 */
export type TakeCalls = (calls: number, debt?: boolean) => Promise<boolean>

/** A signal that ends a call: its own timeout, or the whole start's deadline. */
const timeout = (deadline?: AbortSignal) =>
  deadline
    ? AbortSignal.any([deadline, AbortSignal.timeout(TIMEOUT_MS)])
    : AbortSignal.timeout(TIMEOUT_MS)

/** The YouCam provider, with the account's API key (YOUCAM_API_GENERATED_KEY). */
export function youcamProvider(
  key: string,
  fetcher: Fetch = fetch,
  takeCalls: TakeCalls = async () => true
): RenderProvider {
  /** Takes `calls` from the budget, or waits: YouCam's limit is the site's. */
  async function budget(calls: number) {
    if (!(await takeCalls(calls)))
      throw busyError("YouCam: the call budget is spent for now.")
  }

  async function call(
    path: string,
    init: RequestInit = {},
    deadline?: AbortSignal
  ) {
    return dataOf(await request(path, init, deadline))
  }

  /** A call to the API: its whole answer. */
  async function request(
    path: string,
    init: RequestInit = {},
    deadline?: AbortSignal
  ) {
    let response: Response
    try {
      response = await fetcher(BASE + path, {
        ...init,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
        signal: timeout(deadline),
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
  async function upload(
    image: Uint8Array,
    name: string,
    deadline?: AbortSignal
  ) {
    const answer = await call(
      "/s2s/v2.0/file",
      {
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
      },
      deadline
    )
    const file = (answer.files as Record<string, unknown>[] | undefined)?.[0]
    const request = (
      file?.requests as Record<string, unknown>[] | undefined
    )?.[0]
    const fileId = file?.file_id
    if (typeof fileId !== "string" || typeof request?.url !== "string") {
      throw new ProviderError("YouCam gave no upload URL.", "failed", true)
    }
    await put(fetcher, request, image, deadline)
    return fileId
  }

  return {
    name: "youcam",

    async start(render, { source, garment, garmentFile }) {
      const outfit = render.tool === "clothes"
      // Checked before anything is uploaded.
      if (outfit && !garment && !garmentFile) {
        throw new ProviderError("An outfit needs its garment.", "failed", false)
      }
      const garmentUpload = outfit && !garmentFile
      // The source's upload, the garment's unless shared, and the task.
      await budget(garmentUpload ? 3 : 2)
      const deadline = AbortSignal.timeout(START_MS)
      const src_file_id = await upload(
        source,
        outfit ? `${render.from}.jpg` : "face.jpg",
        deadline
      )
      let params: Record<string, unknown>
      let uploaded: string | undefined
      switch (render.tool) {
        case "clothes":
          uploaded = garmentUpload
            ? await upload(garment!, "garment.jpg", deadline)
            : undefined
          params = {
            src_file_id,
            ref_file_id: uploaded ?? garmentFile,
            garment_category: render.category,
            change_shoes: true,
            // The largest person is the visitor; a busy background is fine.
            filter_multi_person: "off",
          }
          break
        case "makeup":
          params = { src_file_id, version: "1.0", effects: render.effects }
          break
        case "hair":
          params = {
            src_file_id,
            pattern: render.pattern,
            palettes: render.palettes,
          }
          break
      }
      const started = await call(
        endpoints[render.tool],
        { method: "POST", body: JSON.stringify(params) },
        deadline
      )
      if (typeof started.task_id !== "string") {
        throw new ProviderError("YouCam gave no task id.", "failed", true)
      }
      return {
        task: started.task_id,
        ...(outfit && { garmentFile: uploaded ?? garmentFile }),
      }
    },

    async check(task, render): Promise<TaskState> {
      await budget(1)
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
      // Never put off for the budget, a little into debt at most.
      if (!(await takeCalls(1, true))) {
        console.warn("A YouCam task waits for its deletion: no call left.")
        return
      }
      await call("/s2s/v2.0/task/delete", {
        method: "POST",
        body: JSON.stringify({ task_id: task }),
      }).catch((error: unknown) => {
        console.warn("Could not delete a YouCam task.", error)
      })
    },

    async balance() {
      await takeCalls(1, true)
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
  // Too many requests, or YouCam's own trouble: wait, and ask again.
  if (status === 429 || status >= 500) return busyError(message)
  // Anything else is a request Kostuma got wrong: trying again won't help.
  return new ProviderError(message, "failed", false)
}

async function put(
  fetcher: Fetch,
  request: Record<string, unknown>,
  image: Uint8Array,
  deadline?: AbortSignal
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
      signal: timeout(deadline),
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
