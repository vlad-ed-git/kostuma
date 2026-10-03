import { email } from "@/lib/auth/schemas"
import { z } from "@/lib/zod"

/**
 * Kostuma Pro's waitlist (owner, 2026-10-04): every account gets one costume
 * free; "Get Kostuma Pro" puts it on the list for more, with an email to be
 * reached at. Shared by the pop-up and the server.
 */

/** Where "Get Kostuma Pro" was pressed. */
export const waitlistSources = ["basket", "fitting-room", "account"] as const

export type WaitlistSource = (typeof waitlistSources)[number]

export const waitlistSourceSchema = z.enum(waitlistSources)

/** The email the waitlist reaches the account at: any the visitor gives. */
export const waitlistEmailSchema = z.object({ email })
