# Kostuma — Design Spec

Status: 2026-10-01. Source of truth for how Kostuma looks, moves, reads and behaves. Dark mode
only. The owner approved this design as a live prototype
(https://claude.ai/artifact/1cjyDUCzhrvimjhPgLQ9AG) before it was built. The shadcn preset's
**structure** stays: Base UI components, square corners, underline form fields, borderless text
badges.

Scope: the public site (home with the costumes, costume pages, My Pumpkin Basket, feedback),
accounts (register, sign in, reset password, account) and polished "coming soon" pages for the
Fitting Room (virtual try-on, part of My Pumpkin Basket), terms and privacy. Every costume shows
its own photo, a cut-out (9.2).

---

## 1. Concept: Halloween night

You arrive at the house at the end of the street on Halloween night. A hooded figure stands in
a blood-red window and watches you; fog rolls across the ground; you have a flashlight, and it
finds things in the dark. Inside is the wardrobe: every monster you could become, their names
lighting up as your light passes.

### 1.1 The look

**Cold night, hot red light.** A moonlit, blue-black night and cold fog against the blood-red
light of a window, the contrast of classic horror lighting. Gothic titles like the titles of
80s slashers, a bookish serif for everything read, like the lore of an old horror novel.

**Horror you can see.** Effects must be visible at a glance (fog you notice, a flickering title, eyes in the dark), while pages stay
simple (8, 12). Ruled out: neon and synthwave (VHS appears only as a damaged tape on the title
cards, 8.9), futuristic chrome, and the generic dark site (condensed capitals, typewriter labels,
a grid of identical cards).

### 1.2 Vocabulary

| Cinema                           | Kostuma                                           |
| -------------------------------- | ------------------------------------------------- |
| Title card                       | Home hero ("The darkest day is coming.")          |
| Film leader countdown            | Countdown to Halloween                            |
| The cast                         | The collection: 82 characters, latest film first  |
| One-sheet poster + billing block | Costume page (image, name, credits)               |
| Behind the scenes                | Fun facts ("Behind the screams")                  |
| Wardrobe department notes        | "The look": what the costume needs                |
| Cue mark ("cigarette burn")      | Loading and page-change indicator                 |
| Reel change                      | Moving between pages                              |
| Wardrobe fitting                 | The Fitting Room: try on what's in your basket    |
| Coming soon trailer              | Features not open yet (Fitting Room, legal pages) |
| Admission ticket                 | The premium badge (paid try-ons)                  |

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

1. **Horror in the atmosphere, clarity in the controls.** The night lives in color, type, light,
   fog and motion, never in how a control works: clean grids, readable forms, fast, accessible.
2. **Visible, not subtle.** Every effect must be noticeable at a glance on an ordinary screen.
   Minimal structure (no extra titles, labels or
   sections) and a strong atmosphere are not in conflict.
3. **Clarity beats spookiness where people act.** Forms, errors, buttons and prices are plain and
   instantly readable. Atmosphere lives around them, never on them.
4. **Color means something.** Blood red = light, action, danger, the seconds running out.
   Pumpkin orange = My Pumpkin Basket. Black, bone and cold fog = the night.
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
- Wordmark: `Kostuma` in the gothic title face (Grenze Gotisch, semibold, 32 px), its **o** in
  `--blood-text` with a soft red glow, a drop of blood. `lang="en" translate="no"`.
- Accessible name `Kostuma` (the letters are `aria-hidden`, the mark is `role="img"`).
- Hover (fine pointer): the o beats once (7.2 heartbeat). Reduced motion: no beat.
- In the header and at the top of the footer.

### 2.2 Voice

Short. Ominous. Confident. Second person, present tense. A little wry, never cheesy.

- Wordplay at most once per page: "Behind the screams", "The night is young".
- Never a label that needs explaining: no ranks, no badges for trends or eras.
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

| Token                                  | Value                  | Hex       | Use                                                    |
| -------------------------------------- | ---------------------- | --------- | ------------------------------------------------------ |
| `--background`                         | oklch(0.135 0.007 269) | `#07080b` | Page: a cold, moonlit black.                           |
| `--card` / `--popover`                 | oklch(0.164 0.011 268) | `#0c0e13` | Raised surfaces, menus, image wells.                   |
| `--secondary` / `--muted` / `--accent` | oklch(0.209 0.015 267) | `#15181f` | Hover fills, chips, skeletons.                         |
| `--foreground`                         | oklch(0.926 0.017 85)  | `#ece6da` | Bone. Text, icons.                                     |
| `--muted-foreground`                   | oklch(0.656 0.015 300) | `#928f99` | Ash: secondary text, films, labels.                    |
| `--primary`                            | oklch(0.5 0.195 27)    | `#b91319` | Red fills: primary buttons. **Never text.**            |
| `--blood`                              | oklch(0.529 0.209 26)  | `#c8101d` | The window's light, glows, rims. Never body text.      |
| `--blood-text`                         | oklch(0.627 0.22 24)   | `#f0373f` | Red text: the tail line, the seconds, hover names.     |
| `--moon`                               | oklch(0.8 0.035 250)   |           | Moonlight and fog tints only. Never text.              |
| `--destructive`                        | oklch(0.73 0.16 24)    | `#fc7a75` | Error text and icons.                                  |
| `--ember`                              | oklch(0.77 0.155 62)   | `#f99b39` | Pumpkin orange: My Pumpkin Basket only.                |
| `--border`                             | bone / 9 %             |           | Hairlines, thumbnail edges.                            |
| `--input` / `--field-border`           | bone / 45 %            |           | Field underlines, checkbox and outline-button borders. |
| `--ring` / `--focus`                   | = `--foreground`       |           | Focus indicators.                                      |

### 3.2 Contrast (measured, WCAG 2.2)

`app/palette.test.ts` parses `:root` of `app/globals.css` and checks every pair: bone, ash,
blood-text and destructive on background, card and muted ≥ 4.5; ember on background and card
≥ 4.5; bone on primary (and on its 80 % hover) ≥ 4.5; field borders and the focus outline ≥ 3.
`--blood` (3.6 on the background) is only ever light or large glow, never text.

## 4. Typography

### 4.1 Families (`app/fonts/`, `next/font/local`: the files ship with the app)

| Role    | Family         | Why                                                                                 |
| ------- | -------------- | ----------------------------------------------------------------------------------- |
| Display | Grenze Gotisch | Gothic titles like 80s slasher titles; readable at display sizes. `font-heading`.   |
| Text    | Crimson Pro    | A book serif for lore and interface, the voice of an old horror novel. `font-sans`. |

- **Labels, buttons, badges, navigation:** the `caps` utility, Crimson Pro in small capitals
  (`font-variant-caps: all-small-caps`, 0.09em tracking, weight 600). The served files carry no
  small-capital glyphs, so `html` sets `font-synthesis: small-caps` (and never fakes bold or
  italic).
- **Never uppercase the gothic face**: its capitals are unreadable in a row. Titles and names
  keep their natural case.
- Chinese: system fonts (`--font-cjk`), no tracking (4.3).

### 4.2 Scale (fluid)

| Style                      | Family  | Size                                       | Line height | Weight |
| -------------------------- | ------- | ------------------------------------------ | ----------- | ------ |
| `display-xl` (home H1)     | display | clamp(3.25rem, 7.2vw, 7rem)                | 0.92        | 600    |
| `display` (page H1)        | display | clamp(2.75rem, 6vw, 5.5rem)                | 0.95        | 600    |
| `display-fit` (account H1) | display | clamp(2.75rem, min(5.2vw, 7.5svh), 5.5rem) | 0.95        | 600    |
| `h2` (section)             | display | clamp(1.9rem, 3.4vw, 3rem)                 | 1           | 600    |
| `h3` (names in lists)      | display | clamp(1.75rem, 3vw, 2.75rem)               | 1.02        | 500    |
| `numeral` (countdown)      | display | clamp(3rem, 6.2vw, 5.75rem)                | 0.95        | 500    |
| `lead`                     | text    | 1.3125rem                                  | 1.5         | 400    |
| `body-lg` (lore)           | text    | 1.25rem                                    | 1.65        | 400    |
| body                       | text    | 1.125rem (18 px)                           | 1.55        | 400    |
| `ui` (nav, buttons)        | text    | 17 → 20 px, small caps                     | 1.1         | 600    |
| `label`                    | text    | 17 → 20.4 px, small caps                   | 1.2         | 600    |
| `micro` (units, meta)      | text    | 15 → 18 px, small caps                     | 1.2         | 600    |
| `billing` (credits)        | text    | 19 → 22.8 px, small caps                   | 1.2         | 600    |
| `badge`                    | text    | 14 → 16.8 px, small caps                   | 1           | 600    |

The small-capital sizes grow fluidly from phones to desktop (`clamp()`, `app/globals.css`); on
desktop they are 1.2 times the phone size (owner). Footer links, legal lines and language links
stay at 16 px.

### 4.3 Rules

- Sentence case in copy; the display face is never uppercased (4.1).
- Films are set in italics (`Scream (1996)`).
- Chinese (`*:lang(zh-Hans)`): no letter spacing, real weights from the system fonts, line
  height 1.8 for body text; the wordmark keeps `lang="en"`.

## 5. Layout

- Breakpoints (Tailwind defaults): `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- Container: `max-w-7xl` (80rem), padding-x 16 px / 24 px (`sm`) / 32 px (`lg`). No horizontal
  scroll at 320 px.
- Grid: 4 columns (mobile), 8 (`md`), 12 (`lg`), gap 16 / 24 / 32 px.
- Vertical rhythm: sections `py-[clamp(4rem,10vw,9rem)]`; stacks use multiples of 4 px
  (8, 12, 16, 24, 32, 48, 64).
- Header height 64 px; sticky toolbars sit below it (`top-16`).
- Z-index scale: the vignette and the night scene behind the content · content 0 · ground fog
  20 · sticky toolbar 30 · header 40 · menus/overlays 50 · grain 60 · cue mark 65 · toasts 70 ·
  skip link 80. Decorative layers take no pointer events.

---

## 6. Shape, surface, texture

- **Square corners everywhere** (`rounded-none`); circles only where things are round.
- Hairlines: 1 px `--border`, rarely. Sections are separated by space and light, never by a line
  or a change of background (owner: no seams, 8).
- Elevation is light: a red glow (`box-shadow` in `--blood`) marks what is under the pointer or
  lit (a thumbnail on hover, the costume picture).
- Texture comes from the atmosphere (8): grain, fog, the vignette.

---

## 7. Motion

### 7.1 Tokens

| Token             | Value                          | Use                                                |
| ----------------- | ------------------------------ | -------------------------------------------------- |
| `--ease-dread`    | cubic-bezier(0.16, 1, 0.3, 1)  | Row hover, the drip (fast start, long tail).       |
| `--ease-heavy`    | cubic-bezier(0.65, 0, 0.35, 1) | Toggles, overlays, the heartbeat, the reel change. |
| `--duration-fast` | 150 ms                         | Color and opacity on hover/press.                  |
| `--duration-base` | 300 ms                         | Small state changes, menus.                        |
| `--duration-slow` | 700 ms                         | The mobile menu's items fading up.                 |
| Frame             | 1000 / 24 ≈ 42 ms              | Film-rate steps (grain, cue mark).                 |
| Stagger           | 60 ms, max 12 items            | The mobile menu's links.                           |

### 7.2 Patterns

- **Title-card cut:** page titles never fade in; they are there on the first frame. The home
  title then **flickers** like a dying bulb: three dips in seven seconds, at most two in one
  second (7.3), never below 42 % opacity.
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
- **Row hover and focus:** the name turns `--blood-text` with a red glow and moves 6 px right;
  the thumbnail brightens and gets a red rim glow; the film turns bone. 300 ms. No picture
  follows the pointer (owner).
- **Lit by scroll:** each costume row is at 30 % opacity away from the middle of the screen and
  at 100 % while it passes it, as if a flashlight swept down the list (`.lit`, a scroll-driven
  animation; browsers without one show every row at full strength).
- **Into the light (costume photos):** a photo waits as a black silhouette rimmed in blood-red
  backlight, like the figure in the window. Once it is loaded and in view (its top above the
  bottom fifth of the screen), the red swells, a light catches, dies, and comes on, and the red
  fades: 1.8 s, once (`into-the-light`, a `filter` animation on the photo's frame that leaves no
  filter behind). Choosing another photo on a costume page brings it in the same way.
- **Heartbeat:** scale 1 → 1.18 → 1 → 1.08 → 1 over 1000 ms (lub-dub): the wordmark's o on
  hover, the lit pumpkin when an item is added. The countdown's seconds beat on every tick with
  a smaller pulse (1.07) and a red glow.
- **Ignite (basket add):** pumpkin goes from outline to ember fill with a 600 ms flicker (opacity
  0.4 → 1 → 0.7 → 1) and the count rolls up (old number slides up and out, new one in).
- **Overlay (mobile menu):** backdrop fades in 300 ms; items fade up with 60 ms stagger; closing
  is a 200 ms fade, no stagger.

### 7.3 Reduced motion and photosensitivity

Under `prefers-reduced-motion: reduce`:

- Reveals are off: content is simply there; costume photos are lit from the start.
- The reel change becomes an instant cut; no scratches.
- Ambient loops stop: grain frozen, fog still, no flicker, no heartbeat, no blinking eyes, no
  lamp stutter, no drip, no VHS roll; the flashlight stays where it is; costume rows stay fully
  lit. The cue mark shows steadily.
- Hover keeps its color changes, without movement.

Always, regardless of settings: no element flashes more than 3 times per second; flicker
changes opacity by at most 10 % of the layer and never involves saturated red fields larger than
a card (WCAG 2.3.1, red-flash threshold). The cue mark is small (≤ 32 px) and blinks at 1 Hz.

---

## 8. Atmosphere layers

Decorative, `aria-hidden`, `pointer-events: none`. Transform and opacity animations only. Global
ones render once in the root layout (`components/horror/atmosphere.tsx`); the rest belong to the
home title (`components/home/night-scene.tsx`). **No layer may draw a line where its section
ends** (owner): every layer in a section fades out before the edge, and no background or mask
tiles (a box ending mid-pixel on a 2.625× phone showed the next tile's top as a line). An e2e
test measures brightness across the title's bottom edge and fails on a step of 1.5 levels.

1. **Grain (global).** SVG `feTurbulence` tile, opacity 0.11, jumping every frame of a 330 ms
   stepped loop. Above the content, like the grain of the print.
2. **Vignette (global).** Radial darkening to 70 % at the screen's edges, behind the content.
3. **Ground fog (global).** A fog texture (`public/images/fog.webp`, drawn by
   `scripts/fog.mjs`: seeded soft blobs that wrap left to right) rolling along the bottom 24 % of
   the screen at 24 % opacity, over everything, 90 s per loop.
4. **Moonlight (home title).** A cold glow from the upper left and the window's red light.
5. **The flashlight (home title).** Darkness at 95 % with a soft hole (6 → 24 rem) that follows
   the pointer, easing after it; after 2.5 s without a pointer (and on touch screens) it
   wanders in slow figure-eights. It moves by `translate` only, rests while off screen or in a
   hidden tab, and fades out over the title's last 22 %. It hides **eyes in the corner** that
   blink now and then (hidden on small screens).
6. **The figure in the window (home title).** An SVG: an arched window lit blood red (its lamp
   stutters now and then), a hooded figure standing in it with two red eyes that blink, a red
   light spill and glow. Between the tagline and the countdown on desktop, a small tableau above
   the title on phones. Its feet dissolve into the fog. Nothing else stands in the scene: no
   second window, no figures behind glass, no writing on the wall (owner).
7. **Fog (home title and the 404).** The same texture in two layers rolling at different speeds
   (70 s and 44 s, opposite directions) over the bottom three quarters, fading out top and
   bottom.
8. **Scratches (page changes only).** Two 1 px bone lines jumping during the 450 ms reel change.
9. **VHS tracking (the 404, the home title, the account pages; owner, 2026-10-02: "I love the
   effect that the text 404 has and that vhs static band").** A band of bone scan lines (14 % of
   its box, 15 % opacity) rolls up through the box in 1.2 s every 7 s, over what is in it.
   Titles split into a red ghost (left) and a bone ghost (right): `404` by 2 px, the home title
   and the account pages' titles by 0.035 em (at least 2 px). On the home title the band fades
   in and out before the section's edges (no seam); on the account pages it runs from the
   screen's left edge through the night and fades out before the form (never over a form, 1.4).
   The 404 is unchanged. Reduced motion: the band never rolls; the ghosts stay.

Reduced motion: everything above is still (the flashlight stays put, the fog and grain freeze,
nothing flickers or beats).

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

### 9.2 Costume photos

- Each costume has one or more photos (`images` in `content/costumes.ts`), cut-outs on a
  transparent background: the subject trimmed with a 4 % margin. The site shows each one's web
  copy (WebP, long side ≤ 1400 px, about 140 KB) from Firebase Storage, through `next/image`.
  The lossless masters (PNG, 2048 px) are kept for the Fitting Room.
- In a 4:5 frame on the dark well (`--card`, a hairline edge), **contained, never cropped**
  (owner), standing on the frame's floor (`object-bottom`).
- Alt: `"{name} costume"` (`Costume.photoAlt`) on the costume page; `""` in lists and on the
  gallery's thumbnails, where the name is written next to it or the button is named.
- Lists show the first photo; the costume page shows them all (11.3).
- A photo that fails to load is asked for again twice (1.5 s, then 3 s, each plus up to 1 s of
  spread); then the placeholder art takes its place.

### 9.3 The placeholder image (a missing or failed photo)

- File: `public/images/costume-placeholder.webp` (+ `.avif`), 1200 × 1500 (4:5), generated
  from an SVG source (`design/costume-placeholder.svg`) with sharp.
- Art direction: a dark room in warm black. A tall, anonymous hooded figure, faceless, stands
  center, lit from behind by an arterial-red rim light that spills onto floor fog; a faint
  sodium-orange glow from off-frame, like a streetlight through a window. Film grain. No text,
  no character features: _the costume is waiting for whoever wears it_. Works under a bottom
  gradient that carries the card's text.
- Alt: decorative (`alt=""`); the character's name is always in text nearby.
- OG images are generated (next/og) in the same language: warm black, red rim glow, name in
  the display face, film in muted italics, wordmark bottom-left. No rank. 1200 × 630.

---

## 10. Components

Client components are marked (C). Everything else renders on the server.

### 10.1 Primitives (preset structure, night palette)

- **Button** (preset cva, `ui` small capitals): variants `default` (blood-red fill, bone text,
  hover darkens to 80 %),
  `outline` (`--field-border`), `secondary`, `ghost`, `link` (`--blood-text`), `destructive`.
  Sizes preset. Focus: the global outline (3.2). Loading state: spinner (Remix `loader-4-line`,
  spin 800 ms linear) replaces the leading icon, label switches to the "…ing" message,
  `aria-busy`. Preset heights (default 40 px); header, menu and other touch-first controls use
  `lg` / `icon-lg` (44 px). Links styled as buttons use `buttonVariants` on the
  link itself.
- **Badge** (preset: borderless, small capitals, `badge` size). The `soon` variant adds a 1 px
  border (bone at 20 %) and 2 × 6 px padding so it reads as a stamped label, text muted: "Soon".
  `premium`: the same stamp in `--blood-text` (border at 50 %), "Premium", the admission ticket
  of paid features. `count`: a 20 px ember square with the number in `--background`, tabular
  figures and a soft ember glow, set on the header's pumpkin (the basket's count). Each feature
  that needs another badge adds it with its tests.
- **Field** (preset `field.tsx`: Field, FieldLabel, FieldDescription, FieldError with
  `role="alert"`, FieldGroup, FieldSet, FieldSeparator). Label in `ui` small capitals, always
  visible above the control; description muted `small`; error
  `--destructive` `small`, linked by `aria-describedby`, control gets `aria-invalid`.
- **Input / Textarea** (preset underline fields): transparent, no box, a 1 px underline in
  `--field-border`, 40 px tall (44 px hit area with the label), no side padding. Hover: underline
  at bone 70 %. Focus: underline turns bone and doubles to 2 px (inset shadow, no layout shift);
  no outline box. Invalid: underline `--destructive`. Textarea grows with content
  (`field-sizing: content`) and shows a live character count `n / max` (`micro`).
- **Password input** (C): input + show/hide toggle button (eye icons, `aria-pressed`, label
  "Show password"/"Hide password").
- **Checkbox**: 18 px square, `--field-border`, checked = arterial fill + bone check, focus =
  global outline; label to the right, clickable.
- **Segmented control** (C): radio group rendered as joined square tabs; selected = `--muted`
  fill + 2 px `--blood` bottom bar; arrow keys move selection.
- **Language menu** (C, header, from `lg`): globe + current endonym + chevron opens a Base UI
  Menu: a `--card` panel with a hairline border, a small-capital "Language" label, then every language
  as a link to this same page in that language (`hreflang`, `lang`), the current one checked in
  `--blood-text`. The highlighted row gets `--muted` and a 2 px `--blood` bar at its edge, like a
  splice mark. Accessible name "Language: English" (a message). Arrow keys, type-ahead, Escape.
- **Language links** (C, footer and mobile menu): the same links inline, small capitals at
  16 px, the current one underlined in `--blood`. No popup, and they work without JavaScript.
- **FormAlert**: whole-form message, `role="alert"`, 1 px destructive border at 40 %, destructive
  text, alert icon. Success variant: foreground text, check icon, border bone/20.
- **Skeleton**: `--muted` blocks with a slow sheen (1.6 s); static under reduced motion.

### 10.2 Brand and shell

- **Wordmark** (2.1).
- **Header** (server; the mobile menu is the only client part, the scroll state is CSS):
  - Wordmark → home, then the main nav: the two places of the flow (1.3). Costumes (from `lg`;
    the home page's costumes section, `/#costumes`, 11.1) and, pushed right, My Pumpkin Basket: the pumpkin plus its name from `lg`, the icon alone
    below. The pumpkin is lit while the basket holds something, with the `count` badge on it;
    the link is named with the count ("My Pumpkin Basket, 3 costumes"), the badge itself is
    hidden from screen readers. Adding a costume anywhere on the page ignites it and rolls the
    count up; taking one out rolls it down (7.2). Places only, never actions.
  - Then the language menu and the account: "Sign in" (outline) or, signed in, a 44 px square
    with the visitor's initials (bone on `--card`, a red glow on hover) named "Your account",
    opening a menu like the language menu: their name and email, Account, Sign out.
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
- **Footer** (on the page's grid; no top border and no sign-off line, owner):
  - Top row, aligned at the top: the wordmark and the legal lines (2.3) on the left (5 of 12
    columns); on the right (6 columns), Explore (Costumes, My Pumpkin Basket), Help (Report a
    bug, Share feedback, Request a costume) and Fine print (Terms `soon`, Privacy `soon`),
    their small-capital titles on one line.
  - Bottom row: the year (small capitals) on the left, the language links on the right.
  - Small screens: everything stacks; the columns go two, then one, per row.

- **Breadcrumb**: small-capital `label`, `/` separators, current page `aria-current="page"`.

### 10.3 Feature components

- **Countdown** (C): see 11.1.
- **CostumeRow** (`components/costume/costume-row.tsx`): one link per costume, in a list.
  - The costume's first photo in its 4:5 frame (114 × 143 px, 156 × 195 px from `lg`; 9.2),
    slightly dimmed, brought in by the reveal (7.2); then the
    name (`h3` size, display face) with the film under it in italics ("Pearl (2022) / X
    (2022)" for several). Nothing else: no rank, no badge, no picture following the pointer.
  - Hover and focus per 7.2; prefetches on intent only (15). At the row's end, outside the
    link, the basket toggle.
- **Basket toggle** (C, `components/basket/basket-toggle.tsx`): a 48 px button, outline pumpkin
  (ash, ember on hover) ↔ lit pumpkin; it ignites on add (7.2). Named "Add {name} to My Pumpkin
  Basket" / "Remove {name} from My Pumpkin Basket"; announces "{name} added to My Pumpkin
  Basket." / "{name} removed from My Pumpkin Basket." through the polite live region (12).
  Hidden without JavaScript.

- **Billing block**: the credits of a costume page: centered between hairlines, role words in
  small `micro` capitals, names in `billing` small capitals ("Created by", "Brought to life
  by"). A role with no names is left out.
- **Wardrobe list** ("The look"): the catalog's look text split into items, each with a thin
  square bullet, `body`. Reads as a wardrobe department checklist.
- **Buy** (in the basket only, 1.3): opens the outfit's shop in a new tab, with an
  `arrow-right-up-line` icon and sr-only "(opens in a new tab)"; `target="_blank"`
  `rel="noopener noreferrer nofollow"` (+ `sponsored` when a link is an affiliate link). With
  several shops, a styled menu of them ("Buy at {shop}"). A costume without a shop yet shows
  "Buy" with a `soon` stamp and nothing to press. Each control is named by one whole message
  ("Buy {name} (opens in a new tab)"), never words glued together, so every language orders
  them its own way.
- **Empty state**: centered icon (64 px, muted), `h3`, one line of copy, one action.
- **Coming soon panel**: see 11.9.
- **Premium price line** (owner's words): "2 free try-ons, then {price} per costume."
  `{price}` is USD 5 (`lib/fitting-room.ts`), no cents when whole ("$5"),
  formatted by the locale's currency formatter (next-intl `format.number(5, {style: "currency",
currency: "USD"})`), never a hardcoded "$5" string.

---

## 11. Pages

All pages: header, `<main id="content">`, footer, atmosphere layers. Titles through
`generateMetadata` (`%s · Kostuma`). Auth/account/coming-soon/legal-soon pages are `noindex`.

### 11.1 Home `/`

1. **The title, in the night scene (8.4–8.7).** As tall as its content plus 200 px on desktop
   (owner). Desktop: the tagline on the left, the countdown on the right with "Choose your
   costume" under it (owner), bottoms aligned; the figure in the window stands between them.
   Phones: the figure as a small tableau on top, then one column.
   - H1 `display-xl`, flickering (7.2) and split into the red and bone ghosts (8.9): "The
     darkest day is coming." (`App.taglineLead`). The VHS band rolls over the whole title (8.9).
   - Under it, in `--blood-text` with a red glow: "Transform into a monster." (`App.taglineTail`).
   - **Countdown** (`components/countdown`, logic in `lib/countdown`): a small-capital line
     "Until Halloween · **Saturday, October 31**" (the date in bone, formatted per locale), then
     four cells, Days · Hours · Minutes · Seconds: `numeral` digits in the display face over
     small-capital units, four equal columns on one left edge; the seconds in `--blood-text`,
     beating on every tick. Counts to midnight of October 31 **in the visitor's time zone**,
     real time left (no jump at daylight-saving changes); all of October 31 shows "Tonight."
     and "The darkest day is here." in the same three rows (no shift at midnight); from
     November 1 it counts to next year. The server renders dashes at the final size; the
     browser fills in the count. `role="timer"`, and a visually hidden sentence updated once a
     minute ("29 days, 10 hours and 14 minutes until Halloween.").
   - **"Choose your costume"** (`Home.chooseCostume`), display face, with a red arrow dripping
     downward: a link to the costumes below (`/#costumes`).
2. **The costumes** (`<section id="costumes" aria-label="Costumes">`), right below: all 82
   rows (10.3) by year, latest first (owner; the year of the film a character is known from,
   ties in the owner's ranking), two columns from `lg`, lit by scroll (7.2),
   server-rendered and crawlable. No heading, intro, count or footnote on screen, no search,
   filters or sort (owner). Every "Costumes" link (header, menu, footer, breadcrumb) leads
   here: `/#costumes`, `/es#costumes`; the section keeps `scroll-margin-top` for the header.

### 11.2 No `/costumes` page

The costumes live on the home page (11.1). There is no collection page, so there is no page
title, toolbar or empty state for one.

### 11.3 Costume `/costumes/[slug]` — the one-sheet

- Breadcrumb Costumes (→ `/#costumes`) / {name}.
- Desktop two columns (5 / 7): left sticky photo (4:5, hairline edge, a faint red glow around
  it, the reveal); right content. Mobile: photo then content. No rank anywhere.
- With several photos (The Strangers, The Purge), small thumbnails (72 px wide, 4:5) under the
  large one, buttons named "Photo 2 of 3" (`aria-pressed`), dimmed until hovered or chosen; the
  chosen one gets a red edge and glow. Choosing one shows it large, with its own reveal. Without
  JavaScript the thumbnails are hidden (`@media (scripting: none)`) and the first photo stays.
- Content, in order:
  - H1 `display`: the character.
  - Film line: film icon + "Scream (1996)" (lead, muted).
  - Action: one primary button with the pumpkin, "Add to My Pumpkin Basket". Once the costume
    is in: "In My Pumpkin Basket" (outline, lit pumpkin), a link to the basket, which takes the
    focus when the visitor's own click put it there. No try-on and no shop here (1.3): both live
    in the basket. Hidden without JavaScript.
  - **The lore** (`label` + `body-lg`).
  - **The look** (wardrobe list).
  - **Behind the screams** (fun fact, `body`, inside a left hairline in `--blood`).
  - **Credits** (billing block).
- Previous / next in the list's order (by year, latest first), by name only ("← Previous" over {name} / "Next →" over
  {name}); none before the first costume or after the last.
- "More from {film}" when the film has other characters, else "More costumes": the next 4,
  wrapping past the last to the first, as rows (10.3) in two columns.
- An unknown slug is a 404.

### 11.4 My Pumpkin Basket `/basket`

`noindex` (each visitor's own). No sign-in needed.

- H1 "My Pumpkin Basket"; under it the count, "3 costumes" (nothing when empty: the empty
  basket says so). Never where or how the basket is kept (owner: no "Kept on this device."):
  that is Kostuma's business. Signed in and the account can't be reached, the line becomes an
  alert in `--destructive`: "Your account can't be reached right now, so changes here may not
  be saved. Reload the page to try again." (the visitor's changes are at risk: that they must
  know).
- **The Fitting Room** panel (part of the basket, 1.3), at the top: a `--card` panel with a
  `--blood` hairline at 40 % and a faint red glow; `h2` "The Fitting Room" + `soon` + `premium`,
  one line ("Try on the outfits in your basket, special-effects makeup included."), the price
  line (10.3), link "Step inside" → `/basket/fitting-room` (coming soon).
- Rows, the last added first, separated by space (no lines): thumbnail (4:5, 72 px wide, no
  reveal), name + film (a link to the costume), actions: **Buy** (10.3), "Try on" + `soon`
  (→ `/basket/fitting-room?costume={slug}`), "Remove" (ghost, ✕ icon). Removing keeps the
  visitor's place: focus moves to the next row's Remove (or the previous one's), or to the empty
  basket's title. "Clear basket" (ghost, under the rows) asks for a second click ("Click again
  to clear", in `--blood-text`, announced) within 4 s.
- Empty: unlit pumpkin (64 px), `h2` "Your basket is empty.", "The night is young.", button
  "Browse costumes" → `/#costumes`.
- The server never knows the basket: it renders a placeholder (skeleton count line and two
  skeleton rows); the browser fills it in (no hydration mismatch). Without JavaScript the
  placeholder is hidden and the empty basket shows (nothing can be added without it).
- **Where it is kept** (`lib/basket`): a guest's basket in localStorage (`kostuma.basket`,
  `{ v: 1, slugs }`), followed by every open tab. Signed in, in Firestore `baskets/{uid}`,
  followed live by every tab and device; the device keeps a copy to show at once. Signing in
  brings the guest basket into the account once, then empties it; signing out leaves the
  basket in the account and the device empty. Whatever is read is checked: unknown costumes
  are dropped, broken or outdated data reads as an empty basket.

### 11.5 Sign in `/sign-in`, Register `/register`, Reset password `/reset-password`

All `noindex`. A signed-in visitor is sent on to `next` (sign in, register).

- Desktop split: left 5 columns, the night: a blood-red light rising under fog that fades out on
  every side, "Are you ready for the dark?" (owner) in hollow gothic letters edged in bone, lit
  red, and the VHS band rolling through it (8.9). Right 7 columns: the title (`display-fit`:
  `display`, held to the screen's height; split into the red and bone ghosts, 8.9, at every
  size), the form (max 400 px; register 560 px), the way to the other page under it, all on
  one screen without scrolling (owner) from 1024 × 656 up: tighter gaps from `lg`, and
  register sets name | email and password | confirm side by side, then the robot check and
  "Create account" side by side (a form error under both). Mobile: the form only, one column (the
  header carries the wordmark).
- Typed text: 20 px on phones, 18 px from `md` (owner: 4 px larger than the preset's); labels
  and hints keep their sizes.
- **Sign in:** "Continue with Google" (Google's dark style: fill `#131314`, 1 px border
  `#8E918F`, text `#E3E3E3` in Roboto/Arial, the multicolor G), "or" on a hairline, email,
  password (show/hide), "Forgot your password?", submit "Sign in". Under it: "New here? Create
  an account" (keeps `next`).
- **Register:** Google, "or", name, email, password (hint "At least 8 characters."), confirm
  password, the checkbox "I agree to the Terms of service and Privacy policy" (owner: no age
  checkbox), each a link to `/terms` and `/privacy` opening in a new tab so nothing typed is
  lost, reCAPTCHA (dark, in the page's language; its 78 px kept so the form doesn't jump;
  Google's compact box where 304 px doesn't fit; if Google fails or stays silent 10 s, a line
  says so in words), submit "Create account". Under it: "Already have an account? Sign in".
- **A first sign-in** (Google, or an account made elsewhere): before the account's profile
  exists, `h2` "One more thing" (focused) and the same terms checkbox, then "Continue".
- **Reset:** a line on what happens, email, "Send reset link"; always answers "If an account
  uses that email, a reset link is on its way." (never reveals whether an account exists).
- Errors: field errors under fields; form errors in a FormAlert; after a failed submit focus
  goes to the first field in error, else the alert; all from translated codes (zod's and
  Firebase's alike). Signing in never says which of the email or password was wrong. Closing
  Google's window is the visitor's choice: nothing is said.
- Pending: fieldset disabled, button spinner + "Signing in…" / "Creating account…" /
  "Sending…" / "Continuing…".

### 11.6 Account `/account`

- H1 "Your account". Profile: name, email, member since (the locale's long date).
- The Fitting Room panel (11.4) with the account's line: "2 free try-ons waiting".
- Sign out (outline button, a form: works before scripts load). Signed-out visitors are
  redirected to sign in (with `next`). `noindex`.

### 11.7 Feedback `/feedback` (`?type=bug|feedback|costume`)

- H1 "Tell us what haunts you" (lead: "Found a bug, have an idea, or want a feature? We read
  every message.").
- Segmented control: Report a bug · Share feedback · Request a costume (preselected by `type`).
- Message textarea (label changes with type; 10–2000 characters, counter), optional email ("Only
  if you want a reply"), reCAPTCHA, submit "Send".
- Success replaces the form: check icon, "Received.", "Thank you. We read every message.",
  button "Send another".

### 11.8 Not found

Centered title card with the VHS tracking layer (8.9): "404" in the display face at `h2` size, split
into its red and bone ghosts,
`display` "Lost in the dark", one line, button "Back to Kostuma". Both 404s (the in-app one and
the global one for unmatched URLs) look the same; the global one has no header.

### 11.8b Something went wrong

A page that breaks shows a title card in the visitor's language, never the error itself and
never Next.js' English message: `display` "Something went wrong", one line ("Something on
this page failed. Try again, or head back to Kostuma."), buttons "Try again" (retries) and
"Back to Kostuma". Inside the shell for a page (`app/[locale]/error.tsx`); the whole document
when the shell itself breaks (`app/global-error.tsx`, its language read from the URL).
Developers find the details in the console; visitors only ever read messages.

### 11.9 Coming soon pages

Shared panel ("trailer"): `label` with a blinking red REC dot (1 Hz, static under reduced
motion) "Coming soon"; `display` title; lead; up to 3 feature bullets; primary action back to
something that works now; secondary "Want it sooner? Tell us." → `/feedback?type=feedback`.

| Route                  | Title            | Content                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/basket/fitting-room` | The Fitting Room | Part of the basket: what it does (one full-body photo + one face close-up → you in each outfit from your basket, special-effects makeup included), the outfits in your basket (or a nudge to fill it), `premium` badge, price line, privacy note ("Your photos stay private."), CTA back to My Pumpkin Basket. Accepts `?costume=`. |
| `/terms`               | Terms of service | "The fine print is being written." + a link to the feedback form. `noindex`.                                                                                                                                                                                                                                                        |
| `/privacy`             | Privacy policy   | Same pattern; states plainly what is kept today (an account's name, email and Google picture; when it was made, roughly where (country, region, city, time zone, from the connection) and on what (device, system, browser); when it last signed in and how often; feedback messages) + a link to the feedback form. `noindex`.     |

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
- **Live regions**: basket changes announce politely, through one region the basket provider
  renders on every page (`aria-live="polite"`, not `role="status"`: the cue mark's "Loading…"
  is the page's status); form alerts assertively.
- **Errors are messages**: every error a visitor can meet is a translated message, said in
  words they can act on. Technical errors go to the console for developers, never on screen.
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
  degrade to links. Reveals must never leave content invisible when JavaScript is off: the
  photos' silhouette exists only under `@media (scripting: enabled)`.

---

## 14. Internationalization

- Every visible string is a message, translated into Spanish and Chinese (`messages/{en,es,zh}.json`;
  informal "tú" in Spanish). `i18n/messages.test.ts` checks that each language has every English
  key and keeps each message's arguments and tags. Any key a language lacks falls back to English.
- The costume data (`content/costumes.ts`: lore, looks, fun facts, credits) is English in every
  language; character names and film titles are never translated. "My Pumpkin Basket" is
  translated as its proper name ("Mi cesta de calabaza", "我的南瓜篮").
- Dates, numbers, currency via next-intl formatters (countdown date, counts, price).
- Messages in sentence case; CSS applies the small capitals.
- Endonyms in the language menu and links: English · Español · 中文, each with its own `lang`
  and `hreflang`.
- Test layouts with the longest language (Spanish) and with CJK line breaking (Chinese).

---

## 15. Performance budgets

| Metric              | Budget                                                                                                                                                                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| LCP (4G, mid phone) | ≤ 2.0 s; the home LCP is the H1 text, visible from first paint (never starts at opacity 0)                                                                                                                                               |
| CLS                 | ≤ 0.02 (reserved sizes for countdown, reCAPTCHA, images)                                                                                                                                                                                 |
| INP                 | ≤ 200 ms                                                                                                                                                                                                                                 |
| JS per route        | ≤ 120 KB gz shared + ≤ 40 KB route                                                                                                                                                                                                       |
| Fonts               | 3 files in the repo (`app/fonts/`): Grenze Gotisch, Crimson Pro and its italic, variable, Latin and Latin Extended in one woff2 each (about 188 KB together), preloaded, `display: swap`; never fetched from Google; CJK from the system |

- Ambient effects: CSS, `transform`/`opacity` only, no `mix-blend-mode` on full-screen layers.
- `motion` only where CSS can't do the job (first use: the basket count's roll), in client
  islands, through `LazyMotion` + `domAnimation` + `m.*`. Reveals, the menu's stagger, the
  header over the hero and every atmosphere layer are CSS.
- Images: `next/image`, explicit `sizes` (rows `(min-width: 1024px) 156px, 114px`; the costume
  page `(min-width: 1280px) 470px, (min-width: 1024px) 37vw, calc(100vw - 2rem)`; thumbnails
  `72px`), lazy except the costume page photo (`loading="eager"`, `fetchPriority="high"`). Remote
  photos only from the project's `costumes/` folder on Storage (`next.config.ts`
  `remotePatterns`, no redirects); the browser loads them from `/_next/image`, so the CSP stays
  `'self'`.
- Prefetching: every page renders per request (the CSP nonce), so each prefetch costs the
  server a render. Long lists of links prefetch on intent only (hover, focus, touch:
  `components/navigation/intent-link.tsx`); prefetching every row on sight would fire ~150
  per visit to the home page (measured). Language links never prefetch (12, Prefetching).

---

## 16. Implementation map

| Piece                    | Where                                                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Tokens (palette, motion) | `app/globals.css` `:root` + `@theme inline`                                                                                               |
| Fonts                    | `app/fonts/` (the woff2 files, their OFL licenses, `index.ts`)                                                                            |
| Atmosphere               | `components/horror/{atmosphere,fog}.tsx` + `app/film.css` (grain, vignette, ground fog, scratches, VHS)                                   |
| Reel change              | `app/[locale]/template.tsx` (`<ViewTransition>`), `::view-transition` rules in `app/film.css`                                             |
| Cue mark                 | `components/horror/cue-mark.tsx`, fed by `lib/navigation-status.ts` from `i18n/navigation.tsx`                                            |
| Shell                    | `components/layout/{header,mobile-menu,footer,wordmark,skip-link,lost-in-the-dark}.tsx`                                                   |
| Primitives               | `components/ui/*` (shadcn style, cva)                                                                                                     |
| Feature components       | `components/{costume,basket,auth,forms,countdown}/*`                                                                                      |
| Catalog                  | `content/costumes.ts` (the owner's list, typed) → `lib/catalog` → `components/costume/*`                                                  |
| Links on intent          | `components/navigation/intent-link.tsx` (the costume rows)                                                                                |
| Night scene              | `components/home/{night-scene,flashlight}.tsx`, fog texture `scripts/fog.mjs` → `public/images/fog.webp`                                  |
| Countdown                | `lib/countdown` (logic, tested per time zone) + `components/countdown/countdown.tsx`                                                      |
| My Pumpkin Basket        | `lib/basket` (store, storage format, Firestore) + `components/basket/*` + `app/[locale]/basket`; `firestore.rules`                        |
| Costume photos           | `components/costume/{costume-image,costume-gallery}.tsx`, `lib/in-view.ts`, `.photo-reveal` in `app/film.css`; pipeline `scripts/photos/` |
| Placeholder art          | `design/costume-placeholder.svg` → `public/images/costume-placeholder.{avif,webp}`                                                        |
| Visual review            | Playwright screenshots at 375, 768, 1280 px for every page, checked before each commit                                                    |

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
  that throws (private mode, blocked) or is full; changes from another tab; costumes that no
  longer exist.
- **Account (basket, signed in):** the guest basket joining once; a costume removed on another
  device never coming back from this device's copy; one account's basket never shown to a
  guest or another account; changes made before the account answers, while it can't be
  reached, and refused by it (undone, and said); the rules refusing everything but the owner's
  own well-formed basket (`npm run test:firestore`, on the emulator).
- **Motion and no-JS:** reduced motion turns every loop and transition off; every page reads
  without JavaScript (no content stuck invisible).
- **Network and services:** slow networks (the cue mark, skeletons); reCAPTCHA failing to load
  or expiring; every Firebase Auth error code mapped to a translated message; rate limits.
- **Photos:** a photo that fails to load (asked for again, then the placeholder); a costume
  without a photo; one photo vs several (the gallery); a photo taller than the screen (the reveal
  still starts); reduced motion and no JavaScript (lit from the start); no layout shift.
- **Content states:** empty basket; unknown costume slugs, including a wrong case (404); the
  first and last costume (no previous / next, related wraps around); a character in several
  films; a credit role with no names; 1 item vs many (plurals).
- **Server cost:** scrolling the costumes prefetches nothing, hovering a card prefetches it;
  language links never prefetch; no section clips its fog; nothing scrolls sideways.

---

## 18. Later

The Fitting Room flow (upload guide, progress
as a "developing film" animation, result reveal) · Stripe checkout styled as a ticket stub ·
translations · optional opt-in ambient sound: projector whir (never autoplay) · shared-element
morphs between cards and costume pages.
