# TODO · Act on the audit

**Task:** fix, improve and build what `report/` found, within the scope below. The report holds
the details (where, why, how); this file decides the scope and, where the report offers
options, the approach. Each section names its report file.

## Rules

- Where the report offers options, take the one chosen here. Anything else: the best approach
  that is feasible, testable and robust.
- **Do not read `report/05-product-market-fit.md`** and do no PMF work. Ignore PMF references
  in other files, and every OPP not listed below.
- The project's rules hold (`checkpoint.md`): dark only; tests with every change (unit; e2e for
  touched flows; the emulator suites, locally, when Firestore logic changes); every new
  message in en, es and zh; new settings in `.env.example`; the Terms and Privacy policy stay
  true to the code (update their dates in the same change); never spend YouCam units without
  the owner's OK; fakes only in test builds; face pictures only from Makeup VTO and Hair Color,
  never drawn on; no new menu items.
- Kostuma is made by a small independent team and is **not affiliated with YouCam / Perfect
  Corp.**, a paid service it uses. There is no lawyer yet: legal wording is the safest
  possible.
- Suggested order: ENG-02, ENG-03, ENG-01, ENG-04–06, SEC-06, SEC-03–05, UX-01–04, COPY-01–03,
  then the rest.
- Done when every box is ticked and `npm run check` and the whole e2e suite are green.

## Out of scope

ENG-10, ENG-12, ENG-13 (Firebase Analytics records browser events; it can't see the server
errors ENG-13 is about, and Crashlytics has no web SDK), SEC-01, SEC-02, SEC-07, SEC-08,
SEC-10, UX-14, UX-15, everything in `05-product-market-fit.md`, every OPP except OPP-03,
OPP-11 and OPP-12.

## Engineering (`01-engineering.md`)

- [x] **ENG-01** YouCam webhooks drive try-ons (a route checking the Standard Webhooks
      signature, idempotent on `webhook-id`, `YOUCAM_WEBHOOK_SECRET`; the e2e fake fires it
      too). Page polling stays a complete fallback (webhooks can't reach localhost) but asks
      YouCam at most every 5 s for makeup, 10 s for outfits. A site-wide token bucket in
      Firestore under 250 calls / 300 s; when empty the step waits and the page says "The mirror
      is busy. Your try-on starts in a moment." 429/5xx = busy: backoff, no attempt counted.
      Reuse each garment's `file_id`. Owner: register the webhook in YouCam's console.
- [x] **ENG-02** `config/fittingRoom` in Firestore (`open`, `dailyUnits`, `floor`), read at every
      start; the day's units reserved in `store.begin`'s transaction; `CreditInsufficiency`
      closes it at once; a daily Vercel Cron (`CRON_SECRET`) syncs the Unit API balance and
      closes it below the floor. Closed shows the existing "closed" message.
- [x] **ENG-03** Only photo failures (`face_photo`, `body_photo`, `photo_rejected`) count in
      `failedTries`.
- [x] **ENG-04** One 40 s deadline for a whole `start` (under `LEASE_MS`); `maxDuration = 60` on
      the Fitting Room routes.
- [x] **ENG-05** Webhooks (ENG-01) keep try-ons going without the page; the daily cron ends
      try-ons stuck over 24 h, as Kostuma's failure, not the visitor's.
- [x] **ENG-06** The browser sends the face at ≤ 1024 px and the body at ≤ 1440 px (long side),
      JPEG 0.85; a translated message if both together pass 4 MB.
- [x] **ENG-07** Client components get only the message namespaces they use (no legal text on
      other pages); `content-visibility: auto` on costume rows. Leave image URLs as they are
      (gzip absorbs the repetition).
- [x] **ENG-08** Picture routes verify the session cookie without the revocation round trip;
      pages and actions keep it. Pages stay dynamic (nonce CSP).
- [x] **ENG-09** `loading="eager"` + `fetchPriority="high"` for the home film strip and the
      costume page's main photo.
- [x] **ENG-11** One alias map feeds both `turbopack.resolveAlias` and `webpack()`;
      `next.config.test.ts` checks it.
- [x] **ENG-14** Drop HEIC/HEIF from `accept` (iOS then hands over a JPEG); a specific translated
      message if one still arrives.
- [x] **ENG-15** `Map`/`Object.hasOwn` for slug lookups; the advancing request becomes a POST,
      GET only reads; remove `cn`; `shadcn` to devDependencies; pure `lib/` tests in Vitest's
      node environment; a real README.

## Security and privacy (`02-security-privacy.md`)

- [x] **SEC-03** An unticked checkbox on the confirm screen, required to start, saved with its
      time and wording version on the try-on, linking to the Privacy policy: "I agree that
      Kostuma sends my photos to its image service, YouCam (Perfect Corp.), which analyzes my
      face, skin tone and body only to make my pictures. Kostuma keeps them for up to 12
      months, or until I delete them; YouCam deletes its copies within 30 days." (A legal
      disclosure: the one place the interface names the service.) A Privacy section on face
      and body data: what, who, why, how long; never used to identify anyone, sold or used for
      training; deleting the photos withdraws consent.
- [x] **SEC-04** Account page: "Delete my photos and pictures" and "Delete my account", each
      behind a confirm pop-up (Storage `fitting-room/{uid}/`, the room and its try-ons, basket,
      waitlist entry, profile and feedback of that uid, then the Auth user). The free-costume
      facts (costume used, failed tries) move to their own document, which photo deletion and
      expiry never touch. Retention 12 months: the daily cron deletes older try-ons and photos.
- [x] **SEC-05** The legal pages say who runs Kostuma: "Kostuma is made and run by its
      developers, a small independent team (not a registered company)", contact: the support
      email; and "Kostuma is not affiliated with Perfect Corp. (YouCam), which provides its AI
      image service." The Privacy policy names the team as responsible for the information.
- [x] **SEC-06** Reject photos over 4096 px a side from metadata, before decoding;
      `limitInputPixels` 25 MP; `startTryOn` at most 10 an hour per account (`withinLimit`).
- [x] **SEC-09** reCAPTCHA's `hostname` must be Kostuma's (Google's test hostname only in test
      builds); waitlist entries record `emailVerified` (true only for the account's own
      verified email); the e2e session stand-in refuses to work unless `E2E=1` and off Vercel.
      Not done: the reset form's robot check (part of SEC-02), preview settings (ENG-10).

## Design and UX (`03-ui-ux.md`)

- [x] **UX-01** Below `sm`, the photo button sits under its mirror at full width; e2e: nothing past
      the gutter at 320 and 360 px, in en, es and zh.
- [x] **UX-02** On phones, tapping a strip frame scrolls the mirror into view (instantly with
      reduced motion).
- [x] **UX-03** A finished try-on's last frame offers "Start with step 1".
- [x] **UX-04** While the costume is free, the confirm screen adds: "This is your free costume.
      Once it's done, trying on another needs Kostuma Pro."
- [x] **UX-05** Basket: "Try on" in the foreground color, "Remove" muted.
- [x] **UX-06** "Choose your costume" gets the site's red link underline.
- [x] **UX-07** While a try-on runs, one line under the mirror: "This takes about two minutes. You
      can leave and come back."
- [x] **UX-08** "Step inside" filled; "Get Kostuma Pro" only once the free costume is used.
- [x] **UX-09** The used state's costume name links to its try-on.
- [x] **UX-10** The failure card says whether the free costume is still theirs and how many tries
      are left.
- [x] **UX-11** Product links search with the English product name, showing the translated one.
- [x] **UX-12** zh: `<wbr>` break points in display strings and `word-break: keep-all` on
      headings; a local CJK display font (Ma Shan Zheng, OFL) subset to the characters zh
      headings use, through `unicode-range`.
- [x] **UX-13** The pumpkin toggle is brighter at rest and shows its name ("Add to / Remove from
      My Pumpkin Basket") as a tooltip on hover and focus.
- [x] **UX-16** The basket badge off its label; "Press again to clear"; the outfit card shows the
      costume's Buy; the global 404 adds a "Costumes" link.

## Copy and content (`04-copy-content.md`), always in en, es and zh

- [x] **COPY-01** "Torn, bloodied wedding dress".
- [x] **COPY-02** "Try on the outfits in your basket, then see the character's makeup on your own
      face, step by step."
- [x] **COPY-03** One film-accurate outfit each for Hannibal, Grace and Pamela (checked), on the
      costume page and in the guide.
- [x] **COPY-04** Fix the listed facts; check each "verify" against a reliable source first.
- [x] **COPY-05** Ghostface loses the black nose (its step and its repeat in the lips step);
      Dracula keeps the fangs and his fun fact adds "Lugosi never bared fangs on screen"; Norman
      Bates' guide says in its first line that it makes you "Mother". A changed guide bumps
      `PIPELINE_VERSION`.
- [x] **COPY-06** The wording table.
- [x] **COPY-07** "axe"; ’70s and ’90s; typographic quotes and apostrophes in messages and content
      (update the tests that match text).
- [x] **COPY-08** Rephrase dated statements so they stay true.
- [ ] **COPY-09** "You're on the Kostuma Pro waitlist. We'll write to you at this email as soon as
      it opens."
- [ ] **COPY-10** "The darkest night is coming." and "The darkest night is here."
- [ ] **COPY-11** "…until Santa comes. Ho. Ho. Ho."
- [ ] **COPY-12** Before step 1: "Use cosmetic-grade products only, patch-test 24 hours before,
      and keep paint and fake blood out of your eyes."
- [ ] **COPY-13** The page titles and descriptions as suggested.
- [ ] **COPY-14** Owner: one native read of the Spanish and the Chinese (not code).
- [ ] **COPY-15** The listed voice tweaks (error, closed, the home's three lines).
- Keep "Pat": it is the correct makeup verb.

## Features (`06-missed-opportunities.md`)

- [ ] **OPP-11** "Save" on each picture: the same JPEG, unaltered, from the owner-only route with
      `?download=1` (`Content-Disposition: attachment`, `kostuma-<costume>-<step>.jpg`); on
      phones, the Web Share API with the file when available. Nothing published, nothing
      composited.
- [ ] **OPP-12** "What you need" before step 1: every product of the guide once, with its shop
      link; "about N minutes" (8 per step, rounded to 5); a print stylesheet for the guide.
- [ ] **OPP-03** YouCam AI Skin Tone Analysis measures the face photo's skin (once per photo, kept
      on it), falling back to today's measurement; the base step names the shade when the
      API gives one; its units count in ENG-02's budget; a fake in test builds; bump
      `PIPELINE_VERSION`. The calibration run spends units: the owner approves it first.
