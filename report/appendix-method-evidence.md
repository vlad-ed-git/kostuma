# Appendix · Method and evidence

How the audit was done, what was measured, and how to reproduce it. Date: 2026-10-04. Branch
`feat/audit`, code at `7fd4bd8`. No application code was changed; this folder is the only
addition.

## Ground rules followed

- **No YouCam units spent.** The running app was reviewed only on the project's e2e build,
  whose stand-ins (`*.e2e.ts`) replace sessions, Firestore, Storage and the renderer.
- **No production data touched**, no Firebase rules deployed, nothing pushed.
- The owner's `next dev` on port 3000 was left alone; the e2e build was served on port 3100
  and stopped afterwards.
- Real-render timings come from the project's own earlier measurements (each makeup step
  about 6–10 s; a Pennywise try-on about 1.5 minutes).

## What was run

| Check                     | How                                                                                                                                                                                                       | Result                                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Lint, types, format, unit | `npm run check`                                                                                                                                                                                           | ESLint 0 warnings; `tsc` clean; Prettier clean; Vitest **87 files, 1,929 tests passed** in 23 s                                                                    |
| Production-like build     | The existing `.next-e2e` build (no tracked file newer than it) served with `E2E=1 SITE_URL=http://localhost:3100 FAKE_RENDER_MS=400 RECAPTCHA_SITE_KEY=<Google's public test key> npx next start -p 3100` | Every page 200 locally; HTML responses ~150–400 ms                                                                                                                 |
| Visual walkthrough        | Playwright (the project's own), 360 / 390 / 1024 / 1440 px, en / es / zh, signed out and in (`e2e-session` cookie), a whole fake try-on of Pennywise                                                      | ~45 screenshots reviewed; **no console errors, no failed requests, no CSP violations** (only the intended 404s)                                                    |
| Fake try-on               | Pennywise, 8 renders at 400 ms each                                                                                                                                                                       | Finished in ~17 s: about 2.1 s per step even though each render took 0.4 s; the 2 s poll sets the pace                                                             |
| Overflow                  | Script listing visible elements past the right gutter at 360 px                                                                                                                                           | Only the Fitting Room's photo buttons (face 196→385 px, body 183→371 px; UX-01)                                                                                    |
| Accessibility             | axe-core 4.10.2 (tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`), CSP bypassed for injection only                                                                           | **0 violations** on 12 states: home (desktop, phone), costume page, basket, sign in, register, feedback, terms, 404, account, Fitting Room photos, finished try-on |
| Page weight               | Chrome DevTools Protocol, first visit of the home page at 1440 px                                                                                                                                         | 971 KB transferred: fonts 185, JavaScript 290, images 363, HTML 113 (627 KB uncompressed); 1,537 DOM elements                                                      |
| HTML contents             | Counting strings in the home page's HTML                                                                                                                                                                  | Terms and Privacy texts present (the whole message catalog); the Storage host appears 870 times                                                                    |
| Headers                   | `curl -I`                                                                                                                                                                                                 | HSTS, nosniff, DENY, Referrer-Policy, Permissions-Policy, COOP, nonce CSP on every page                                                                            |
| reCAPTCHA                 | Time until its frame appears on `/register`                                                                                                                                                               | ~2.8 s, in reserved space                                                                                                                                          |
| Dependencies              | `npm audit --omit=dev`, `npm outdated`                                                                                                                                                                    | 1 critical (Next.js), 10 high, 2 moderate (see SEC-10)                                                                                                             |
| Production branch         | `git log origin/main`, `git diff --stat origin/main HEAD`                                                                                                                                                 | `main` ends at "Feat/vhs title cards (#3)"; 51 commits, 192 files, +30,906 / −920 lines not in production                                                          |
| Content                   | Every costume entry and guide step extracted with Node (`content/*.ts`) and read in full; English messages and legal texts read in full                                                                   | Findings in 04-copy-content.md                                                                                                                                     |

## External facts checked

| Fact                                                                                                               | Source (fetched 2026-10-04)                             |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| 250 requests / 300 s per IP **and** per access token; 429 beyond; ~5 QPS recommended                               | docs.perfectcorp.com/develop/rate_limit                 |
| Files and task ids kept 30 days; result URLs valid 2 hours                                                         | docs.perfectcorp.com/develop/file_retention_period      |
| Webhooks follow Standard Webhooks, HMAC-SHA256, `whsec_` secret                                                    | docs.perfectcorp.com/develop/webhook                    |
| 66 AI APIs (makeup, skin and face analysis, nails, hair, fashion, image and video)                                 | docs.perfectcorp.com/reference                          |
| The products page given in the brief (`yce.perfectcorp.com/ai-api/products/`)                                      | Returned 404 at the time of the audit                   |
| `next` 16.2.0–16.3.5: RCE in `next/og` ImageResponse, fixed in 16.3.6, CVSS 9.5                                    | github.com/advisories/GHSA-vcvr-r3jv-pc5j               |
| Vercel `git.deploymentEnabled`: keys are branch names (minimatch), unlisted branches deploy, any `true` match wins | vercel.com/docs/project-configuration/git-configuration |
| Latest GitHub Actions used by CI: checkout v7.0.1, setup-node v7.0.0, upload-artifact v7.0.1                       | GitHub releases API                                     |

## The rate-limit arithmetic (ENG-01)

From the code path (`lib/fitting-room/steps.ts`, `youcam.ts`), for one Pennywise try-on (two
outfit renders, six face steps), with the page asking every 2 s plus the answer's own time:

| Calls per render                      | Outfit (cloth-v4) | Makeup / hair step |
| ------------------------------------- | ----------------- | ------------------ |
| File upload (`POST /s2s/v2.0/file`)   | 2                 | 1                  |
| Task (`POST /s2s/v2.0/task/…`)        | 1                 | 1                  |
| Status (`GET …/{task_id}`), per poll  | ~6–12             | ~3–4               |
| Delete (`POST /s2s/v2.0/task/delete`) | 1                 | 1                  |
| **Total**                             | **~10–16**        | **~6–7**           |

Two outfits and six steps: **~56–74 calls in ~90–120 s**, i.e. 0.5–0.7 calls per second for a
single visitor, against a site-wide budget of 250 / 300 s ≈ 0.83 per second. (The upload `PUT`
goes to a storage URL, not counted here.) With webhooks, status calls disappear: ~30 calls per
try-on, about 8 try-ons per 5 minutes. Reusing the garment upload and chaining by URL brings it
to ~14 calls, about 16 per 5 minutes.

## Not done (and why)

- **Real renders**: they spend the owner's units; the owner judges render quality on their own
  localhost.
- **Lighthouse**: the same ground (performance, accessibility, SEO, best practices) is covered
  above with direct measurements; run it on production as part of the planned
  `chore/release-check`.
- **Load testing**: the bottleneck is YouCam's rate limit, which is documented, not something
  to discover by hammering a paid API.
- **Firebase console settings** (client sign-up enabled or not, authorized domains, password
  policy) and **Vercel settings** (environment variables, deployment protection): not visible
  from the code; listed in the action plan for the owner to check.
- **Native-speaker review** of Spanish and Chinese, and **legal review**: outside an
  engineering audit (COPY-14, SEC-03).

## Reproducing

```bash
# Quality gate
npm run check

# Serve the e2e build (build it first with `E2E=1 npm run build` if it's older than the code)
E2E=1 SITE_URL=http://localhost:3100 FAKE_RENDER_MS=400 \
  RECAPTCHA_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI \
  npx next start -p 3100

# Signed in, in a Playwright context: cookie e2e-session=<any-id> on http://localhost:3100,
# and localStorage "e2e.account-basket" = '["pennywise"]' for the Fitting Room.

# Dependencies
npm audit --omit=dev
npm outdated

# What production lacks
git fetch origin && git diff --stat origin/main HEAD | tail -1
```
