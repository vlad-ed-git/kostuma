# 07 · Action plan

Everything from the other files as one checklist, in the order it should happen. Roles:
**Owner** (decisions, accounts, money), **Eng** (code), **Design**, **Content** (copy and
translations). Effort: S under half a day, M one to two days, L three or more.

Halloween is on Saturday, October 31, 2026: 27 days from this audit.

## 1. Before anyone is invited (P0)

| Done | Id     | Action                                                                                                  | Who        | Effort |
| ---- | ------ | ------------------------------------------------------------------------------------------------------- | ---------- | ------ |
| [ ]  | SEC-01 | Upgrade `next` and `eslint-config-next` to 16.3.8; run `npm run check` and the e2e suite                | Eng        | S      |
| [ ]  | SEC-02 | `startSession`: no terms step (and no profile) for `password` accounts that `register` didn't make      | Eng        | S      |
| [ ]  | SEC-02 | Firebase Auth: turn off client-side sign-up; require a verified email for the free try-on               | Owner, Eng | S–M    |
| [ ]  | ENG-02 | Runtime switch for the Fitting Room (no redeploy needed) and a daily unit budget in `store.begin`       | Eng        | M      |
| [ ]  | ENG-02 | Low-units monitor: Vercel Cron + YouCam Unit API, email alert, auto-close below a floor                 | Eng        | S      |
| [ ]  | ENG-03 | Count only photo failures in `failedTries`; 429/5xx/`unavailable` never cost the visitor                | Eng        | S      |
| [ ]  | ENG-01 | Throttle YouCam status checks server-side; 429 = wait with backoff, not an attempt                      | Eng        | S      |
| [ ]  | ENG-01 | Webhooks (OPP-01), or at least a site-wide call budget with a waiting line                              | Eng        | M      |
| [ ]  | ENG-01 | Ask Perfect Corp about a higher rate limit for October                                                  | Owner      | S      |
| [ ]  | PMF-04 | Decide the daily budget; buy the units for the launch window                                            | Owner      | S      |
| [ ]  | ENG-10 | Merge the approved stack into `main`; fix `vercel.json` (`"*": false`, `main`/`master` true)            | Owner, Eng | S      |
| [ ]  | ENG-10 | Vercel production env: `TRY_ON_PROVIDER`, YouCam key, reCAPTCHA keys, Admin credentials; rules deployed | Owner      | S      |
| [ ]  | PMF-01 | Search Console and Bing: verify the domain, submit `/sitemap.xml`, request indexing of top pages        | Owner      | S      |

## 2. Before launch if at all possible (P1)

| Done | Id      | Action                                                                         | Who            | Effort |
| ---- | ------- | ------------------------------------------------------------------------------ | -------------- | ------ |
| [ ]  | UX-01   | Photo buttons fit on 360 px phones                                             | Eng, Design    | S      |
| [ ]  | UX-04   | Confirm screen says this uses the free costume                                 | Content, Eng   | S      |
| [ ]  | UX-02   | Picking a frame on phones brings the mirror into view                          | Eng            | S      |
| [ ]  | UX-03   | "Start with step 1" when a try-on is done                                      | Design, Eng    | S      |
| [ ]  | COPY-01 | Fix the "Torn" bullet in en/es/zh                                              | Content        | S      |
| [ ]  | COPY-02 | Replace "special-effects makeup included"                                      | Content        | S      |
| [ ]  | COPY-03 | Make costume cards and guides agree (Hannibal, Grace, Pamela)                  | Content        | S      |
| [ ]  | ENG-06  | Send photos at the size the server keeps (≤ 1024 / 1440 px)                    | Eng            | S      |
| [ ]  | ENG-04  | Start deadline shorter than the lease; explicit `maxDuration`                  | Eng            | S      |
| [ ]  | ENG-05  | Cron sweeper for try-ons nobody is watching                                    | Eng            | M      |
| [ ]  | SEC-03  | Face-photo consent line on the confirm screen; Privacy paragraph; legal review | Owner, Content | M      |
| [ ]  | SEC-04  | Self-serve "delete my photos" and "delete my account"; storage lifecycle rule  | Eng            | M      |
| [ ]  | PMF-05  | Cookieless analytics and server-side funnel counters; Privacy policy updated   | Eng, Owner     | M      |
| [ ]  | COPY-12 | One safety line before step 1                                                  | Content        | S      |
| [ ]  | COPY-09 | Rephrase the Kostuma Pro promise (or automate the 24-hour reply)               | Owner, Content | S      |

## 3. The first weeks after launch (P2)

| Done | Id                     | Action                                                                                          | Who            | Effort |
| ---- | ---------------------- | ----------------------------------------------------------------------------------------------- | -------------- | ------ |
| [ ]  | PMF-03, OPP-17         | Publish the guides' words on costume pages; titles "… costume and makeup guide"                 | Eng, Content   | M      |
| [ ]  | OPP-11                 | Save/share your own pictures (unaltered)                                                        | Eng            | S      |
| [ ]  | OPP-08                 | Screen Wake Lock while following the guide                                                      | Eng            | S      |
| [ ]  | PMF-02                 | Decide on "makeup only" try-ons (face photo only)                                               | Owner          | S      |
| [ ]  | ENG-07                 | Ship only the messages each page needs; short image URLs; `content-visibility` on rows          | Eng            | M      |
| [ ]  | ENG-09                 | Eager-load the first visible pictures                                                           | Eng            | S      |
| [ ]  | UX-05, UX-06           | "Try on" stronger than "Remove"; the home link looks like a link                                | Design, Eng    | S      |
| [ ]  | UX-09, UX-10           | Used state links to its try-on; failures say whether they cost anything                         | Content, Eng   | S      |
| [ ]  | UX-11                  | Product links search in English (display translated)                                            | Eng            | S      |
| [ ]  | UX-07, UX-08           | Proposals: a "keep this page open" line while rendering; Pro only after the free costume        | Owner, Design  | S      |
| [ ]  | OPP-09                 | Check face and body photos in the browser before upload (MediaPipe)                             | Eng            | M      |
| [ ]  | OPP-13, OPP-14, OPP-15 | Transactional email; error monitoring; storage lifecycle rule                                   | Eng            | S each |
| [ ]  | PMF-06                 | Learn from the waitlist: where it's pressed, joins per used free costume, one question by email | Owner          | S      |
| [ ]  | UX-12                  | Chinese headline breaks and a subset CJK display font                                           | Design, Eng    | M      |
| [ ]  | COPY-04 – COPY-08      | Facts, wording, typography, stale statements                                                    | Content        | M      |
| [ ]  | COPY-13                | Home and costume page titles and descriptions                                                   | Content        | S      |
| [ ]  | COPY-14                | A native read of the Spanish and Chinese                                                        | Owner          | M      |
| [ ]  | SEC-05                 | Name the operator in the legal pages                                                            | Owner          | S      |
| [ ]  | SEC-06, SEC-07, SEC-08 | Decode limits; CSP reporting; sign out everywhere                                               | Eng            | S each |
| [ ]  | SEC-10                 | Dependency hygiene (`cn` out, `shadcn` to dev, gRPC override, `npm audit fix`)                  | Eng            | S      |
| [ ]  | ENG-08                 | Decide on static catalog pages (hash CSP) vs. everything dynamic                                | Eng            | L      |
| [ ]  | ENG-11, ENG-12, ENG-13 | e2e aliases for webpack; CI builds production, audits, pins actions; error monitoring           | Eng            | S each |
| [ ]  | ENG-14                 | HEIC: decode fallback or a clear message                                                        | Eng            | S      |
| [ ]  | PMF-07                 | Custom domain and an email address on it                                                        | Owner          | S      |
| [ ]  | PMF-09, OPP-18         | Post-Halloween calendar (Día de los Muertos, Friday the 13th, Krampusnacht)                     | Owner, Content | S      |

## 4. Polish (P3)

UX-13 to UX-16, COPY-10, COPY-11, COPY-15, ENG-15, SEC-09, PMF-10, and the proposals in
06-missed-opportunities.md (OPP-03 to OPP-06, OPP-10, OPP-12, OPP-16, OPP-19, OPP-20), each when
the owner wants it.

## Launch-day checklist

1. `main` deployed with every approved branch; `npm run check` and the whole e2e suite green on
   it.
2. Vercel production environment variables set; `firestore.rules` and `storage.rules` are the
   deployed versions; a Preview deployment has no production secrets.
3. YouCam: units bought for the budget; the runtime switch tested (closing it shows "The
   Fitting Room is closed" within seconds); the low-units alert tested.
4. One real try-on on production with the owner's own sample photos (spends 8–12 units: the
   owner's decision), watched end to end.
5. Search Console and Bing verified, sitemap submitted.
6. Someone watches the error tracker, the unit balance and the funnel counters for the first
   48 hours, with the switch at hand.
