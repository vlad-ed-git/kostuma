# Kostuma — Design Spec

Status: v2 (2026-09-30). Source of truth for how Kostuma looks, moves, reads and behaves.
Dark mode only.

v2 replaces v1's palette and fonts. The owner released the shadcn preset's colors and fonts
("you are absolutely free here"); the preset's **structure** stays: Base UI components, square
corners, uppercase tracked buttons, underline form fields, borderless text badges. Colors and
type now come from one period: horror cinema of 1978–1984, seen through modern restraint.

Scope of v1: the public site (home, costumes, costume pages, My Pumpkin Basket, feedback),
accounts (register, sign in, reset password, account) and polished "coming soon" pages for the
Fitting Room (virtual try-on, part of My Pumpkin Basket), terms and privacy. Every costume uses
one placeholder image until real photography exists.

---

## 1. Concept: The Midnight Picture House

Kostuma is a cinema that only opens at night. You walk in off the street, the lights go down,
the projector hums, and the cast of every horror film you ever loved is waiting to be worn.

### 1.1 The era: 1978–1984, on film

The birth of the slasher and the golden age of practical effects: _Halloween_, _Alien_, _The
Shining_, _The Thing_, _A Nightmare on Elm Street_. It is the source of most of the top 100, and
its one-sheet posters are the model for costume pages.

It is **film, not video**: warm projected blacks, film-stock whites, grain, the gate's faint
weave, light leaking at the edge of a reel. Two looks are ruled out on purpose:

- **Neon '80s / VHS / synthwave** — everywhere already, and it reads as a retro party theme, not
  dread. Video appears exactly once, as a joke on the 404 page (8.9).
- **Futuristic** — cold and clinical, the opposite of Halloween's handmade feel.

### 1.2 Vocabulary

| Cinema                           | Kostuma                                           |
| -------------------------------- | ------------------------------------------------- |
| Title card                       | Home hero ("The darkest day is coming.")          |
| Film leader countdown            | Countdown to Halloween                            |
| The cast                         | The collection: 100 characters, the owner's order |
| One-sheet poster + billing block | Costume page (image, name, credits)               |
| Behind the scenes                | Fun facts ("Behind the screams")                  |
| Wardrobe department notes        | "The look": what the costume needs                |
| Cue mark ("cigarette burn")      | Loading and page-change indicator                 |
| Reel change                      | Moving between pages                              |
| Wardrobe fitting                 | The Fitting Room: try on what's in your basket    |
| Coming soon trailer              | Features not open yet (Fitting Room, legal pages) |
| Admission ticket                 | The premium badge (paid try-ons)                  |
| End credits                      | Footer ("The end?")                               |

### 1.3 The flow (owner, 2026-09-30)

**Browse → My Pumpkin Basket → Fitting Room → Buy.**

1. **Browse** the costumes: the collection and each costume's page.
2. **Add** the ones you like to **My Pumpkin Basket**, the cart (no sign-in, kept on the
   device).
3. **Try them on** in the **Fitting Room**, which is part of the basket: it shows exactly the
   outfits in your basket (virtual try-on: sign in, 2 free try-ons, then {price} per costume).
   Coming soon.
4. **Buy**: an action on each outfit in the basket, opening its shop in a new tab.

Menus hold places, never actions: the header and the mobile menu offer Costumes and My Pumpkin
Basket, nothing else. The Fitting Room and Buy live inside the basket; a costume's page offers
"Add to My Pumpkin Basket".

### 1.4 Principles

1. **One period, modern manners.** The look is 1978–1984 film; the UX is today's: clean grids,
   readable forms, fast, accessible. The period lives in color, type, texture and pacing, never
   in how a control works.
2. **Dread through restraint.** Darkness, negative space, slow light. One scare per screen: each
   viewport gets at most one attention-grabbing effect; everything else is calm and typographic.
3. **Clarity beats spookiness where people act.** Forms, errors, buttons and prices are plain and
   instantly readable. Atmosphere lives around them, never on them.
4. **Color means something.** Arterial red = action or danger. Sodium orange = My Pumpkin
   Basket and Halloween itself. Black and bone = structure. Nothing is colored for decoration.
5. **Motion is slow and physical, and always optional.** Things fade up from black; nothing
   bounces. Every ambient effect switches off under `prefers-reduced-motion`.
6. **Every language is first-class.** No uppercase baked into copy, no fixed-width text boxes,
   CJK gets its own rhythm.
7. **Fast in the dark.** Text is the hero (fast LCP). Ambience is CSS on the compositor; JavaScript
   only for interaction.

---

## 2. Brand

### 2.1 Name and wordmark

- Name: **Kostuma** (never translated). Written `Kostuma` in running text.
- Wordmark: `KOSTUMA` in League Gothic, uppercase, tracking `0.32em`: widely spaced like a
  late-'70s one-sheet title. The **O is a solid disc** in `--blood`, the size of the cap height,
  with a soft red glow: a moon, a pupil, the projector's lamp. Reads as `K●STUMA`.
- Accessible name `Kostuma` (the letters are `aria-hidden`, the link has `aria-label`).
- Hover (fine pointer): the disc beats once (7.2 heartbeat) and its glow swells. Reduced motion:
  no beat.
- Favicon / app icon: the disc alone, `--blood` on `--background`, 12 % padding. Maskable variant
  with 20 % safe area.

### 2.2 Voice

Short. Ominous. Confident. Second person, present tense. A little wry, never cheesy.

- Wordplay at most once per page: "Behind the screams", "The night is young".
- Never a label that needs explaining. The owner dropped "New blood" (a badge for the
  2024–2026 breakouts) because it said nothing to them, and ranks ("No. 001") likewise.
- Actions and errors say **what happened and what to do**, in that order. Flavor, if any, comes
  after and is optional ("Wrong email or password." not "The spirits reject you.").
- Never gory in UI copy, never mocking victims, no ableist words ("insane", "psycho" as insults;
  film titles such as _Psycho_ are fine as titles).
- Sentence case in every message. Uppercase is applied by CSS only where the design calls for it,
  so translations never inherit forced caps.
- The brand name, character names and film titles are never translated by us (they come from the
  catalog, which may carry official localized titles later).

### 2.3 Legal lines (always in the footer)

- Content warning: "Horror imagery. Not intended for children."
- "Character names and film titles belong to their owners. Kostuma is not affiliated with any
  studio or retailer."
- © year Kostuma. No email address in the footer (owner's call): people reach Kostuma through
  the feedback form.

---

## 3. Color

One palette, defined once in `:root` (there is no light theme). `<html>` keeps the `dark` class
so the preset components' `dark:` variants apply.

### 3.1 Tokens

Blacks are warm, like a projected print, not the preset's cold zinc. Whites are film-stock bone.
Red is saturated arterial red, after Technicolor and Italian giallo posters. The only other hue
is sodium-streetlight orange.

| Token                                  | Value                 | Hex       | Use                                                             |
| -------------------------------------- | --------------------- | --------- | --------------------------------------------------------------- |
| `--background`                         | oklch(0.145 0.009 50) | `#0d0907` | Page. The dark of the house.                                    |
| `--card` / `--popover`                 | oklch(0.19 0.011 50)  | `#18120f` | Raised surfaces, menus.                                         |
| `--secondary` / `--muted` / `--accent` | oklch(0.245 0.013 50) | `#261f1b` | Hover fills, chips, skeletons.                                  |
| `--foreground`                         | oklch(0.935 0.022 85) | `#f0e9d9` | Bone. Primary text, icons.                                      |
| `--muted-foreground`                   | oklch(0.72 0.022 75)  | `#ada396` | Secondary text, metadata. A faded print.                        |
| `--primary`                            | oklch(0.5 0.195 27)   | `#b91319` | Arterial red. Primary buttons, selected states. **Never text.** |
| `--primary-foreground`                 | = `--foreground`      |           | Text on primary.                                                |
| `--blood`                              | oklch(0.58 0.22 28)   | `#df2321` | Wordmark disc, rim light, glows, REC dot. Never body text.      |
| `--blood-text`                         | oklch(0.665 0.2 27)   | `#f6544b` | Red text that must be readable.                                 |
| `--destructive`                        | oklch(0.73 0.16 24)   | `#fc7a75` | Error text and icons.                                           |
| `--ember`                              | oklch(0.77 0.155 62)  | `#f99b39` | Sodium orange: My Pumpkin Basket and Halloween touches only.    |
| `--border`                             | bone / 10 %           |           | Hairlines, dividers, card edges.                                |
| `--input` / `--field-border`           | bone / 45 %           |           | The underline of fields, checkbox and outline-button borders.   |
| `--ring` / `--focus`                   | = `--foreground`      |           | Focus indicators.                                               |
| `--chart-1…5`                          | red ramp 0.8 → 0.4 L  |           | Glows and light (and charts, if any).                           |

`--ember` may appear on: the pumpkin icon and basket count, the Halloween date above the
countdown, the Halloween-night state of the countdown, and inside light leaks (8.4). Nowhere else.

v1's `--premium` (red-300) is gone: the premium badge is built from `--foreground` and
`--blood-text` (10.1), so the palette stays two hues.

### 3.2 Contrast (measured, WCAG 2.2)

Measured by compositing each token over its surface in sRGB and applying the WCAG formula.

| Pair                                        | Ratio              | Verdict                                            |
| ------------------------------------------- | ------------------ | -------------------------------------------------- |
| foreground on background / card / muted     | 16.4 / 15.3 / 13.4 | Body text                                          |
| muted-foreground on background / card       | 8.0 / 7.4          | Secondary text                                     |
| muted-foreground on muted (hover fill)      | 6.6                | OK                                                 |
| `--blood-text` on background / card / muted | 5.9 / 5.5 / 4.9    | Red text OK (≥ 4.5)                                |
| `--destructive` on background / card        | 7.7 / 7.2          | Error text OK                                      |
| `--ember` on background / card              | 9.2 / 8.6          | OK                                                 |
| background on `--ember` (count badge)       | 9.2                | OK                                                 |
| foreground on `--primary` (button)          | 5.5                | OK                                                 |
| foreground on `--primary` at 80 % (hover)   | 7.2                | OK. Hover darkens; a lighter red would drop to 4.3 |
| **`--primary` as text on background**       | **3.0**            | **Never use as text.**                             |
| `--blood` as text on background             | 4.1                | Large display text only (≥ 24 px), else decorative |
| `--field-border` (bone 45 %) on background  | 3.9                | Passes 1.4.11 (≥ 3)                                |
| `--focus` on background / on primary        | 16.4 / 5.5         | Focus visible on every surface                     |

Rules:

- Red text is `--blood-text` or `--destructive`, never `--primary` or `--blood`.
- Hover on a filled red control darkens it (`bg-primary/80`); it never lightens.
- Borders that only decorate (cards, dividers) keep `--border` (10 %). Borders that identify a
  control (fields, checkboxes, outline buttons) use `--field-border`.
- Focus: `outline: 2px solid var(--focus); outline-offset: 2px` on every interactive element
  (`:focus-visible`), except underline fields, whose underline turns bone and doubles (10.1).

---

## 4. Typography

### 4.1 Families (`app/fonts.ts`, `next/font/google`, self-hosted)

The three faces share a lineage: the American gothics and typewriters of 1970s film marketing
and production paperwork.

| Role                                  | Family         | Variable                   | Why                                                                                                                                        |
| ------------------------------------- | -------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Titles (display, headings, numerals)  | League Gothic  | `--font-league-gothic`     | Tall condensed poster lettering (Alternate Gothic, 1903: the one-sheet gothic). Variable width 75–100.                                     |
| Billing block (credits)               | League Gothic  | same, `font-stretch: 75 %` | The same face at its narrowest: the tight credit block at a poster's foot. No extra download.                                              |
| Case-file labels, ranks, years, units | Courier Prime  | `--font-courier-prime`     | The screenplay Courier, redrawn for screens: every script and call sheet was typed in it. 400 + 700.                                       |
| Body and UI                           | Libre Franklin | `--font-libre-franklin`    | Franklin Gothic, the text face of '70s film ads and credits. Clean and readable. Variable weight.                                          |
| Chinese fallback                      | system CJK     | —                          | `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC"` appended to every stack. No CJK download. |

Tailwind names: `font-heading` (League Gothic), `font-sans` (Libre Franklin, the default),
`font-mono` (Courier Prime).

League Gothic has one weight. Headings use `font-normal`, and `font-synthesis: none` is set on
the document so no browser ever fakes a bold or italic.

### 4.2 Scale (fluid)

| Style                  | Family  | Size                        | Line height | Tracking | Weight | Case         |
| ---------------------- | ------- | --------------------------- | ----------- | -------- | ------ | ------------ |
| `display-xl` (home H1) | heading | clamp(3.75rem, 12vw, 11rem) | 0.86        | 0.005em  | 400    | upper        |
| `display` (page H1)    | heading | clamp(3rem, 8vw, 6.5rem)    | 0.9         | 0.01em   | 400    | upper        |
| `h2` (section)         | heading | clamp(2.25rem, 5vw, 4rem)   | 0.95        | 0.01em   | 400    | upper        |
| `h3` (card/name)       | heading | 1.625rem                    | 1           | 0.02em   | 400    | upper        |
| `billing`              | heading | 1.125rem, `font-stretch` 75 | 1.15        | 0.04em   | 400    | upper        |
| `lead`                 | sans    | 1.1875rem                   | 1.6         | 0        | 400    | sentence     |
| `body-lg` (lore)       | sans    | 1.0625rem                   | 1.75        | 0        | 400    | sentence     |
| `body`                 | sans    | 1rem                        | 1.6         | 0        | 400    | sentence     |
| `small`                | sans    | 0.875rem                    | 1.5         | 0        | 400    | sentence     |
| `label`                | mono    | 0.8125rem                   | 1.4         | 0.08em   | 400    | upper        |
| `micro`                | mono    | 0.75rem                     | 1.4         | 0.1em    | 700    | upper        |
| `numeral` (countdown)  | heading | clamp(3rem, 9vw, 7rem)      | 1           | 0        | 400    | tabular-nums |

Courier is monospaced and already wide, so it needs far less tracking than v1's Geist Mono.
`micro` uses Courier's bold so its thin strokes hold up at 12 px on black.

### 4.3 Rules

- Measure: body text 60–70ch; lore ≤ 65ch.
- Numbers that change (countdown, counts) use `tabular-nums` and fixed-width cells: no jitter.
- Uppercase only through CSS (`uppercase` utility) on headings, labels and buttons.
- `:lang(zh-Hans)`: `letter-spacing: normal` on everything (tracking utilities neutralized),
  headings weight 600 (system CJK fonts have real weights) and line-height +0.15, body
  line-height 1.8, no italics.
- Spanish runs ~25 % longer than English: no fixed widths on text containers or buttons; buttons
  may wrap to two lines on narrow screens rather than truncate. The condensed display face keeps
  long Spanish titles on screen.
- Never truncate names or titles with ellipsis on detail pages; cards may clamp to 2 lines.

---

## 5. Layout

- Breakpoints (Tailwind defaults): `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- Container: `max-w-7xl` (80rem), padding-x 16 px / 24 px (`sm`) / 32 px (`lg`). No horizontal
  scroll at 320 px.
- Grid: 4 columns (mobile), 8 (`md`), 12 (`lg`), gap 16 / 24 / 32 px.
- Vertical rhythm: sections `py-[clamp(4rem,10vw,9rem)]`; stacks use multiples of 4 px
  (8, 12, 16, 24, 32, 48, 64).
- Header height 64 px; sticky toolbars sit below it (`top-16`).
- Z-index scale: content 0 · sticky toolbar 30 · header 40 · menus/overlays 50 · atmosphere
  (grain, vignette, leaks) 60, `pointer-events: none` · cue mark 65 · toasts 70 · skip link 80.

---

## 6. Shape, surface, texture

- **Square corners everywhere** (`rounded-none`), as the preset's components do. The one
  exception: circles that are circles (the wordmark disc, the cue mark, the countdown's leader
  ring, avatar disc).
- Hairlines: 1 px `--border`. Sections are separated by space first, a hairline second.
- Elevation is light, not shadow: raised surfaces are `--card`; focus and hover add a faint red
  inner glow (`box-shadow: inset 0 -40px 60px -40px color-mix(in oklch, var(--blood) 35%,
transparent)`), never drop shadows.
- Texture is **film**, and comes from the atmosphere layers (8), not from surfaces: grain, the
  gate's weave on title cards, occasional light leaks, scratches only while a reel changes.

---

## 7. Motion

### 7.1 Tokens

| Token                | Value                          | Use                                                   |
| -------------------- | ------------------------------ | ----------------------------------------------------- |
| `--ease-dread`       | cubic-bezier(0.16, 1, 0.3, 1)  | Fades up from black, reveals (fast start, long tail). |
| `--ease-heavy`       | cubic-bezier(0.65, 0, 0.35, 1) | Toggles, overlays, the heartbeat, the reel change.    |
| `--duration-fast`    | 150 ms                         | Color and opacity on hover/press.                     |
| `--duration-base`    | 300 ms                         | Small state changes, menus.                           |
| `--duration-slow`    | 700 ms                         | Reveals.                                              |
| `--duration-glacial` | 1200 ms                        | Image drift on hover.                                 |
| Frame                | 1000 / 24 ≈ 42 ms              | Film-rate steps (grain, weave, cue mark).             |
| Stagger              | 60 ms, max 12 items            | Grids and lists.                                      |

### 7.2 Patterns

- **Fade up from black (reveal):** opacity 0 → 1, `translateY(12px)` → 0, `--ease-dread`, as
  the element scrolls into view. CSS only (the `reveal` class: a scroll-driven animation,
  `animation-timeline: view()`), so it needs no JavaScript and content is never stuck invisible;
  browsers without scroll-driven animations show it at once. Never on the LCP element.
- **Title-card cut:** page titles (`display`) never fade; they are there on the first frame, like
  a title card cut in. On the home hero and the 404 the title card also carries the gate weave
  (8.3).
- **Reel change (between pages):** the old page fades to black (180 ms, `--ease-heavy`), holds
  black for one beat (60 ms), and the new page fades up (320 ms, `--ease-dread`). Two or three
  scratches flicker down the frame while it runs (8.5). The header does not move. Implemented
  with React's `<ViewTransition>` in `app/[locale]/template.tsx` (a Server Component: Next 16.3
  serves the chunk of a Client Component imported there without the CSP nonce); browsers without
  the View Transitions API swap instantly.
- **Cue mark (loading):** the cigarette burn (10.2) appears top right when the next page takes
  longer than 150 ms, and stays until it arrives. Fast navigations never show it. Like a real cue
  mark it shows on the _current_ reel, before the change: every app `Link` (i18n/navigation)
  reports its pending state (`useLinkStatus`), and the language switch reports its transition.
  Not a `loading.tsx` fallback: streamed fallbacks need JavaScript to be replaced, which would
  break reading without it.
- **Press:** buttons `translateY(1px)` (preset) and 150 ms color.
- **Card hover (fine pointer):** image `scale(1.05)` over 1200 ms; red rim light rises from the
  bottom (opacity 0 → 1, 300 ms); a 1 px red line draws under the name (`scaleX` 0 → 1 from the
  left, 400 ms).
- **Heartbeat:** scale 1 → 1.18 → 1 → 1.08 → 1 over 1000 ms (lub-dub), used only by the wordmark
  disc on hover and the lit pumpkin when an item is added.
- **Ignite (basket add):** pumpkin goes from outline to ember fill with a 600 ms flicker (opacity
  0.4 → 1 → 0.7 → 1) and the count rolls up (old number slides up and out, new one in).
- **Overlay (mobile menu):** backdrop fades in 300 ms; items fade up with 60 ms stagger; closing
  is a 200 ms fade, no stagger.

### 7.3 Reduced motion and photosensitivity

Under `prefers-reduced-motion: reduce`:

- Reveals are off: content is simply there.
- The reel change becomes an instant cut; no scratches.
- Ambient loops stop: grain frozen, no gate weave, no light leaks, fog still, no projector
  flicker, no leader sweep, no drip, no VHS roll. The cue mark shows steadily instead of blinking.
- The flashlight effect is replaced by a static, faint reveal.
- Hover zooms are removed; color changes stay.

Always, regardless of settings: no element flashes more than 3 times per second; flicker
changes opacity by at most 10 % of the layer and never involves saturated red fields larger than
a card (WCAG 2.3.1, red-flash threshold). The cue mark is small (≤ 32 px) and blinks at 1 Hz.

---

## 8. Atmosphere layers

Fixed, full-viewport, `pointer-events: none`, `aria-hidden`. Global ones render once in the root
layout; the rest belong to the section that owns them. No `mix-blend-mode` on full-screen layers
(it forces expensive repaints).

1. **Grain (global).** An SVG `feTurbulence` tile (data URI, `baseFrequency 0.8`, 4 octaves,
   grayscale) on a pseudo-element 200 % of the viewport, opacity 0.07. It jumps to a new offset
   every other frame (`steps` timing, 8 positions over 330 ms): film grain, not TV static. Frozen
   under reduced motion.
2. **Vignette (global).** `radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0 / 0.6)
100%)`: the falloff of a projector lamp. Behind the content, so it never dims text.
3. **Gate weave (title cards only: home hero, 404).** The title block drifts by at most 0.6 px
   on a 12 fps stepped loop, like a print weaving in the projector gate. Never on body text,
   forms or anything a person reads for more than a glance.
4. **Light leak (global, occasional).** A warm bloom (`--ember` into `--blood`, radial) swells
   at one edge of the frame to at most 10 % opacity over 2 s, holds, and fades over 3 s, about
   once every 30 s (two leaks on 29 s and 41 s cycles, so it never feels regular). Behind the
   content. Opacity only.
5. **Scratches (reel changes only).** Two or three 1 px vertical lines in bone at 25 % that jump
   position every frame for the 450 ms of a page change, then vanish. Never at rest: the layer
   is always there but only animates while a view transition runs (`html:active-view-transition`).
6. **Projector beam (home hero only).** A soft bone-white cone from the top center at 8 %
   opacity with a red underglow, flickering irregularly by at most 3 % (lamp flicker, never a
   strobe).
7. **Fog (home hero, 404 and, upside down, footer).** Two or three blurred ellipses (warm grey
   at 6 %, `--primary` at 10 %, `filter: blur(60px)`), drifting horizontally 40–90 s,
   alternate. Behind all content (`z-index: -1`) and never clipped by its section: the glow
   spills past the section's edge and fades out there, so no line ever marks where one
   section ends and the next begins (owner, 2026-09-30). Clipped sideways only, so the page
   never scrolls sideways.
8. **Flashlight (home hero only).** A hidden layer with a giant outline phrase (message
   `Home.hidden`, e.g. "We all wear masks") revealed through a 260 px radial mask that follows the
   pointer (`--x`/`--y` CSS vars updated in `requestAnimationFrame`). On touch / no hover the
   mask drifts slowly on its own (Lissajous path, 20 s). Reduced motion: the phrase sits static at
   5 % opacity, no mask. Decorative and `aria-hidden`.
9. **VHS tracking (404 only).** The one place video appears: the tape ran out. A band of
   horizontal noise rolls up the screen once every ~7 s (1.2 s roll, 15 % opacity) and the `404`
   splits into a red and a bone ghost offset by 2 px. Static under reduced motion.

---

## 9. Iconography and imagery

### 9.1 Icons

- Remixicon line set (`@remixicon/react`), 16 / 20 / 24 px, `currentColor`.
- Custom **pumpkin** (basket) on the same 24 grid, 1.75 px stroke to match Remix:
  - Empty basket: outline pumpkin, `--muted-foreground`.
  - Items saved: ember-filled pumpkin with a carved face (two triangle eyes, a jagged mouth) cut
    out so the background shows through, and an ember glow. The jack-o'-lantern is lit because
    something is inside.
- Icons never carry meaning alone: they pair with text or an `aria-label`.

### 9.2 The placeholder image (v1: one image for every costume)

- File: `public/images/costume-placeholder.webp` (+ `.avif`), 1200 × 1500 (4:5), generated
  from an SVG source (`design/costume-placeholder.svg`) with sharp.
- Art direction: a dark room in warm black. A tall, anonymous hooded figure, faceless, stands
  center, lit from behind by an arterial-red rim light that spills onto floor fog; a faint
  sodium-orange glow from off-frame, like a streetlight through a window. Film grain. No text,
  no character features: _the costume is waiting for whoever wears it_. Works under a bottom
  gradient that carries the card's text.
- Alt policy: while it's a placeholder, the image is decorative (`alt=""`); the character's name
  is always in text next to it. Real photos later get `alt="{Character} costume"`.
- OG images are generated (next/og) in the same language: warm black, red rim glow, name in
  League Gothic, film in muted Courier, wordmark bottom-left. No rank. 1200 × 630.

---

## 10. Components

Client components are marked (C). Everything else renders on the server.

### 10.1 Primitives (preset structure, film palette)

- **Button** (preset cva): variants `default` (arterial red, bone text, hover darkens to 80 %),
  `outline` (`--field-border`), `secondary`, `ghost`, `link` (`--blood-text`), `destructive`.
  Sizes preset. Focus: the global outline (3.2). Loading state: spinner (Remix `loader-4-line`,
  spin 800 ms linear) replaces the leading icon, label switches to the "…ing" message,
  `aria-busy`. Preset heights (default 40 px); header, menu and other touch-first controls use
  `lg` / `icon-lg` (44 px). Links styled as buttons use `buttonVariants` on the
  link itself.
- **Badge** (preset: borderless, uppercase, 10 px, tracking-widest). Kostuma variants add a 1 px
  border and 2 × 6 px padding so they read as stamped labels:
  - `soon` — border bone/20, text muted: "Soon".
  - `premium` — border `--blood-text` at 50 %, text `--foreground`, ticket icon
    (`ticket-2-line`) in `--blood-text`: "Premium". An admission ticket.

  - `count` — `--ember` fill, `--background` text, no border, tabular numbers (basket count).
- **Field** (preset `field.tsx`: Field, FieldLabel, FieldDescription, FieldError with
  `role="alert"`, FieldGroup, FieldSet, FieldSeparator). Label is the preset's uppercase
  `text-xs` semibold, always visible above the control; description muted `small`; error
  `--destructive` `small`, linked by `aria-describedby`, control gets `aria-invalid`.
- **Input / Textarea** (preset underline fields): transparent, no box, a 1 px underline in
  `--field-border`, 40 px tall (44 px hit area with the label), no side padding. Hover: underline
  at bone 70 %. Focus: underline turns bone and doubles to 2 px (inset shadow, no layout shift);
  no outline box. Invalid: underline `--destructive`. Textarea grows with content
  (`field-sizing: content`) and shows a live character count `n / max` (mono micro).
- **Password input** (C): input + show/hide toggle button (eye icons, `aria-pressed`, label
  "Show password"/"Hide password").
- **Checkbox**: 18 px square, `--field-border`, checked = arterial fill + bone check, focus =
  global outline; label to the right, clickable.
- **Segmented control** (C): radio group rendered as joined square tabs; selected = `--muted`
  fill + 2 px `--blood` bottom bar; arrow keys move selection.
- **Language menu** (C, header, from `lg`): globe + current endonym + chevron opens a Base UI
  Menu: a `--card` panel with a hairline border, a Courier "Language" label, then every language
  as a link to this same page in that language (`hreflang`, `lang`), the current one checked in
  `--blood-text`. The highlighted row gets `--muted` and a 2 px `--blood` bar at its edge, like a
  splice mark. Accessible name "Language: English" (a message). Arrow keys, type-ahead, Escape.
- **Language links** (C, footer and mobile menu): the same links inline, uppercase, the current
  one underlined in `--blood`. No popup, and they work without JavaScript.
- **FormAlert**: whole-form message, `role="alert"`, 1 px destructive border at 40 %, destructive
  text, alert icon. Success variant: foreground text, check icon, border bone/20.
- **Skeleton**: `--muted` blocks with a slow sheen (1.6 s); static under reduced motion.

### 10.2 Brand and shell

- **Wordmark** (2.1).
- **Header** (server; the mobile menu is the only client part, the scroll state is CSS):
  - Wordmark → home, then the main nav: the two places of the flow (1.3). Costumes (from `lg`;
    the home page's costumes section, `/#costumes`, 11.1) and, pushed right, My Pumpkin Basket: the pumpkin plus its name from `lg`, the icon alone
    below (the name kept for screen readers), with the `count` badge once the basket works
    ("My Pumpkin Basket, 3 costumes"). Places only, never actions.
  - Then the language menu and the account: "Sign in" (ghost) or a square avatar with initials → menu (Account,
    Sign out).
  - Transparent over a title card (any page with `[data-title-card]`: the home hero, the 404);
    after 24 px of scroll (and on every other page) it becomes `--background` at 80 % +
    `backdrop-blur-md` + bottom hairline. A scroll-driven animation; browsers without one keep
    it solid.
  - Below `lg` (1024 px): wordmark, basket icon, menu button. Menu = full-screen overlay
    (`--background` 96 %), big `h2` links (Costumes, My Pumpkin Basket) with stagger, language
    links and account actions at the bottom. Focus trapped,
    Escape closes, focus returns to the menu button, body scroll locked.
  - Anchored during reel changes (`view-transition-name: site-header`).
- **Skip link**: first focusable, "Skip to content", visible on focus, jumps to `<main id>`.
- **Cue mark** (the "cigarette burn"): a 28 px circle 24 px from the top-right corner, below the
  header. Bone center fading to a ragged, burnt ember edge with a soft glow, as if scratched
  through the emulsion. Blinks like a real cue: 4 frames on (~170 ms), then off, once per
  second, while loading. The mark itself is `aria-hidden`; a visually hidden status message says
  "Loading…" only once the wait passes 1 s (quick pages stay quiet). Reduced motion: steady, no
  blink.
- **Footer**:
  - Sign-off line in `display` size, outline text (1 px `--muted-foreground` stroke, transparent
    fill; fills to bone on hover): "The end?", the last card of a horror film, where the question
    mark promises the monster will be back. Under it, in Courier `label`, the line that lands the
    joke: "Every monster comes back. See you next Halloween."
  - Columns: Explore (Costumes, My Pumpkin Basket), Help (Report a bug, Share
    feedback, Request a feature), Fine print (Terms `soon`, Privacy `soon`).
  - Language links. Legal lines (2.3). No top border: the fog layer is flipped upside down, so
    it and its red glow hang from the top and the page runs into the credits.

- **Breadcrumb**: Courier `label`, `/` separators, current page `aria-current="page"`.

### 10.3 Feature components

- **Countdown** (C): see 11.1.
- **CostumeCard**:
  - `article` with a stretched link (the name link's `::after` covers the card) so the whole card
    is clickable without nesting interactive elements.
  - 4:5 image, bottom gradient (`--background` → transparent, 55 % height).
  - Top-right: basket toggle (C, feat/basket) above the stretched link (`z-10`), 40 × 40 with a
    44 px hit area, `aria-pressed`, label "Add {name} to My Pumpkin Basket" / "Remove {name}
    from My Pumpkin Basket".
  - Bottom: name (`h2` in a grid of the page, `h3` under a section heading; 2-line clamp), film
    \+ year (Courier micro, muted; "Pearl (2022) / X (2022)" for several). Nothing else: no
    rank, no badge.
  - Hover/focus-within motion per 7.2. The link prefetches on intent only (15).
- **Basket toggle** (C): outline pumpkin ↔ lit pumpkin, ignite animation on add; announces
  "Added to My Pumpkin Basket" / "Removed from My Pumpkin Basket" through a polite live region.

- **Billing block**: the credits of a costume page, set like the credit block at the foot of a
  one-sheet: centered, League Gothic at 75 % width (`billing`), muted, role words small and names
  tall ("Created by", "Brought to life by"). A role with no names is left out.
- **Wardrobe list** ("The look"): the catalog's look text split into items, each with a thin
  square bullet, `body`. Reads as a wardrobe department checklist.
- **Buy** (in the basket only, 1.3): opens the outfit's shop in a new tab, with an
  `arrow-right-up-line` icon and sr-only "(opens in a new tab)"; `target="_blank"`
  `rel="noopener noreferrer nofollow"` (+ `sponsored` when a link is an affiliate link). With
  several shops, a styled menu of them.
- **Empty state**: centered icon (64 px, muted), `h3`, one line of copy, one action.
- **Coming soon panel**: see 11.9.
- **Premium price line**: "2 free try-ons in the Fitting Room. Then {price} per costume."
  `{price}` is USD 5,
  formatted by the locale's currency formatter (next-intl `format.number(5, {style: "currency",
currency: "USD"})`), never a hardcoded "$5" string.

---

## 11. Pages

All pages: header, `<main id="content">`, footer, atmosphere layers. Titles through
`generateMetadata` (`%s · Kostuma`). Auth/account/coming-soon/legal-soon pages are `noindex`.

### 11.1 Home `/`

1. **Hero (title card)** — min-height `88svh` (max 60rem), content bottom-left aligned on desktop,
   centered on mobile. Projector beam + fog + flashlight layer; the title block carries the gate
   weave.
   - Overline (`label`, `--ember`): "Halloween · {Saturday, October 31}" (date formatted per
     locale).
   - H1 `display-xl`: "The darkest day is coming." (message `App.taglineLead`).
   - Line 2 `h2` in `--blood-text`: "Transform into a monster." (`App.taglineTail`).
   - **Countdown** (film leader): four cells, Days · Hours · Minutes · Seconds, `numeral` digits
     over `micro` unit labels, separated by vertical hairlines. The seconds cell sits inside a
     thin circle with a conic red sweep that turns once per second, the film-leader nod. Server
     renders `--` placeholders at final size (no layout shift); the client fills in the visitor's
     local time. Targets the next Oct 31 at 00:00 local; on Oct 31 it shows "Tonight." in
     `display` `--ember` and "The darkest day is here."; after Halloween it counts to next year.
     `role="timer"`, `aria-live="off"`, and a visually hidden sentence updated once per minute
     for screen readers ("31 days, 4 hours until Halloween").
   - Action: primary "Browse the costumes" → the costumes below (`/#costumes`).
   - Scroll cue: Courier micro "Scroll" above a 48 px line that drips downward (2.4 s loop;
     hidden under reduced motion).
     The hero stands a little short of the screen (`88svh`) so the first costumes peek below it.
     What exists today: H1, line 2 and fog; the rest of the title card comes with
     `feat/landing`.
2. **The costumes** (`<section id="costumes" aria-label="Costumes">`) — right below the title
   card, all 100 cards in the owner's order (2 / 3 / 4 columns), server-rendered and
   crawlable. No heading, intro, overline, count or footnote on screen, no search, filters or
   sort (owner, 2026-09-30: "only 100 products, let users browse"; "a new page adds
   friction"). Every "Costumes" link (header, menu, footer, breadcrumb) leads here:
   `/#costumes`, `/es#costumes`; the section keeps `scroll-margin-top` for the header.

Anything more on the home page (how it works, a Fitting Room teaser, a final call) is planned
with the owner before `feat/landing` (the owner likes the placeholder's window lit by a sodium
streetlight for the hero).

### 11.2 No `/costumes` page

The costumes live on the home page (11.1). There is no collection page, so there is no page
title, toolbar or empty state for one.

### 11.3 Costume `/costumes/[slug]` — the one-sheet

- Breadcrumb Costumes (→ `/#costumes`) / {name}.
- Desktop two columns (5 / 7): left sticky image (4:5); right content. Mobile: image then
  content. No rank anywhere.
- Content, in order:
  - H1 `display`: the character.
  - Film line: film icon + "Scream (1996)" (lead, muted).
  - Action: one primary button, "Add to My Pumpkin Basket" (in the basket: "In My Pumpkin
    Basket", with a link to it). No try-on and no shop here (1.3): both live in the basket.
    Comes with `feat/basket`.
  - **The lore** (`label` + `body-lg`).
  - **The look** (wardrobe list).
  - **Behind the screams** (fun fact, `body`, inside a left hairline in `--blood`).
  - **Credits** (billing block).
- Previous / next in the owner's order, by name only ("← Previous" over {name} / "Next →" over
  {name}); none before the first costume or after the last.
- "More from {film}" when the film has other characters, else "More costumes": the next 4,
  wrapping past the last to the first.
- An unknown slug is a 404.

### 11.4 My Pumpkin Basket `/basket`

- H1 "My Pumpkin Basket", count, note "Kept on this device." (muted small).
- **The Fitting Room** panel (part of the basket, 1.3): `h2` "The Fitting Room" + `soon` +
  `premium`, one line ("Try on the outfits in your basket, special-effects makeup included."),
  price line, link "Step inside" → `/basket/fitting-room` (coming soon).
- Rows: thumbnail (4:5, 72 px wide), name + film, actions: **Buy** (primary, 10.3), "Try on"
  (→ `/basket/fitting-room?costume={slug}`, `soon`), "Remove" (ghost, icon). "Clear basket" asks for a second click ("Click again to clear") within
  4 s.
- Empty: unlit pumpkin, "Your basket is empty.", "The night is young.", button "Browse costumes".
- Server renders a skeleton; the client reads storage after mount (no hydration mismatch).

### 11.5 Sign in `/sign-in`, Register `/register`, Reset password `/reset-password`

- Desktop split: left 5 columns atmospheric panel (fog, grain, `display` line "Who will you
  become?" in outline text), right 7 columns with the form column (max 400 px). Mobile: form only,
  small wordmark above.
- **Sign in:** "Continue with Google" button (Google's dark variant: fill `#131314`, 1 px border
  `#8E918F`, text `#E3E3E3`, the multicolor G logo, "Continue with Google"), divider "or", email,
  password (show/hide), "Forgot your password?" link, submit "Sign in". Footer link "New here?
  Create an account".
- **Register:** Google button, divider, name, email, password (hint: at least 8 characters),
  confirm password, checkbox "I am 17 or older", reCAPTCHA (dark, 304 × 78 reserved), submit
  "Create account". Footer link "Already have an account? Sign in".
- **Reset:** email + submit "Send reset link"; always answers "If an account uses that email, a
  reset link is on its way." (never reveals whether an account exists).
- Errors: field errors under fields; form errors in a FormAlert; all from translated codes.
- Pending: fieldset disabled, button spinner + "Signing in…" / "Creating account…" /
  "Sending…".

### 11.6 Account `/account`

- H1 "Your account". Profile block: name, email (Courier), member since.
- "The Fitting Room" block: "2 free try-ons waiting" + `soon` + price line.
- Sign out (outline button). Signed-out visitors are redirected to sign in (with `next`).

### 11.7 Feedback `/feedback` (`?type=bug|feedback|feature`)

- H1 "Tell us what haunts you" (lead: "Found a bug, have an idea, or want a feature? We read
  every message.").
- Segmented control: Report a bug · Share feedback · Request a feature (preselected by `type`).
- Message textarea (label changes with type; 10–2000 characters, counter), optional email ("Only
  if you want a reply"), reCAPTCHA, submit "Send".
- Success replaces the form: check icon, "Received.", "Thank you. We read every message.",
  button "Send another".

### 11.8 Not found

Centered title card with the VHS tracking layer (8.9): "404" in League Gothic at `h2` size, split
into its red and bone ghosts,
`display` "Lost in the dark", one line, button "Back to Kostuma". Both 404s (the in-app one and
the global one for unmatched URLs) look the same; the global one has no header.

### 11.9 Coming soon pages

Shared panel ("trailer"): `label` with a blinking red REC dot (1 Hz, static under reduced
motion) "Coming soon"; `display` title; lead; up to 3 feature bullets; primary action back to
something that works now; secondary "Want it sooner? Tell us." → `/feedback?type=feature`.

| Route                  | Title            | Content                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/basket/fitting-room` | The Fitting Room | Part of the basket: what it does (one full-body photo + one face close-up → you in each outfit from your basket, special-effects makeup included), the outfits in your basket (or a nudge to fill it), `premium` badge, price line, privacy note ("Your photos stay private."), CTA back to My Pumpkin Basket. Accepts `?costume=`. |
| `/terms`               | Terms of service | "The fine print is being written." + a link to the feedback form. `noindex`.                                                                                                                                                                                                                                                        |
| `/privacy`             | Privacy policy   | Same pattern; states plainly what is stored today (account email and name, feedback messages) + a link to the feedback form. `noindex`.                                                                                                                                                                                             |

---

## 12. Patterns

- **Naming**: the wishlist is **My Pumpkin Basket**, a proper name used the same way everywhere
  (link text, page title, toggle labels, announcements), like "My List" on a streaming service.
- **Dropdowns**: never the browser's native popup, which breaks the look (owner's call). Menus
  and selects are Base UI components styled like the language menu (10.1).
- **Premium**: any paid capability shows the `premium` badge next to its first mention on a
  screen, and the price line near its call to action. Never hide the price.
- **Coming soon**: never a disabled button (unfocusable, unexplained). Use a working link to the
  coming-soon page with a `soon` badge.
- **External links**: new tab, `noopener noreferrer`, icon + sr-only "(opens in a new tab)".
- **Loading**: the cue mark for pages, skeletons for content, spinners only inside buttons. No
  full-page spinners.
- **Errors**: say what happened and what to do; keep the user's input; focus moves to the first
  invalid field (or the form alert) after submit.
- **Live regions**: basket changes announce politely; form alerts assertively.
- **Prefetching**: default Next.js prefetching for single links; lists of many links prefetch
  on intent only (15). Language links never prefetch: where they land depends on the language
  cookie, which the click itself changes, so an answer fetched before the click is wrong
  (found by e2e: "English" sent the visitor back to Spanish).

---

## 13. Accessibility checklist (WCAG 2.2 AA)

- Contrast per 3.2; focus visible everywhere (`--focus`, 2 px, offset 2 px; underline fields per
  10.1).
- Targets: 44 × 44 px for navigation and primary touch controls; never below 24 × 24 px
  (WCAG 2.5.8). Small controls get an invisible padded hit area (the preset checkbox does).
- Landmarks (`header`, `nav` with labels, `main`, `footer`), one H1 per page, ordered headings.
- Skip link; logical tab order; mobile menu traps focus and restores it.
- Forms: visible labels, `autocomplete` (`name`, `email`, `current-password`, `new-password`),
  errors linked, no placeholder-only labels.
- Motion and flashing per 7.3.
- `lang` on `<html>` (`en`, `es`, `zh-Hans`) and on endonyms in the language list.
- Decorative images and atmosphere `aria-hidden` / `alt=""`.
- Content works without JavaScript for reading (catalog, costume pages); interactive features
  degrade to links. Reveals must never leave content invisible when JavaScript is off.

---

## 14. Internationalization

- Every visible string is a message (`messages/en.json` first; `es`, `zh` fall back to English
  until translated).
- Dates, numbers, currency via next-intl formatters (countdown date, counts, price).
- Messages in sentence case; CSS applies uppercase.
- Endonyms in the language menu and links: English · Español · 中文, each with its own `lang`
  and `hreflang`.
- Test layouts with the longest language (Spanish) and with CJK line breaking (Chinese).

---

## 15. Performance budgets

| Metric              | Budget                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| LCP (4G, mid phone) | ≤ 2.0 s; the home LCP is the H1 text, visible from first paint (never starts at opacity 0)              |
| CLS                 | ≤ 0.02 (reserved sizes for countdown, reCAPTCHA, images)                                                |
| INP                 | ≤ 200 ms                                                                                                |
| JS per route        | ≤ 120 KB gz shared + ≤ 40 KB route                                                                      |
| Fonts               | 3 families (2 variable + Courier 400/700), Latin subset preloaded, `display: swap`; CJK from the system |

- Ambient effects: CSS, `transform`/`opacity` only, no `mix-blend-mode` on full-screen layers.
- `motion` only where CSS can't do the job (first use: the basket count's roll), in client
  islands, through `LazyMotion` + `domAnimation` + `m.*`. Reveals, the menu's stagger, the
  header over the hero and every atmosphere layer are CSS.
- Images: `next/image`, explicit `sizes`, `priority` only on the costume page image.
- Prefetching: every page renders per request (the CSP nonce), so each prefetch costs the
  server a render. Long lists of links prefetch on intent only (hover, focus, touch:
  `components/navigation/intent-link.tsx`); scrolling the 100 cards used to fire ~150
  prefetches (measured). Language links never prefetch (12, Prefetching).

---

## 16. Implementation map

| Piece                    | Where                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Tokens (palette, motion) | `app/globals.css` `:root` + `@theme inline`                                                               |
| Fonts                    | `app/fonts.ts`                                                                                            |
| Atmosphere               | `components/horror/{atmosphere,fog}.tsx` + `app/film.css` (grain, vignette, leaks, scratches, weave, VHS) |
| Reel change              | `app/[locale]/template.tsx` (`<ViewTransition>`), `::view-transition` rules in `app/film.css`             |
| Cue mark                 | `components/horror/cue-mark.tsx`, fed by `lib/navigation-status.ts` from `i18n/navigation.tsx`            |
| Shell                    | `components/layout/{header,mobile-menu,footer,wordmark,skip-link,lost-in-the-dark}.tsx`                   |
| Primitives               | `components/ui/*` (shadcn style, cva)                                                                     |
| Feature components       | `components/{costume,basket,auth,forms,countdown}/*`                                                      |
| Catalog                  | `content/costumes.ts` (the owner's list, typed) → `lib/catalog` → `components/costume/*`                  |
| Links on intent          | `components/navigation/intent-link.tsx` (the costume cards)                                               |
| Placeholder art          | `design/costume-placeholder.svg` → `public/images/costume-placeholder.{avif,webp}`                        |
| Visual review            | Playwright screenshots at 375, 768, 1280 px for every page, checked before each commit                    |

---

## 17. Edge cases (tested with each feature)

Each feature branch ships unit and end-to-end tests for the cases that apply to it:

- **Countdown:** time zones east and west of UTC; daylight-saving changes before Oct 31;
  Halloween day itself ("Tonight."); the rollover after Halloween to next year; a visitor whose
  clock is wrong; the server-rendered placeholder before hydration.
- **Languages:** the longest strings (Spanish) at 320 px; Chinese line breaking and fallback
  fonts; dates, numbers and currency formatted per locale; untranslated keys falling back to
  English.
- **Storage (basket):** absent, corrupted, oversized or outdated data in `localStorage`; storage
  that throws (private mode, blocked); changes from another tab; costumes that no longer exist.
- **Motion and no-JS:** reduced motion turns every loop and transition off; every page reads
  without JavaScript (no content stuck invisible).
- **Network and services:** slow networks (the cue mark, skeletons); reCAPTCHA failing to load
  or expiring; every Firebase Auth error code mapped to a translated message; rate limits.
- **Content states:** empty basket; unknown costume slugs, including a wrong case (404); the
  first and last costume (no previous / next, related wraps around); a character in several
  films; a credit role with no names; 1 item vs many (plurals).
- **Server cost:** scrolling the costumes prefetches nothing, hovering a card prefetches it;
  language links never prefetch; no section clips its fog; nothing scrolls sideways.

---

## 18. Later

Real costume photography (per-costume art direction) · The Fitting Room flow (upload guide, progress
as a "developing film" animation, result reveal) · Stripe checkout styled as a ticket stub ·
translations · optional opt-in ambient sound: projector whir (never autoplay) · shared-element
morphs between cards and costume pages.
