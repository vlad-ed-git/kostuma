# Kostuma — Design Spec

Status: 2026-10-01. Source of truth for how Kostuma looks, moves, reads and behaves. Dark mode
only. The owner approved this design as a live prototype
(https://claude.ai/artifact/1cjyDUCzhrvimjhPgLQ9AG) before it was built. The shadcn preset's
**structure** stays: Base UI components, square corners, underline form fields, borderless text
badges.

Scope: the public site (home with the costumes, costume pages, My Pumpkin Basket, feedback),
accounts (register, sign in, reset password, account) and polished "coming soon" pages for the
Fitting Room (virtual try-on, part of My Pumpkin Basket), terms and privacy. Every costume uses
one placeholder image until real photography exists.

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
simple (8, 12). Ruled out: neon/VHS/synthwave, futuristic chrome, and the generic dark site
(condensed capitals, typewriter labels, a grid of identical cards).

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

### 4.1 Families (`app/fonts.ts`, `next/font/google`, self-hosted)

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

| Style                  | Family  | Size                         | Line height | Weight |
| ---------------------- | ------- | ---------------------------- | ----------- | ------ |
| `display-xl` (home H1) | display | clamp(3.25rem, 7.2vw, 7rem)  | 0.92        | 600    |
| `display` (page H1)    | display | clamp(2.75rem, 6vw, 5.5rem)  | 0.95        | 600    |
| `h2` (section)         | display | clamp(1.9rem, 3.4vw, 3rem)   | 1           | 600    |
| `h3` (names in lists)  | display | clamp(1.75rem, 3vw, 2.75rem) | 1.02        | 500    |
| `numeral` (countdown)  | display | clamp(3rem, 6.2vw, 5.75rem)  | 0.95        | 500    |
| `lead`                 | text    | 1.3125rem                    | 1.5         | 400    |
| `body-lg` (lore)       | text    | 1.25rem                      | 1.65        | 400    |
| body                   | text    | 1.125rem (18 px)             | 1.55        | 400    |
| `ui` (nav, buttons)    | text    | 17 → 20 px, small caps       | 1.1         | 600    |
| `label`                | text    | 17 → 20.4 px, small caps     | 1.2         | 600    |
| `micro` (units, meta)  | text    | 15 → 18 px, small caps       | 1.2         | 600    |
| `billing` (credits)    | text    | 19 → 22.8 px, small caps     | 1.2         | 600    |
| `badge`                | text    | 14 → 16.8 px, small caps     | 1           | 600    |

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
- **Heartbeat:** scale 1 → 1.18 → 1 → 1.08 → 1 over 1000 ms (lub-dub): the wordmark's o on
  hover, the lit pumpkin when an item is added. The countdown's seconds beat on every tick with
  a smaller pulse (1.07) and a red glow.
- **Ignite (basket add):** pumpkin goes from outline to ember fill with a 600 ms flicker (opacity
  0.4 → 1 → 0.7 → 1) and the count rolls up (old number slides up and out, new one in).
- **Overlay (mobile menu):** backdrop fades in 300 ms; items fade up with 60 ms stagger; closing
  is a 200 ms fade, no stagger.

### 7.3 Reduced motion and photosensitivity

Under `prefers-reduced-motion: reduce`:

- Reveals are off: content is simply there.
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
9. **VHS tracking (404 only).** Unchanged (a rolling band of noise, a split `404`).

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

### 9.2 The placeholder image (one image for every costume)

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
  Each feature that needs another badge adds it with its tests (the basket count comes with My
  Pumpkin Basket).
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
  - The 4:5 thumbnail (114 × 143 px, 156 × 195 px from `lg`) with a hairline edge, slightly dimmed; then the
    name (`h3` size, display face) with the film under it in italics ("Pearl (2022) / X
    (2022)" for several). Nothing else: no rank, no badge, no picture following the pointer.
  - Hover and focus per 7.2; prefetches on intent only (15). The basket toggle comes with
    `feat/basket`, at the row's end.
- **Basket toggle** (C): outline pumpkin ↔ lit pumpkin, ignite animation on add; announces
  "Added to My Pumpkin Basket" / "Removed from My Pumpkin Basket" through a polite live region.

- **Billing block**: the credits of a costume page: centered between hairlines, role words in
  small `micro` capitals, names in `billing` small capitals ("Created by", "Brought to life
  by"). A role with no names is left out.
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

1. **The title, in the night scene (8.4–8.7).** As tall as its content plus 200 px on desktop
   (owner). Desktop: the tagline on the left, the countdown on the right with "Choose your
   costume" under it (owner), bottoms aligned; the figure in the window stands between them.
   Phones: the figure as a small tableau on top, then one column.
   - H1 `display-xl`, flickering (7.2): "The darkest day is coming." (`App.taglineLead`).
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
2. **The costumes** (`<section id="costumes" aria-label="Costumes">`), right below: all 100
   rows (10.3) in the owner's order, two columns from `lg`, lit by scroll (7.2),
   server-rendered and crawlable. No heading, intro, count or footnote on screen, no search,
   filters or sort (owner). Every "Costumes" link (header, menu, footer, breadcrumb) leads
   here: `/#costumes`, `/es#costumes`; the section keeps `scroll-margin-top` for the header.

### 11.2 No `/costumes` page

The costumes live on the home page (11.1). There is no collection page, so there is no page
title, toolbar or empty state for one.

### 11.3 Costume `/costumes/[slug]` — the one-sheet

- Breadcrumb Costumes (→ `/#costumes`) / {name}.
- Desktop two columns (5 / 7): left sticky image (4:5, hairline edge, a faint red glow
  around it); right content. Mobile: image then content. No rank anywhere.
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
  wrapping past the last to the first, as rows (10.3) in two columns.
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

- H1 "Your account". Profile block: name, email, member since.
- "The Fitting Room" block: "2 free try-ons waiting" + `soon` + price line.
- Sign out (outline button). Signed-out visitors are redirected to sign in (with `next`).

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

### 11.9 Coming soon pages

Shared panel ("trailer"): `label` with a blinking red REC dot (1 Hz, static under reduced
motion) "Coming soon"; `display` title; lead; up to 3 feature bullets; primary action back to
something that works now; secondary "Want it sooner? Tell us." → `/feedback?type=feedback`.

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

| Metric              | Budget                                                                                                          |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| LCP (4G, mid phone) | ≤ 2.0 s; the home LCP is the H1 text, visible from first paint (never starts at opacity 0)                      |
| CLS                 | ≤ 0.02 (reserved sizes for countdown, reCAPTCHA, images)                                                        |
| INP                 | ≤ 200 ms                                                                                                        |
| JS per route        | ≤ 120 KB gz shared + ≤ 40 KB route                                                                              |
| Fonts               | 2 variable families (Grenze Gotisch, Crimson Pro + italic), Latin subsets, `display: swap`; CJK from the system |

- Ambient effects: CSS, `transform`/`opacity` only, no `mix-blend-mode` on full-screen layers.
- `motion` only where CSS can't do the job (first use: the basket count's roll), in client
  islands, through `LazyMotion` + `domAnimation` + `m.*`. Reveals, the menu's stagger, the
  header over the hero and every atmosphere layer are CSS.
- Images: `next/image`, explicit `sizes`, `priority` only on the costume page image.
- Prefetching: every page renders per request (the CSP nonce), so each prefetch costs the
  server a render. Long lists of links prefetch on intent only (hover, focus, touch:
  `components/navigation/intent-link.tsx`); prefetching every row on sight would fire ~150
  per visit to the home page (measured). Language links never prefetch (12, Prefetching).

---

## 16. Implementation map

| Piece                    | Where                                                                                                    |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| Tokens (palette, motion) | `app/globals.css` `:root` + `@theme inline`                                                              |
| Fonts                    | `app/fonts.ts`                                                                                           |
| Atmosphere               | `components/horror/{atmosphere,fog}.tsx` + `app/film.css` (grain, vignette, ground fog, scratches, VHS)  |
| Reel change              | `app/[locale]/template.tsx` (`<ViewTransition>`), `::view-transition` rules in `app/film.css`            |
| Cue mark                 | `components/horror/cue-mark.tsx`, fed by `lib/navigation-status.ts` from `i18n/navigation.tsx`           |
| Shell                    | `components/layout/{header,mobile-menu,footer,wordmark,skip-link,lost-in-the-dark}.tsx`                  |
| Primitives               | `components/ui/*` (shadcn style, cva)                                                                    |
| Feature components       | `components/{costume,basket,auth,forms,countdown}/*`                                                     |
| Catalog                  | `content/costumes.ts` (the owner's list, typed) → `lib/catalog` → `components/costume/*`                 |
| Links on intent          | `components/navigation/intent-link.tsx` (the costume rows)                                               |
| Night scene              | `components/home/{night-scene,flashlight}.tsx`, fog texture `scripts/fog.mjs` → `public/images/fog.webp` |
| Countdown                | `lib/countdown` (logic, tested per time zone) + `components/countdown/countdown.tsx`                     |
| Placeholder art          | `design/costume-placeholder.svg` → `public/images/costume-placeholder.{avif,webp}`                       |
| Visual review            | Playwright screenshots at 375, 768, 1280 px for every page, checked before each commit                   |

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
