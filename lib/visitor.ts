import "server-only"

import { headers } from "next/headers"
import { userAgentFromString } from "next/server"

/**
 * Where a visitor is and what they use, as far as their request tells: the
 * analytics kept on a new account's profile (`signUp`, lib/users.ts). The
 * place comes from Vercel's geolocation headers (`x-vercel-ip-*`, worked
 * out from the IP address, which is not kept), so it is unknown elsewhere,
 * such as on localhost. The device, system and browser come from the
 * User-Agent header. Never shown to anyone.
 */
export type Visitor = {
  /** ISO 3166-1 country code, e.g. "US". */
  country: string | null
  /** The country's first-level region (ISO 3166-2, without the country), e.g. "CA". */
  region: string | null
  city: string | null
  /** IANA time zone, e.g. "America/Los_Angeles". */
  timeZone: string | null
  /** "desktop", "mobile", "tablet", … */
  device: string | null
  /** e.g. "Mac OS", "iOS", "Windows", "Android". */
  os: string | null
  /** e.g. "Chrome", "Mobile Safari", "Firefox". */
  browser: string | null
}

const country = /^[A-Z]{2}$/
const region = /^[A-Z0-9]{1,3}$/

/** A header's value when it has the expected form, else null. */
function matching(value: string | null, form: RegExp) {
  return value !== null && form.test(value) ? value : null
}

/** Vercel percent-encodes a city's non-ASCII letters (RFC 3986). */
function cityOf(value: string | null) {
  if (!value) return null
  try {
    const city = decodeURIComponent(value).trim()
    return city.length > 0 && city.length <= 100 && !/\p{Cc}/u.test(city)
      ? city
      : null
  } catch {
    // Malformed percent-encoding.
    return null
  }
}

function timeZoneOf(value: string | null) {
  if (!value || value.length > 64) return null
  try {
    // A name that is no time zone throws a RangeError.
    return new Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions()
      .timeZone
  } catch {
    return null
  }
}

/** What a request's headers say about its visitor. */
export function visitorFrom(headers: Headers): Visitor {
  const userAgent = headers.get("user-agent")
  const agent = userAgent ? userAgentFromString(userAgent) : null
  return {
    country: matching(headers.get("x-vercel-ip-country"), country),
    region: matching(headers.get("x-vercel-ip-country-region"), region),
    city: cityOf(headers.get("x-vercel-ip-city")),
    timeZone: timeZoneOf(headers.get("x-vercel-ip-timezone")),
    // The parser gives desktop browsers no device type.
    device: agent ? (agent.device.type ?? "desktop") : null,
    os: agent?.os.name ?? null,
    browser: agent?.browser.name ?? null,
  }
}

/** The visitor of the request being answered. */
export async function currentVisitor() {
  return visitorFrom(await headers())
}
