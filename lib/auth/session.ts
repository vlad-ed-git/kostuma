import "server-only"

import { cookies } from "next/headers"
import { cache } from "react"

import { adminAuth } from "@/lib/firebase/admin"

const cookieName = "session"

/** Firebase's longest session cookie: 14 days. */
export const SESSION_SECONDS = 14 * 24 * 60 * 60

/** The signed-in visitor: only what pages need. */
export type User = { uid: string; name: string; email: string }

// A session that ended the normal way: expired, signed out elsewhere,
// password changed, account removed or turned off, or a malformed cookie.
const endedSession = new Set([
  "auth/session-cookie-expired",
  "auth/session-cookie-revoked",
  "auth/user-disabled",
  "auth/user-not-found",
  "auth/argument-error",
])

function codeOf(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : ""
}

/**
 * The signed-in visitor, or null. Verified once per request, including
 * whether Firebase has revoked the session since the cookie was made.
 */
export const getUser = cache(async (): Promise<User | null> => {
  const cookie = (await cookies()).get(cookieName)?.value
  if (!cookie) return null

  try {
    const claims = await adminAuth().verifySessionCookie(cookie, true)
    return {
      uid: claims.uid,
      name: typeof claims.name === "string" ? claims.name : "",
      email: claims.email ?? "",
    }
  } catch (error) {
    if (!endedSession.has(codeOf(error))) {
      console.error("Could not verify the session cookie.", error)
    }
    return null
  }
})

export async function saveSession(sessionCookie: string) {
  ;(await cookies()).set(cookieName, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_SECONDS,
  })
}

export async function deleteSession() {
  ;(await cookies()).delete(cookieName)
}
