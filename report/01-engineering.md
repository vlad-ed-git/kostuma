# 01 · Engineering

What the code does well, what will break at launch scale, and what to tidy. Line numbers refer
to commit `7fd4bd8`.

## Strengths worth protecting

- **Clear layering.** `lib/` holds pure logic with interfaces (`RenderProvider`,
  `FittingRoomStore`), `app/` holds routes, `components/` holds UI. The try-on is a small,
  testable state machine (`lib/fitting-room/steps.ts`) with optimistic claims on each step, so
  two tabs never send the same render twice.
- **Idempotent try-ons.** A try-on's id hashes its photos, costume, renderer, pipeline version
  and garment, so the same request never pays twice (`steps.ts:72`).
- **The free costume is enforced inside a Firestore transaction** that serializes concurrent
  starts (`store.ts:124`), and it is covered by an emulator test.
- **Test builds never touch real services**, through import aliases (`next.config.ts:61`), and
  the build refuses to run them on Vercel (`next.config.ts:16`).
- **Defensive data handling everywhere**: stored data is re-validated on read
  (`store.ts:61-78`), the basket codec distrusts local storage, external answers are parsed
  defensively (`youcam.ts:231-261`).
- `npm run check` is green: ESLint (0 warnings), `tsc`, Prettier, and 1,929 Vitest tests in 87
  files (about 23 s).

## Findings

### ENG-01 · The Fitting Room will hit YouCam's rate limit with two or three visitors at once — P0, M

**Where:** `components/fitting-room/fitting-room.tsx:38` (`POLL_MS = 2_000`),
`app/api/fitting-room/try-ons/[id]/route.ts:25-27`, `lib/fitting-room/steps.ts:290-348`,
`lib/fitting-room/youcam.ts:110-134, 177-218`.

**What happens.** While a try-on runs, the page asks the server every 2 seconds (after the
previous answer). Each ask runs `advance()`, which calls YouCam's task-status endpoint for the
running step. On top of that, every render makes its own calls: a file upload (one per
picture, two for an outfit), the task itself, and a delete when done.

YouCam's documented limit (docs.perfectcorp.com/develop/rate_limit, checked 2026-10-04) is
**250 requests per 300 seconds per access token, and also per IP address**, with "about 5
requests per second" recommended. Kostuma has one token, so this is the budget for the whole
site.

Estimated calls for one try-on, from the code path:

| Render                   | Count | Calls each                                                  | Total      |
| ------------------------ | ----- | ----------------------------------------------------------- | ---------- |
| Outfit (cloth-v4)        | 2     | 2 uploads + 1 task + ~6–12 status checks + 1 delete ≈ 10–16 | ~20–32     |
| Makeup / hair step       | 6     | 1 upload + 1 task + ~3–4 status checks + 1 delete ≈ 6–7     | ~36–42     |
| **Pennywise, all steps** | 8     |                                                             | **~56–74** |

That is ~60 calls in the ~90–120 s a try-on takes, roughly **0.5–0.7 calls per second for one
visitor**, against a site-wide budget of **0.83 per second**. Two try-ons at once will start
getting `429 Too Many Requests` within minutes; three will fail steadily. Every extra open tab
of the same try-on adds its own status checks. If Vercel's functions share egress IP addresses,
the per-IP limit can bite even sooner.

**Why it matters.** A 429 while starting a step counts as a failed attempt
(`youcam.ts:274-275` → `steps.ts:361-388`); after three, the step fails, the try-on fails, and
if pictures were already made the visitor loses one of their two retries (see ENG-03). On
Halloween week this turns the core feature into a lottery.

**Fix (in order of value):**

1. **YouCam webhooks.** YouCam sends a signed callback (Standard Webhooks, HMAC-SHA256) when a
   task finishes. Add a route that verifies it (`standardwebhooks` package, already noted in the
   project's plans), then collects the picture and starts the next step. The page then only
   reads Firestore (cheap) and the status endpoint is no longer polled at all. Keep the status
   check as a slow fallback (e.g. once 60 s after the expected finish).
2. **Until then, throttle status checks on the server**: store `checkedAt` on the step and call
   YouCam at most every ~5 s for makeup and ~10 s for outfits, whatever the page does. Return
   the stored state in between.
3. **A site-wide call budget.** A small token bucket (a Firestore document updated in a
   transaction, or Upstash Redis on its free tier) that every YouCam call takes a token from;
   when empty, the step waits instead of failing.
4. **Treat 429 and 5xx as "wait", never as an attempt**: `refusal()` should mark them as a
   distinct "busy" case that `setBack` retries with exponential backoff without incrementing
   `attempts` (genuine engine errors can keep counting).
5. **Cut calls per try-on**: reuse the garment's `file_id` per costume (YouCam keeps files 30
   days; saves 2 uploads per try-on), and test passing the previous step's picture by URL
   (`src_url`, which the APIs accept) instead of uploading it again. Deletes could be batched
   a few minutes later instead of one call per render (the Privacy policy promises prompt
   deletion, so keep it within minutes).
6. **A queue with a visible place in line** when the budget is used up (one line, in the
   house voice: "The mirror is busy. You're next."), instead of failures.
7. **Ask Perfect Corp whether the limit can be raised for the launch window.** With webhooks
   alone a try-on needs about 30 calls, so the budget caps the site at roughly 100 try-ons an
   hour; with the savings in point 5 (about 14 calls each), roughly twice that.

### ENG-02 · Nothing caps, monitors or switches off YouCam spending — P0, M

**Where:** `lib/fitting-room/renderer.ts:13-22`, `lib/fitting-room/youcam.ts:270-272`,
`lib/fitting-room/store.ts:167-182`.

**What happens.** The Fitting Room is open whenever `TRY_ON_PROVIDER=youcam` and a key are set.
There is no daily budget, no count of units spent, no alert when units run low, and no way to
close it without changing an environment variable and redeploying. Each try-on costs 8–12
units (2 + 2 for the outfits, 1 per makeup step). The project notes record about **532 units
left: roughly 45–65 try-ons in total.**

When units run out, YouCam answers `CreditInsufficiency`, which becomes the failure
`unavailable` (`youcam.ts:271`). The try-on fails, and `finish()` then counts it in the
visitor's `failedTries` if any picture had been made (`store.ts:173-179`), so **visitors lose
their free costume because Kostuma ran out of units.**

**Fix:**

- A **runtime switch** read at every start: a Firestore document such as `config/fittingRoom
{ open, dailyUnits }`, or Vercel Edge Config. Flipping it closes the Fitting Room in seconds,
  no deploy.
- A **daily unit budget** counted in the same transaction that starts a try-on (`store.begin`):
  reserve the try-on's units (2 + 2 + steps), refuse new starts with the existing "closed"
  message when the day's budget is reserved.
- **Monitoring**: a Vercel Cron job (free) that calls YouCam's Unit API
  (`GET /s2s/v1.0/client/credit`), stores the balance, emails the owner below a threshold and
  closes the switch below a floor.
- **Never count `unavailable` (or any non-photo failure) in `failedTries`** (see ENG-03).
- Buy enough units for the launch window before announcing anything.

### ENG-03 · Our failures and YouCam's outages use up the visitor's tries — P1, S

**Where:** `lib/fitting-room/steps.ts:361-388` (`setBack`), `steps.ts:169-183`,
`lib/fitting-room/store.ts:173-179`, `lib/fitting-room/free-costume.ts:15`.

**What happens.** `failedTries` grows for **any** failed try-on that had pictures, whatever the
reason: a timeout, a 429, YouCam's 5xx, a garment that failed to download, units running out.
After two such failures (`FAILED_TRIES = 2`) the account's free costume is gone for good.

**Fix:** count only failures caused by the visitor's photos (`face_photo`, `body_photo`,
`photo_rejected`). Everything else should leave the allowance alone, and retryable failures
should back off instead of burning attempts (ENG-01, point 4). Tell the visitor which case
they're in (UX-09).

### ENG-04 · A slow start can be taken over and rendered (and paid) twice — P1, S

**Where:** `lib/fitting-room/steps.ts:40` (`LEASE_MS = 60_000`), `steps.ts:213-216`,
`lib/fitting-room/youcam.ts:28` (`TIMEOUT_MS = 20_000`), `youcam.ts:141-157`.

**What happens.** A step is claimed ("starting") before its uploads and task creation. Another
request may take over a claim older than 60 s. But an outfit's start makes up to five calls in
sequence (two uploads, each a POST and a PUT, then the task), each allowed 20 s: up to 100 s.
On a slow network the second request sends the same render again; the first one's task is
then discarded, but the units may already be spent.

**Fix:** give `start` an overall deadline shorter than the lease (e.g. `AbortSignal.any` with a
40 s budget for the whole start) or raise `LEASE_MS` above the worst case; set `export const
maxDuration` on the API route so the platform's limit is explicit and longer than the work it
does.

### ENG-05 · A try-on only moves while its page is open — P1, M

**Where:** `components/fitting-room/fitting-room.tsx:612-647` (`useFollow`),
`app/api/fitting-room/try-ons/[id]/route.ts`.

**What happens.** Renders are advanced only by the page's polling. If the visitor locks their
phone, switches apps or closes the tab (likely during a 1.5–2 minute wait), the try-on stops
where it is. It also keeps holding the free costume. It resumes when they come back, but a
visitor who never returns leaves a try-on "running" forever.

**Fix:** webhooks (ENG-01) make the server drive the pipeline. Add a Vercel Cron "sweeper"
(every few minutes) that advances running try-ons nobody is watching and fails ones that have
been stuck for hours. Then the page can say "you can leave; we'll keep going" and, with email
(OPP-13), "your transformation is ready".

### ENG-06 · Two photos can exceed the upload limit — P1, S

**Where:** `lib/fitting-room/photo-rules.ts:44` (`SEND_LONG_SIDE = 2048`),
`lib/fitting-room/browser-photo.ts:37-54` (JPEG quality 0.9), `next.config.ts:112`
(`bodySizeLimit: "4mb"`).

**What happens.** The browser shrinks each photo to a 2048 px long side at JPEG quality 0.9.
A detailed full-body photo at that size is often 1.5–2.5 MB, so the two together can pass the
4 MB server-action limit (Vercel's own hard limit is 4.5 MB). The request is then rejected
before the action runs, and the visitor sees the generic "Something went wrong".

The server then shrinks them again to 768 × 1024 (face) and 1080 × 1440 (body)
(`photo-rules.ts:35-37`), so most of those bytes are thrown away.

**Fix:** send each photo at the size the server keeps (long side 1024 for the face, 1440 for
the body, quality ~0.85): typically 150–400 KB each, faster on mobile data, far under the
limit. Optionally check the total size before sending and say so in the visitor's language.

### ENG-07 · Every page carries the whole message catalog and very long image URLs — P2, M

**Where:** `app/[locale]/layout.tsx:68` (`<NextIntlClientProvider>` with no `messages`
selection), `components/costume/*`, `next.config.ts:97-98`.

**Measured on the home page** (production build): **627 KB of HTML (113 KB gzipped)**, 1,537 DOM
elements, ~971 KB transferred on a first visit (fonts 185 KB, JavaScript 290 KB, images
363 KB).

- `NextIntlClientProvider` in a Server Component passes **all** messages to the browser on
  every page, including the full Terms of service and Privacy policy (about 30 KB of JSON per
  page, about half of it legal text that only two pages need).
- Each costume photo's full Storage URL (~150 characters, URL-encoded) appears in eight
  `srcset` candidates and again in the React payload: the Storage host name occurs **870
  times** in the home page's HTML.

**Fix:**

- Pass only the namespaces client components use (next-intl's documented pattern:
  `messages={pick(messages, ["Basket", "Nav", …])}`), and give the legal pages their text as
  server-rendered content only.
- A custom `next/image` loader (or a short rewrite such as `/p/<file>` → the Storage URL) so
  each candidate URL is short.
- `content-visibility: auto` with an intrinsic size on costume rows below the fold: the
  browser skips rendering 70 rows until they scroll into view (pure CSS, no behavior change).

### ENG-08 · No page can be cached; every signed-in view checks Firebase — P2, L

**Where:** `app/[locale]/layout.tsx:59-63` (`await connection()`, `getUser()`),
`lib/auth/session.ts:41` (`verifySessionCookie(cookie, true)`), `app/api/fitting-room/*`.

**What happens.** The nonce CSP makes every page dynamic, so nothing is served from Vercel's
CDN, including the 246 public catalog pages that never change. For a signed-in visitor, every
page and every Fitting Room picture runs `verifySessionCookie(…, true)`, a network round trip
to Firebase Auth to check revocation. A finished try-on page loads about a dozen pictures,
each through that check.

**Why it matters.** Higher latency (TTFB) on every page, slower LCP on phones (search ranking),
and function and Firebase costs that grow with traffic in the busiest week of the year.

**Options:**

- A **hash-based CSP** for the catalog pages (Next.js supports subresource-integrity hashes,
  `experimental.sri`), so they can be static or ISR and served from the CDN; keep the nonce
  CSP for account and Fitting Room pages.
- Move the header's signed-in bits (avatar initials) to a small client fetch, so the layout
  doesn't need cookies for public pages.
- For picture requests, check revocation once per session start and use
  `verifySessionCookie(cookie)` without the revocation flag on images, or serve pictures with
  short-lived signed URLs (privacy trade-off: a URL works for anyone for a few minutes).

### ENG-09 · The first visible pictures load lazily — P2, S

**Where:** `components/home/transformation-reel.tsx:51-57`, `components/costume/costume-image.tsx`.

All 87 images on the home page use `loading="lazy"`, including the film strip that sits in the
first screen on phones, and the costume page's main photo. That delays the Largest Contentful
Paint. Give those `loading="eager"` and `fetchPriority="high"` on `next/image` (Next 16's docs
prefer these to the new `preload` prop; `priority` is deprecated).

### ENG-10 · Production is 51 commits behind, and the deploy config doesn't do what it says — P0, S

**Where:** `vercel.json`, git branches.

- `origin/main` (what Vercel deploys) stops at "Feat/vhs title cards (#3)". The approved stack
  on top of it, **192 files and ~31,000 lines** (the Fitting Room, makeup guides, Kostuma Pro,
  feedback, legal pages, SEO, shops), is not in production. Launching means merging the stack
  (as one release PR or in order), then checking Vercel's production environment variables
  (`TRY_ON_PROVIDER=youcam`, `YOUCAM_API_GENERATED_KEY`, reCAPTCHA keys, Firebase Admin
  credentials) and that `firestore.rules` and `storage.rules` are the deployed ones.
- `vercel.json` intends "deploy only main/master", but Vercel treats every key in
  `git.deploymentEnabled` as a **branch name** and deploys every branch not listed (Vercel docs,
  "Git Configuration"). So `fix/*`, `chore/*`, `docs/*`, `perf/*`, `style/*` and `refactor/*`
  branches get preview deployments when pushed (`fix/photo-masters-guard` is on the remote),
  and the `"preview"` and `"development"` keys only match branches with those literal names.
  To deploy only production: `{ "*": false, "main": true, "master": true }` (a branch deploys
  if any matching rule is true).
- The local `master` holds only the initial commit while the remote's default is `main`;
  agree on one production branch name to avoid confusion.

### ENG-11 · The e2e stand-ins exist only for Turbopack — P2, S

**Where:** `next.config.ts:61-74`.

The aliases that swap in fake sessions, stores and the fake renderer live under
`turbopack.resolveAlias`. A `next build --webpack` with `E2E=1` (the project notes use exactly
that for baseline comparisons) silently builds with the **real** modules: real Firebase, and
real YouCam if a key is present. Either mirror the aliases in a `webpack(config)` function or
throw when `E2E` is set and the bundler isn't Turbopack.

### ENG-12 · CI doesn't build production, audit dependencies or pin actions — P2, S

**Where:** `.github/workflows/ci.yml`.

- CI builds only the e2e configuration (inside Playwright's web server). Add `npm run build`
  for the production configuration (with dummy public env values) so a production-only break
  is caught before Vercel.
- Add `npm audit --omit=dev --audit-level=high` (or `osv-scanner`) and Dependabot or Renovate
  for `npm` and GitHub Actions. The critical Next.js advisory (SEC-01) would have opened a PR
  by itself.
- Pin actions to commit SHAs (`actions/checkout@<sha> # v7.0.1`) to protect against a
  compromised tag.

### ENG-13 · No error monitoring or alerting — P2, S

Server errors go to `console.error` only, so problems are seen only if someone reads Vercel's
logs. Add an error tracker (Sentry's free tier, or a Vercel log drain), include the try-on id
and step index in every Fitting Room log line (already done in most messages), alert on
YouCam failure rates and on 429s, and add CSP violation reporting (SEC-07).

### ENG-14 · HEIC photos are offered but often can't be opened — P2, S

**Where:** `components/fitting-room/photo-picker.tsx:165`, `lib/fitting-room/browser-photo.ts:29`.

The picker accepts `image/heic` and `image/heif`, but `createImageBitmap` decodes them only in
Safari. In Chrome, Edge or Firefox (a desktop user choosing an iPhone photo from their files,
or some Android phones set to HEIF) the visitor gets "This file can't be opened", although
they picked a normal phone photo. Either drop HEIC from `accept` outside Safari, or decode it
with a WebAssembly fallback (`libheif-js` / `heic2any`, both free) before resizing.

### ENG-15 · Smaller code issues — P3, S each

- **User input used as a plain object key**: `makeupGuides[slug]` (`lib/fitting-room/actions.ts:50`,
  `lib/guides.ts:16`). `"constructor"` or `"__proto__"` return Object's own properties; today
  the costume check right after it saves the day. Use a `Map` or `Object.hasOwn`.
- **A GET that spends money**: `GET /api/fitting-room/try-ons/[id]` starts renders. Safe today
  (owner-only, `SameSite=Lax`), but link previewers and prefetchers expect GET to be free.
  When webhooks land, make the page's request read-only.
- **Dead and misplaced dependencies**: the `cn` package is never imported (ESLint even forbids
  it): remove it. `shadcn` is only needed at build time for one CSS import: move it to
  `devDependencies` (it also brings most of the high-severity audit noise, SEC-10).
- **Unit test speed**: Vitest creates jsdom 87 times (46 % of the run). Run the pure `lib/`
  tests in the `node` environment (Vitest projects) or use `pool: "vmThreads"`.
- **The README is still the shadcn template.** The real knowledge lives in a gitignored
  `checkpoint.md`. Give the repo a README that a new team member can use: what Kostuma is, how
  to run it, environment variables, test commands, the Fitting Room's architecture, and the
  owner's rules for the makeup guides.

## Scale summary

| Resource                | Today's ceiling                                | After ENG-01 and ENG-02                                |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------ |
| Concurrent try-ons      | ~1–2 before 429s                               | ~8 per 5 minutes (~16 with point 5), queued beyond     |
| Try-ons in total        | ~45–65 (units left)                            | whatever the budget buys, never exceeded               |
| A tab closed mid try-on | stalls until the visitor returns               | finishes on its own                                    |
| Units out               | try-ons fail and visitors lose their allowance | Fitting Room closes itself, nobody loses their costume |
