# 02 · Security and privacy

Kostuma's security baseline is stronger than most production sites. The problems found are
one outdated dependency, an abuse path that costs real money, and the privacy duties that come
with keeping people's face photos. Legal points below are risks to raise with a lawyer, not
legal advice.

## Checked and sound

| Area                      | What was checked                              | Result                                                                                                                                                                  |
| ------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Headers                   | Live response headers on the production build | HSTS (2 years), `nosniff`, `X-Frame-Options: DENY`, strict Referrer-Policy, Permissions-Policy, COOP, no `X-Powered-By`                                                 |
| Content Security Policy   | `lib/security/csp.ts`, live header            | Per-request 128-bit nonce, `strict-dynamic`, `object-src 'none'`, `base-uri`/`form-action 'self'`, `frame-ancestors 'none'`; no CSP violations while walking every page |
| XSS                       | Every `dangerouslySetInnerHTML`               | One, the JSON-LD block, with `<` escaped                                                                                                                                |
| Access control            | `app/api/fitting-room/**`                     | Session required, every path scoped to the caller's uid, ids validated by strict regex: no IDOR, no path traversal                                                      |
| Server actions            | `lib/**/actions.ts`                           | zod on every input, session re-checked, errors returned as codes only; Next.js' same-origin check applies                                                               |
| Sessions                  | `lib/auth/session.ts`, `actions.ts`           | httpOnly, `Secure` in production, `SameSite=Lax`, revocation checked, sign-in must be < 5 min old                                                                       |
| Open redirect             | `lib/auth/next-path.ts`                       | `safeNext` parses with `URL` and pins the origin                                                                                                                        |
| Firestore / Storage rules | `firestore.rules`, `storage.rules`            | Deny by default; baskets strictly validated; costume photos get-only                                                                                                    |
| SSRF                      | Image optimizer, YouCam client                | `remotePatterns` pinned to the costume folder, `maximumRedirects: 0`                                                                                                    |
| Uploads                   | `lib/fitting-room/photo.ts`                   | Re-encoded by sharp, metadata (GPS, device) dropped, size and shape checked server-side                                                                                 |
| Secrets                   | Bundle, env handling                          | Only the Firebase web config (public by design) reaches the browser; YouCam and Admin keys are `server-only`                                                            |
| Abuse                     | Feedback, register                            | reCAPTCHA verified server-side and fail-closed; feedback limited to 5/hour per account or IP, keyed by a hash                                                           |

## Findings

### SEC-01 · Critical advisory in Next.js 16.3.4 (`next/og`) — P0, S

`npm audit` reports **GHSA-vcvr-r3jv-pc5j, "Remote Code Execution in next/og ImageResponse"
(CVSS 9.5)** for Next.js 16.2.0–16.3.5, fixed in 16.3.6. Kostuma runs 16.3.4 and renders its
social cards with `ImageResponse` from `next/og` (`app/[locale]/opengraph-image.tsx`,
`app/[locale]/costumes/[slug]/opengraph-image.tsx`, `lib/og.tsx`).

**Real exposure today is low**: the flaw needs attacker-controlled values inside the card's
SVG content, attributes or styles, and Kostuma's cards draw only catalog data (an unknown slug
returns 404 before anything is drawn). But it is a critical advisory on a direct dependency,
the fix is a patch release, and one future change (a name from a query string, a visitor's
text on a card) would make it exploitable.

**Fix:** `next@16.3.8` and `eslint-config-next@16.3.8`, then `npm run check` and the e2e suite.
Keep the rule "never pass request input into a card".

### SEC-02 · Free costumes can be farmed, and the robot check can be bypassed — P0, S–M

**Where:** `lib/auth/actions.ts:61-110` (`startSession`), `lib/auth/actions.ts:130-167`
(`register`), `lib/fitting-room/free-costume.ts`.

**What happens.** Each account gets one free try-on, worth 8–12 YouCam units. The register
form requires reCAPTCHA, but:

1. Firebase's web API key is public by design, and Firebase Auth's REST endpoint
   (`accounts:signUp`) accepts new email/password accounts directly **unless client sign-up is
   disabled** in the project. An account made that way skips the reCAPTCHA entirely.
2. `startSession` treats "no profile yet" as a first Google sign-in: after the terms step it
   creates a profile for **any** provider (`actions.ts:80-89`), so that scripted account gets a
   full session and a free costume.
3. No email verification is required, so the addresses don't even need to exist.

A script can therefore create accounts and spend the whole unit balance (about 45–65
try-ons) in minutes. Even without a script, one person with a few throwaway addresses gets
several free costumes.

**Fix (cheap first):**

- In `startSession`, only offer the terms step to accounts whose provider is `google.com`. A
  `password` account without a profile was not made by `register` (which creates the profile
  before any session): refuse it (and delete the orphan account).
- Turn off client-side sign-up in Firebase Authentication's settings ("User actions" →
  "Enable create (sign-up)"; available with Identity Platform), so only the Admin SDK behind
  the robot check can create password accounts.
- Require a verified email for password accounts before the free try-on starts (Firebase sends
  the verification email; `email_verified` is in the session claims).
- Add Firebase App Check (reCAPTCHA Enterprise provider, free tier) on Auth and Firestore.
- Keep a per-IP and per-device cap on new try-ons per day, and the site-wide budget of ENG-02:
  the budget is the real backstop.

### SEC-03 · Face photos need a specific consent and a stated purpose — P1, M

**What happens.** The Fitting Room sends face and full-body photos to Perfect Corp, whose
engines must locate the face and its features to apply makeup. The Privacy policy says "we
don't make or keep a faceprint", which is true of Kostuma's own code, but the processing
still involves face geometry at a processor. Several US laws regulate exactly that: Illinois'
BIPA (a written release before collection, a public retention schedule, and private lawsuits
with statutory damages), and Texas' CUBI and Washington's biometric law (enforced by their
attorneys general). Brands offering virtual try-on have been sued under BIPA in recent years.
Consent today is the general "I agree to the Terms and Privacy policy" checkbox at
registration.

**Fix (ask a lawyer to confirm the wording):**

- On the Fitting Room's confirm screen, one checkbox, unticked: "I agree that Kostuma sends my
  photos to YouCam (Perfect Corp.) to find my face and body and make my pictures. YouCam deletes
  them within 30 days." Store the consent's time and version with the try-on. (One line; the
  confirm screen already exists, so no new step.)
- A Privacy policy paragraph on face data: what is processed, by whom, the purpose, how long it
  is kept (SEC-04), and that it is never used to identify anyone.
- Consider limiting the Fitting Room in jurisdictions the lawyer considers risky until the
  above is done (Vercel provides the visitor's region).

### SEC-04 · Photos are kept indefinitely, and deletion is by email only — P1, M

**Where:** Privacy policy "How long we keep it"; `lib/fitting-room/store.ts`.

Photos and try-ons are kept "until you ask us to delete them", and deletion means emailing a
personal address and waiting up to 30 days. For face photos that is the weakest part of the
privacy story (GDPR storage limitation; BIPA requires a schedule).

**Fix:**

- **Self-serve deletion** on the account page: "Delete my photos and pictures" and "Delete my
  account". Server side: delete the Storage prefix `fitting-room/{uid}/`, the
  `fittingRooms/{uid}` document and its `tryOns`, the basket, the waitlist entry and the
  profile, then the Auth user. A confirmation pop-up like "Replace your photos?".
- **Automatic expiry**: a Cloud Storage lifecycle rule (free, no code) that deletes
  `fitting-room/**` objects after, for example, 12 months, plus a matching Firestore TTL or
  cleanup job; state the period in the Privacy policy.

### SEC-05 · The legal pages don't say who "we" are — P2, S

Neither document names the operator (a person or company, and a country). GDPR Article 13
requires the controller's identity and contact details; EU consumer rules expect the same of
any online service. The project notes record this as chosen without the owner. Add the legal
name and country (a business address or a registered agent if privacy matters), and ideally a
domain email instead of a personal Gmail (see PMF-07).

### SEC-06 · Upload decoding is too generous — P2, S

**Where:** `lib/fitting-room/photo.ts:39` (`PIXEL_LIMIT = 100_000_000`), `actions.ts:44-110`.

sharp may decode up to 100 megapixels. A crafted PNG of 10,000 × 10,000 pixels compresses to
a few kilobytes but costs hundreds of megabytes of memory to decode, and the size rules only
check minimums. Real visitors never send more than 2048 px (the browser shrinks first). Reject
anything over 4096 px a side from the metadata, before decoding, and lower `limitInputPixels`
to about 25 MP. `startTryOn` also decodes both photos before checking the allowance; add a
small per-account rate limit (the existing `withinLimit` helper) so a used-up account can't
make the server decode photos in a loop.

### SEC-07 · CSP violations are never reported — P2, S

The policy has no `report-to` / `report-uri`. After launch, a browser update, a Google change
to the sign-in popup or reCAPTCHA, or an injected script would be blocked silently. Add a
`Reporting-Endpoints` header and `report-to`, pointing at a small route that logs (sampled) or
at Sentry's CSP endpoint. Consider a `Content-Security-Policy-Report-Only` stricter variant
(without `'unsafe-inline'` styles) to measure what a stricter policy would break.

### SEC-08 · Sign-out only clears this browser's cookie — P2, S

`endSession` deletes the cookie (`lib/auth/actions.ts:113-116`), but the session cookie itself
stays valid for up to 14 days if it was copied. Options: call
`revokeRefreshTokens(uid)` on sign-out (signs the account out everywhere), or offer "Sign out
of all devices" on the account page, and consider a 7-day session.

### SEC-09 · Smaller hardening — P3, S each

- **reCAPTCHA response not tied to Kostuma's host**: `lib/auth/recaptcha.ts` checks only
  `success`. Check `hostname` too, or make sure "Verify the origin of reCAPTCHA solutions" is on
  in the reCAPTCHA admin console.
- **Password reset has no robot check**: `sendPasswordResetEmail` from the browser can be
  scripted to send many reset emails to someone (Firebase's quotas limit it). App Check
  (SEC-02) covers it.
- **Waitlist email not verified**: "Update" stores any address (`lib/waitlist/actions.ts:63`),
  and the owner will email it a "deal". Writing to someone who never signed up is a spam-law
  risk. Use the account's verified email, or confirm a changed address with a link first.
- **Register says when an email is taken** ("An account already uses this email"): account
  enumeration, behind the robot check. A common, acceptable trade-off; documented here so it
  stays a decision.
- **The e2e session stand-in trusts the `Host` header** (`lib/auth/session.e2e.ts:30`). It is
  safe only because e2e builds never deploy; add a runtime guard (`process.env.VERCEL` or
  `NODE_ENV === "production"` without `E2E`) in the stand-in itself.
- **Preview deployments** (ENG-10): make sure Vercel's Preview environment has no production
  secrets (YouCam key, Admin credentials) and Deployment Protection is on.

### SEC-10 · Dependency hygiene — P2, S

`npm audit --omit=dev` (2026-10-04): 1 critical (SEC-01), 10 high, 2 moderate.

| Package (path)                                                 | Severity | Real risk for Kostuma                                                         | Action                                                                                                                                                                                                      |
| -------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next` 16.3.4                                                  | Critical | Low today (see SEC-01)                                                        | Upgrade to 16.3.8                                                                                                                                                                                           |
| `@grpc/grpc-js` 1.9.16 (via `firebase` → Firestore)            | High     | Low: server-side gRPC advisories; Kostuma's browser Firestore uses WebChannel | Try `overrides: { "@grpc/grpc-js": "^1.13.6" }` and run `npm run test:firestore` (the emulator suite uses the client SDK in Node); if it breaks, accept the risk. npm's own suggestion is a bogus downgrade |
| `braces`, `micromatch`, `fast-glob`, `ts-morph` (via `shadcn`) | High     | None at runtime: it's a CLI used for one CSS import                           | Move `shadcn` to `devDependencies`                                                                                                                                                                          |
| `uuid` (via `gaxios` ← `firebase-admin`)                       | Moderate | Very low                                                                      | `npm audit fix` (non-breaking)                                                                                                                                                                              |

Remove the unused `cn` package (an obscure, unmaintained name on npm is a supply-chain risk for
no benefit). Add `npm audit` and Dependabot to CI (ENG-12).

## Privacy policy accuracy

The policy matches the code closely, which is rare. Two small points:

- It says the `NEXT_LOCALE` cookie is set only "if you pick a language other than your
  browser's". With no `Accept-Language` header (some privacy tools, bots), the middleware sets
  it on the first request too. Harmless; adjust the sentence or the behavior.
- "No ads, no trackers" is true of Kostuma's own code; reCAPTCHA and Google sign-in are
  disclosed further down. Fine as is.
