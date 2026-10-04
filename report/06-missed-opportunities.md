# 06 · Missed opportunities

Things Kostuma could do with what it already has, with YouCam's other APIs, or with free
technology. Each one is checked against the owner's rules:

- the flow stays Browse → My Pumpkin Basket → Fitting Room → Buy, with no new menu items;
- face pictures come **only** from Makeup VTO and Hair Color (one hair color, last), as YouCam
  returns them; **nothing is ever drawn on, masked or composited onto a visitor's picture**;
- every makeup step is something a person can do at a vanity;
- minimal interface: anything visible is a **proposal** for the owner.

YouCam currently lists 66 APIs (docs.perfectcorp.com/reference, checked 2026-10-04). The ones
below are those that help without breaking a rule.

## From YouCam (Perfect Corp)

### OPP-01 · Webhooks — fits the rules · M

Already in the project's plans; it is the single most valuable change for launch. YouCam calls
a Kostuma route when a task finishes (Standard Webhooks, HMAC-SHA256 signatures, `whsec_`
secret, `webhook-id` for idempotency). It removes status polling (ENG-01), lets try-ons finish
when the visitor leaves (ENG-05), and saves about half of all API calls. Use the
`standardwebhooks` package; verify the signature on the raw body; respond 2xx fast and do the
work in `after()`.

### OPP-02 · The Unit System API — fits · S

`GET /s2s/v1.0/client/credit` returns the remaining units. A Vercel Cron job (free) can check
it hourly, store it, alert the owner and close the Fitting Room below a floor (ENG-02).

### OPP-03 · Skin tone analysis for better pale bases — fits (no picture is made) · M

Guides with a paler foundation ask for "n shades lighter than your skin"; Kostuma measures the
skin itself from the middle of the face photo with a classic YCbCr range
(`lib/fitting-room/photo.ts:110-138`), which lighting, makeup and beards can fool. YouCam's
**AI Skin Tone Analysis** (and **Fitzpatrick Skin Type**) measures it properly. It produces
data, not a picture, so the face rule is untouched. Bonus: the guide could name the shade to
buy ("porcelain", "ivory") instead of "three shades lighter". Check the unit cost first; it
could run only for guides that use a skin-based foundation.

### OPP-04 · Check the face photo before paying for renders — fits · M

A face photo YouCam can't read fails only **after** the outfits were paid for. YouCam's **AI
Face Analyzer** (or the free browser option, OPP-09) can confirm one frontal, open-eyed face of
sufficient size first. Data only, no picture.

### OPP-05 · Nail VTO for characters with iconic nails — owner's call · L

Painting nails is something a visitor really does at a vanity, and several characters are
defined by them: the Lipstick-Face Demon's long black nails, Count Orlok's claws, Tiffany's
red manicure, Frank-N-Furter. YouCam's **AI Nail VTO** renders polish on a photo of a hand. It
isn't a face picture (so the face rule doesn't apply), but it adds a third photo and a step:
only if the owner wants it, as an optional last step.

### OPP-06 · A live mirror at the vanity — owner's call · L

The guide's whole premise is someone sitting at a mirror following steps. Perfect Corp also
sells live, camera-based AR makeup (a web SDK for brands, separate from the AI API). A "mirror
mode" that shows the current step live on the visitor's camera while they apply it is the
ultimate version of the primary feature, and the rendering is still YouCam's, never drawn by
Kostuma. Commercial terms and a camera permission (`Permissions-Policy` currently blocks the
camera) would be needed. Worth one conversation with Perfect Corp, not a launch item.

### OPP-07 · Fewer calls per try-on — fits · S

Reuse the garment's `file_id` per costume (files live 30 days), and test chaining steps by URL
(`src_url`) instead of re-uploading each picture. Details in ENG-01, point 5.

### Deliberately not suggested

Look VTO, Eye Color Lens, Hairstyle and bangs, Face Reshape, the AI image editor (AI Replace,
image-to-image), Face Swap, Hat and other generated accessories, Photo Enhance or Lighting on
the visitor's photo, background removal on results, and video generation. Each either edits or
draws on the visitor's picture, or was already evaluated and excluded by the owner. Listed so
nobody spends time re-evaluating them.

## Free technology

### OPP-08 · Keep the screen awake at the vanity — fits, invisible · S

With makeup on their fingers, nobody wants to unlock their phone between steps. The **Screen
Wake Lock API** (Chrome, Edge, Safari 16.4+, Firefox 126+) keeps the screen on while a finished
try-on's guide is open: about ten lines, no UI, released when the page is hidden.

### OPP-09 · Check photos in the browser before upload — fits · M

**MediaPipe Face Landmarker and Pose Landmarker** (Google, Apache-2.0, WebAssembly) run in the
browser and can check exactly what YouCam requires: one face, facing the camera within ~10°,
eyes open, face at least 100 px wide; for the body photo, a whole person standing and facing
the camera. A clear message before upload ("Your face is turned: look straight at the camera")
means fewer failed try-ons, fewer lost tries and fewer wasted units. Load it only on the photo
step (dynamic import); the CSP needs `'wasm-unsafe-eval'` and the model files served from
Kostuma's own origin. Nothing changes the photo itself.

### OPP-10 · Hands-free steps — proposal · M

"Next" and "back" by voice with the **Web Speech API** (Chrome and Edge; partial in Safari),
behind a small microphone toggle, off by default. Requires allowing the microphone for
Kostuma's own origin in the Permissions-Policy (`microphone=(self)`).

### OPP-11 · Let visitors download and share their own pictures — fits · S

A "Save" action on each picture: the same JPEG the visitor already sees, unaltered, served with
`Content-Disposition: attachment` from the existing owner-only route; on phones, the **Web Share
API** (level 2, files) hands it to TikTok, Instagram or Messages. Nothing is published by
Kostuma and nothing is composited, so both the privacy promise and the "never draw" rule hold.
This is the cheapest growth feature available (PMF-08).

### OPP-12 · "What you need" for each guide — proposal · S

Each step lists its products; a guide doesn't list them together. One list per guide
(deduplicated: "white cream face paint, setting powder, glue stick, black eyeshadow…"), each
item with its shop link, makes one shopping trip possible, and a print stylesheet turns the
guide into a page to prop against the mirror. An "about 45 minutes" estimate (from the step
count) helps people plan Halloween night.

### OPP-13 · Transactional email — fits · S

Firebase's **Trigger Email** extension (with any SMTP provider) or **Resend**'s free tier for:
email verification (SEC-02), the Kostuma Pro acknowledgement (COPY-09), and "your
transformation is ready" once try-ons finish on their own (ENG-05). Update the Privacy policy's
"Emails" line in the same change.

### OPP-14 · See problems before visitors report them — fits · S

**Sentry** (free tier) for server and browser errors and CSP reports; **Vercel Cron** for the
unit balance; **Vercel Web Analytics** (cookieless) for the funnel (PMF-05). Together, about a
day of work, and the difference between learning about a broken Google sign-in from a log
alert or from an empty sign-up chart a week later.

### OPP-15 · Privacy on autopilot — fits · S

A **Cloud Storage lifecycle rule** deleting `fitting-room/**` objects after a set age, and a
Firestore TTL policy (or scheduled cleanup) for old try-on documents. No code in the app; makes
the retention promise of SEC-04 true automatically.

### OPP-16 · The guide works offline — proposal · M

The web manifest already exists. A small service worker that caches a finished try-on's guide
(its words and that visitor's own pictures, in their own browser) would keep it working at a
vanity with weak Wi-Fi, and "Add to Home Screen" would make it feel like an app on Halloween
night. Offer it as an explicit choice on shared devices.

## Content and growth

### OPP-17 · The guides' words on the costume pages — fits · M

See PMF-03. Steps, products and "to finish" notes as text under "The look", in all three
languages: 246 makeup-tutorial pages for October searches, without a new action on the page.
Update the costume pages' titles to "\<name\> costume and makeup guide" (COPY-13).

### OPP-18 · A calendar beyond October 31 — fits · S per date

Día de los Muertos (November 1–2), Friday the 13th (November 13, 2026), Krampusnacht (December
5), Christmas horror, then next Halloween. Details in PMF-09. The catalog already covers most of
it; what's missing is a plan for when each costume gets promoted.

### OPP-19 · Costumes for two or more — proposal · S

The catalog has natural group costumes: the Grady Twins ("best with your twin", says the
guide), the Craft Coven, Killer Klowns, the Purge Anarchists, Red & The Tethered, Jigsaw &
Billy. A plain "share this costume" (the Web Share API with the costume page's link) invites the
second person, who then makes their own account and try-on. It brings new visitors without
any shared pictures.

### OPP-20 · Use the data Kostuma already has — fits, no UI · S

The `trending` flag (11 breakout costumes of 2024–2026) is in the data but, by design, never
shown. It's ready-made material for social posts and newsletters ("trending this week"), and
the waitlist's `source` field already says where interest in Kostuma Pro comes from.
