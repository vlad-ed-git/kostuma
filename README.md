# Kostuma

Halloween costumes for horror fans, 17 and up: browse 82 characters, keep the
ones you like in **My Pumpkin Basket**, try them on in the **Fitting Room**
(the outfit on your photo, then the character's makeup on your own face, step
by step), and **Buy** from the shops that carry them. In English, Spanish and
Chinese, dark only. Live at <https://kostuma.vercel.app>.

## Stack

Next.js 16 (App Router, `proxy.ts`, React Compiler) · React 19 · TypeScript ·
Tailwind CSS 4 with shadcn/ui and Base UI · next-intl · Firebase (Auth,
Firestore, Storage, through the Admin SDK on the server) · YouCam AI APIs
(Perfect Corp.) for the try-on pictures · Vercel (hosting, Cron) · Vitest ·
Playwright.

Next.js 16 differs from older versions: read the guides in
`node_modules/next/dist/docs/` before changing framework code.

## Getting started

1. Node 24 (`.nvmrc`), then `npm ci`.
2. Copy `.env.example` to `.env` and fill it in. Every setting is explained
   there: the Firebase web app, the Admin credentials, reCAPTCHA, the YouCam
   key and webhook secret, the cron secret. Never commit `.env`.
3. `npm run dev`, then <http://localhost:3000>.

The app always talks to the real services, localhost included: a try-on on
your machine spends real YouCam units. Fakes and stand-ins exist only in the
automated test builds (below). Without a YouCam key the Fitting Room says it
is closed; it never pretends.

## Commands

| Command                   | What it does                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run check`           | ESLint (no warnings), types, Prettier, and the unit tests. Run it before every commit.                                                                            |
| `npm test`                | The unit tests (Vitest): logic in Node, components in jsdom.                                                                                                      |
| `npm run test:e2e`        | The end-to-end tests (Playwright, desktop Chrome and Pixel 7) against a production build with `E2E=1`: fake sign-in, an in-memory store and a free fake renderer. |
| `npm run test:firestore`  | The store's transactions, rules and file deletions against the Firestore and Storage emulators. Local only; needs Java 21.                                        |
| `npm run test:emulators`  | Accounts, the waitlist and feedback end to end against the Auth and Firestore emulators. Local only; needs Java 21.                                               |
| `npm run images`          | Redraws the generated images (placeholder, fog, film strip, icons).                                                                                               |
| `npm run photos:*`        | The costume photo pipeline (`masters`, `add`, `upload`, `samples`): see the scripts in `scripts/photos/`.                                                         |
| `npm run makeup:patterns` | Checks the makeup guides' patterns against YouCam's live catalogs (no key, no units).                                                                             |

Test builds go to their own folders (`.next-e2e`, `.next-emulators`), so a
running `next dev` is never disturbed. Their stand-ins (`*.e2e.ts`) are
swapped in by one alias map in `next.config.ts`, for Turbopack and webpack
alike; the build refuses to run them on Vercel.

## Where things are

- `app/` routes: pages under `app/[locale]/`, API routes under `app/api/`
  (the Fitting Room's pictures and try-ons, YouCam's webhook, the daily cron).
- `components/` UI, by feature. `components/ui/` holds the shadcn/Base UI
  primitives; class names go through `cn` from `@/lib/utils`.
- `lib/` logic, mostly pure and unit-tested: `fitting-room/`, `basket/`,
  `auth/`, `waitlist/`, `account/`, `catalog/`, `seo`, `security/csp`.
- `content/` the catalog (`costumes.ts`), the makeup guides (`makeup.ts`) and
  their translations (`translations/es.json`, `zh.json`).
- `messages/` every interface message in `en`, `es` and `zh`.
- `docs/design-spec.md` the design specification. It is the law for anything
  visible.

## The Fitting Room

A try-on is a costume on the visitor's photos: the outfit on the body photo
(YouCam AI Clothes), the same outfit on the face photo, then each step of the
costume's makeup guide on the picture the step before left (Makeup VTO, and
at most one Hair Color step, last). `lib/fitting-room/`:

- `render-plan.ts` turns a guide into renders; `PIPELINE_VERSION` is part of
  every try-on's id: bump it whenever the same photos and costume would render
  differently.
- `steps.ts` is the state machine. Each move claims its step first, so two
  requests never send a render twice. YouCam's signed webhook
  (`app/api/youcam/webhook`) moves a try-on along when a render ends; the
  open page asks too (POST every 2 s), which is all that moves it on localhost.
  YouCam is asked about a running render at most every 5 s (makeup) or 10 s
  (outfits).
- `calls.ts` keeps the whole site under YouCam's limit (250 requests per 300 s
  per key and per IP) with a token bucket in Firestore; a busy YouCam makes a
  render wait, never fail.
- `budget.ts` is the owner's switch and daily budget, steered in Firestore
  without a deploy: `config/fittingRoom { open, dailyUnits, floor }`. Each
  try-on reserves its units when it starts and gives back what it never
  rendered. YouCam running out of units closes the Fitting Room at once.
- `free-costume.ts`: one costume free per account, kept in
  `allowances/{uid}`, apart from the photos.
- `daily.ts` (Vercel Cron, `CRON_SECRET`): YouCam's balance, try-ons stuck
  over a day ended as Kostuma's failure, photos and pictures older than 12
  months deleted.
- Privacy: the visitor ticks a consent on the confirm screen before each
  try-on (kept with its time and wording version); photos and pictures are
  served only to their owner; the account page deletes them, or the whole
  account. The Privacy policy states all of it.

## The rules (the owner's)

Makeup guides (`content/makeup.ts`, held to them by `content/makeup.test.ts`):

- The face's pictures come only from **Makeup VTO and Hair Color**, as YouCam
  returns them. Never an image editor, Look VTO templates, lenses, hairstyles
  or face reshaping, and never code that draws on, masks or composites a
  visitor's picture.
- Every step is makeup a person puts on at a vanity, at full strength. At most
  one hair color, last. No cuts, wigs, lenses or props in a step.
- What makeup can't draw (blood, stitches, fangs, a line through the eye) goes
  in the guide's closing words (`finish`), never into a render.

Content and copy:

- Every message, costume and guide exists in English, Spanish and Chinese; the
  tests fail without all three. Character names and credited people stay as
  they are.
- Copy says what visitors see and can do, never how or where things are
  stored.
- The Terms of service and the Privacy policy stay true to the code: a change
  to what is kept, sent or stored changes them, in all three languages, with
  their dates in `lib/legal.ts`.
- No prices or payments anywhere: Kostuma Pro is a waitlist.

Design: dark only; WCAG 2.2 AA and `prefers-reduced-motion` respected; menus
hold places, never actions.

## Operations

- **YouCam webhook:** create an endpoint for
  `https://kostuma.vercel.app/api/youcam/webhook` in YouCam's API console and
  put its secret in `YOUCAM_WEBHOOK_SECRET` on Vercel.
- **Cron:** set `CRON_SECRET` on Vercel; `vercel.json` runs
  `/api/cron/daily` every day.
- **The switch:** `config/fittingRoom` in the Firebase console (`open`,
  `dailyUnits`, `floor`; the balance is written there daily).
- **Rules:** `firestore.rules` and `storage.rules` are deployed by the owner
  (`firebase deploy --only firestore:rules`).
- On Vercel the Fitting Room stays closed until `TRY_ON_PROVIDER=youcam`.

## Contributing

One branch per piece of work (`feat/…`, `fix/…`, `chore/…`), Conventional
Commits with a body that says why, `npm run check` and the touched end-to-end
tests green before each commit. Prettier formats everything (no semicolons,
double quotes).
