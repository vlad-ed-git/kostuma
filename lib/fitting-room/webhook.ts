import { Webhook } from "standardwebhooks"

/**
 * YouCam's webhook (docs, "Webhook"): when a task ends, YouCam posts
 * `{ created_at, data: { task_id, task_status } }`, signed by the Standard
 * Webhooks scheme (HMAC-SHA256 over `{webhook-id}.{webhook-timestamp}.{raw
 * body}`, with the endpoint's `whsec_` secret, YOUCAM_WEBHOOK_SECRET). The
 * `webhook-id` stays the same across YouCam's retries.
 */

/** A task's end, as YouCam announced it. */
export type TaskNotice = {
  /** The delivery's `webhook-id`: one notice, however often it comes. */
  delivery: string
  task: string
  status: "success" | "error"
}

/**
 * The notice in a webhook's raw body and headers; null unless signed with
 * `secret` within the last five minutes and well formed.
 */
export function readNotice(
  body: string,
  headers: Headers,
  secret: string
): TaskNotice | null {
  let payload: unknown
  try {
    payload = new Webhook(secret).verify(body, {
      "webhook-id": headers.get("webhook-id") ?? "",
      "webhook-timestamp": headers.get("webhook-timestamp") ?? "",
      "webhook-signature": headers.get("webhook-signature") ?? "",
    })
  } catch {
    return null
  }
  const data = (payload as { data?: unknown } | null)?.data
  if (typeof data !== "object" || data === null) return null
  const { task_id: task, task_status: status } = data as Record<string, unknown>
  if (typeof task !== "string" || !task) return null
  if (status !== "success" && status !== "error") return null
  return { delivery: headers.get("webhook-id") ?? "", task, status }
}
