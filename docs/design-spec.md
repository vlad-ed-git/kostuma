# Kostuma — Design Spec

Status: v1 (2026-09-30). Source of truth for how Kostuma looks, moves, reads and behaves.
Dark mode only. Built on the project's shadcn preset (`base-sera`): its palette, fonts and
square geometry are the foundation, not suggestions.

Scope of v1: the public site (home, costumes, costume pages, Pumpkin Basket, feedback),
accounts (register, sign in, reset password, account) and polished "coming soon" pages for
virtual try-on (The Mirror), pricing, terms and privacy. Every costume uses one placeholder image
until real photography exists.

---

## 1. Concept: The Midnight Picture House

Kostuma is a cinema that only opens at night. You walk in off the street, the lights go down,
the projector hums, and the cast of every horror film you ever loved is waiting to be worn.

The metaphor gives the whole product one vocabulary:

| Cinema | Kostuma |
| --- | --- |
| Title card | Home hero ("The darkest day is coming.") |
| Film leader countdown | Countdown to Halloween |
| The cast / most wanted | The collection: 100 characters, ranked |
| One-sheet poster + billing block | Costume page (image, name, credits) |
| Behind the scenes | Fun facts ("Behind the screams") |
| Wardrobe department notes | "The look": what the costume needs |
| Coming soon trailer | Features not open yet (The Mirror, pricing, legal) |
| Admission | Pricing (Premium) |
| End credits | Footer ("The end?") |

### Principles

1. **The preset is the foundation.** Zinc darkness, blood-red primary, Space Grotesk, Noto Sans,
   Geist Mono, square corners, uppercase tracked buttons. Everything here extends it.
2. **Dread through restraint.** Darkness, negative space, slow light. One scare per screen: each
   viewport gets at most one attention-grabbing effect; everything else is calm and typographic.
3. **Clarity beats spookiness where people act.** Forms, errors, buttons and prices are plain and
   instantly readable. Atmosphere lives around them, never on them.
4. **Color means something.** Red = action or danger. Ember orange = your Pumpkin Basket. Zinc =
   structure. Nothing is colored for decoration alone.
5. **Motion is slow and physical, and always optional.** Things emerge from the dark; nothing
   bounces. Every ambient effect switches off under `prefers-reduced-motion`.
6. **Every language is first-class.** No uppercase baked into copy, no fixed-width text boxes,
   CJK gets its own rhythm.
7. **Fast in the dark.** Text is the hero (fast LCP). Ambience is CSS on the compositor; JavaScript
   only for interaction.

---

## 2. Brand

### 2.1 Name and wordmark

- Name: **Kostuma** (never translated). Written `Kostuma` in running text.
- Wordmark: `KOSTUMA` in Space Grotesk 700, uppercase, tracking `0.28em`. The **O is replaced by a
  solid disc** in `--blood` (red-600), the size of the cap height, with a soft red glow: a moon, a
  pupil, a recording light. Reads as `K●STUMA`.
- Accessible name `Kostuma` (the letters are `aria-hidden`, the link has `aria-label`).
- Hover (fine pointer): the disc beats once (scale 1 → 1.18 → 1, 600 ms, heavy ease) and its glow
  swells. Reduced motion: no beat.
- Favicon / app icon: the disc alone, red-600 on zinc-950, 12 % padding. Maskable variant with
  20 % safe area.

### 2.2 Voice

Short. Ominous. Confident. Second person, present tense. A little wry, never cheesy.

- Wordplay at most once per page: "Behind the screams", "The night is young", "New blood".
- Actions and errors say **what happened and what to do**, in that order. Flavor, if any, comes
  after and is optional ("Wrong email or password." not "The spirits reject you.").
- Never gory in UI copy, never mocking victims, no ableist words ("insane", "psycho" as insults;
  film titles such as *Psycho* are fine as titles).
- Sentence case in every message. Uppercase is applied by CSS only where the design calls for it,
  so translations never inherit forced caps.
- The brand name, character names and film titles are never translated by us (they come from the
  catalog, which may carry official localized titles later).

### 2.3 Legal lines (always in the footer)

- Content warning: "Horror imagery. Not intended for children."
- "Character names and film titles belong to their owners. Kostuma is not affiliated with any
  studio or retailer."
- © year Kostuma · support email.

---

## 3. Color

### 3.1 Preset tokens (from `app/globals.css`, `.dark`, always on)

| Token | Value | ≈ | Use |
| --- | --- | --- | --- |
| `--background` | oklch(0.141 0.005 285.823) | zinc-950 `#09090b` | Page. The void. |
| `--foreground` | oklch(0.985 0 0) | `#fafafa` | Primary text, icons. |
| `--card` / `--popover` | oklch(0.21 0.006 285.885) | zinc-900 `#18181b` | Raised surfaces, fields, menus. |
| `--secondary` / `--muted` / `--accent` | oklch(0.274 0.006 286.033) | zinc-800 `#27272a` | Hover fills, chips, skeletons. |
| `--muted-foreground` | oklch(0.705 0.015 286.067) | zinc-400 `#9f9fa9` | Secondary text, metadata. |
| `--primary` | oklch(0.444 0.177 26.899) | red-800 `#9f0712` | Primary buttons, selected states. |
| `--primary-foreground` | oklch(0.971 0.013 17.38) | red-50 | Text on primary. |
| `--destructive` | oklch(0.704 0.191 22.216) | red-400 `#ff6467` | Error text and icons. |
| `--border` | white / 10 % | | Hairlines, dividers, card edges. |
| `--input` | white / 15 % | | Preset field border (see 3.3). |
| `--ring` | oklch(0.552 0.016 285.938) | zinc-500 | Preset ring (see 3.3). |
| `--chart-1…5` | red-300, 500, 600, 700, 800 | | The **red ramp** used for glows and light. |

### 3.2 Extensions (added in `:root`, theme-independent)

Only one new hue (ember, for the basket's pumpkin). The rest are named aliases of the preset's
own red ramp so intent is readable in code.

| Token | Value | Use |
| --- | --- | --- |
| `--blood` | = `--chart-3` (red-600) | Wordmark disc, rim light, glows, "REC" dots. Never body text. |
| `--blood-text` | = `--chart-2` (red-500) | Red text that must be readable (≥ 5:1). |
| `--premium` | = `--chart-1` (red-300) | Premium badge text/border. |
| `--ember` | oklch(0.705 0.187 47.604) (orange-500) | The lit pumpkin: basket icon, count badge. Nothing else. |
| `--field-border` | white / 40 % | Borders of inputs, textareas, checkboxes (a11y, 3.3). |
| `--focus` | = `--foreground` | Focus outline color. |

### 3.3 Contrast (measured, WCAG 2.2)

| Pair | Ratio | Verdict |
| --- | --- | --- |
| foreground on background | 19.1 | Body text |
| muted-foreground on background / card | 7.6 / 6.8 | Secondary text OK |
| red-500 (`--blood-text`) on background / card | 5.2 / 4.7 | Red text OK (≥ 4.5) |
| red-400 (`--destructive`) on background | 6.9 | Error text OK |
| red-300 (`--premium`) on background | 10.4 | OK |
| ember on background | 6.9 | OK |
| red-50 on red-800 (primary button) | 7.6 | OK |
| **red-800 (`--primary`) as text on background** | **2.4** | **Never use as text.** |
| red-600 (`--blood`) as text | 4.2 | Large display text only (≥ 24 px), else decorative |
| white/15 % field border (preset `--input`) | 1.5 | Fails 1.4.11 → fields use `--field-border` (white/40 %, 3.8) |
| zinc-500 ring at 30 % alpha (preset focus) | < 3 | Fails → focus uses `--focus` outline (19:1) |

Rules:

- Red text is `--blood-text` or `--destructive`, never `--primary`.
- Borders that only decorate (cards, dividers) keep `--border` (10 %). Borders that identify a
  control (inputs, checkboxes, outline buttons) use `--field-border`.
- Focus: `outline: 2px solid var(--focus); outline-offset: 2px` on every interactive element
  (`:focus-visible`). On red buttons the white outline still reads at 7:1+.

---

## 4. Typography

### 4.1 Families (preset, via `app/fonts.ts`)

| Role | Family | Variable | Notes |
| --- | --- | --- | --- |
| Display & headings | Space Grotesk | `--font-heading` | Big, uppercase, tight. Horror poster energy through scale and spacing, not a "spooky" face. |
| Body & UI | Noto Sans | `--font-sans` | Everything readable. |
| Labels, metadata, numbers | Geist Mono | `--font-mono` | "Case file" details: ranks, years, credits labels, units. |
| Chinese fallback | system CJK | — | `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC"` appended to every stack. No web font download for CJK. |

### 4.2 Scale (fluid)

| Style | Family | Size | Line height | Tracking | Weight | Case |
| --- | --- | --- | --- | --- | --- | --- |
| `display-xl` (home H1) | heading | clamp(3rem, 8.5vw, 8rem) | 0.88 | -0.03em | 600 | upper |
| `display` (page H1) | heading | clamp(2.5rem, 6vw, 5rem) | 0.92 | -0.02em | 600 | upper |
| `h2` (section) | heading | clamp(1.75rem, 3.5vw, 3rem) | 1 | -0.01em | 600 | upper |
| `h3` (card/name) | heading | 1.25rem | 1.15 | -0.005em | 600 | upper |
| `lead` | sans | 1.25rem | 1.6 | 0 | 400 | sentence |
| `body-lg` (lore) | sans | 1.125rem | 1.75 | 0 | 400 | sentence |
| `body` | sans | 1rem | 1.6 | 0 | 400 | sentence |
| `small` | sans | 0.875rem | 1.5 | 0 | 400 | sentence |
| `label` | mono | 0.75rem | 1.4 | 0.2em | 500 | upper |
| `micro` | mono | 0.6875rem | 1.4 | 0.24em | 500 | upper |
| `numeral` (countdown) | heading | clamp(2.5rem, 7vw, 5.5rem) | 1 | -0.02em | 500 | tabular-nums |

### 4.3 Rules

- Measure: body text 60–70ch; lore ≤ 65ch.
- Numbers that change (countdown, counts) use `tabular-nums` and fixed-width cells: no jitter.
- Uppercase only through CSS (`uppercase` utility) on headings, labels and buttons.
- `:lang(zh-Hans)`: `letter-spacing: normal` on everything (tracking utilities neutralized),
  headings line-height +0.12, body line-height 1.8, no italics.
- Spanish runs ~25 % longer than English: no fixed widths on text containers or buttons; buttons
  may wrap to two lines on narrow screens rather than truncate.
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
  (grain, vignette) 60, `pointer-events: none` · toasts 70 · skip link 80.

---

## 6. Shape, surface, texture

- **Square corners everywhere** (`rounded-none`), as the preset's components do. The one
  exception: circles that are circles (the wordmark disc, the countdown's leader ring, avatar
  disc).
- Hairlines: 1 px `--border`. Sections are separated by space first, a hairline second.
- Elevation is light, not shadow: raised surfaces are `--card`; focus and hover add a faint red
  inner glow (`box-shadow: inset 0 -40px 60px -40px color-mix(in oklch, var(--blood) 35%,
  transparent)`), never drop shadows.
- Texture comes from the atmosphere layers (section 8), not from surfaces.

---

## 7. Motion

### 7.1 Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ease-dread` | cubic-bezier(0.16, 1, 0.3, 1) | Entrances, reveals (expo out: fast start, long settle). |
| `--ease-heavy` | cubic-bezier(0.65, 0, 0.35, 1) | Toggles, overlays, the heartbeat. |
| `--duration-fast` | 150 ms | Color and opacity on hover/press. |
| `--duration-base` | 300 ms | Small state changes, menus. |
| `--duration-slow` | 700 ms | Reveals. |
| `--duration-glacial` | 1200 ms | Image drift on hover. |
| Stagger | 60 ms, max 12 items | Grids and lists. |

### 7.2 Patterns

- **Emerge (reveal):** opacity 0 → 1, `translateY(16px)` → 0, `blur(8px)` → 0, 700 ms
  `--ease-dread`, once, when 10 % in view. Never on the LCP element.
- **Press:** buttons `translateY(1px)` (preset) and 150 ms color.
- **Card hover (fine pointer):** image `scale(1.05)` over 1200 ms; red rim light rises from the
  bottom (opacity 0 → 1, 300 ms); a 1 px red line draws under the name (`scaleX` 0 → 1 from the
  left, 400 ms).
- **Heartbeat:** scale 1 → 1.06 → 1 → 1.03 → 1 over 1000 ms (lub-dub), used only by the wordmark
  disc on hover and the lit pumpkin when an item is added.
- **Ignite (basket add):** pumpkin goes from outline to ember fill with a 600 ms flicker (opacity
  0.4 → 1 → 0.7 → 1) and the count rolls up (old number slides up and out, new one in).
- **Overlay (mobile menu):** backdrop fades in 300 ms; items emerge with 60 ms stagger; closing is
  200 ms fade, no stagger.

### 7.3 Reduced motion and photosensitivity

Under `prefers-reduced-motion: reduce`:

- Reveals become a 150 ms opacity fade (no movement, no blur).
- Ambient loops stop (grain frozen, fog still, no glow breathing, no leader sweep, no drip).
- The flashlight effect is replaced by a static, faint reveal.
- Hover zooms are removed; color changes stay.

Always, regardless of settings: no element flashes more than 3 times per second; flicker
changes opacity by at most 10 % of the layer and never involves red saturated fields larger than
a card (WCAG 2.3.1, red-flash threshold).

---

## 8. Atmosphere layers

Fixed, full-viewport, `pointer-events: none`, `aria-hidden`, rendered once in the root layout.

1. **Grain.** An SVG `feTurbulence` tile (data URI, `baseFrequency 0.8`, 4 octaves, grayscale)
   on a pseudo-element 200 % of the viewport, opacity 0.06, normal blending (no
   `mix-blend-mode`: it would force expensive repaints). Animated by `transform: translate()` in
   `steps(6)` over 800 ms: film grain dance. Frozen under reduced motion.
2. **Vignette.** `radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0 / 0.55) 100%)`.
3. **Projector glow** (home hero only, not global): a red-800 radial glow from the top center at
   18 % opacity, breathing 0.14 → 0.2 over 8 s `--ease-heavy`, alternate.
4. **Fog** (home hero and footer only): two or three blurred ellipses (zinc-400 at 6 %, red-800 at
   10 %, `filter: blur(60px)`), drifting horizontally 40–90 s, alternate. Transform only.
5. **Flashlight** (home hero only): a hidden layer with a giant outline phrase (message
   `Home.hidden`, e.g. "We all wear masks") revealed through a 260 px radial mask that follows the
   pointer (`--x`/`--y` CSS vars updated in `requestAnimationFrame`). On touch / no hover the
   mask drifts slowly on its own (Lissajous path, 20 s). Reduced motion: the phrase sits static at
   5 % opacity, no mask. The phrase is decorative and `aria-hidden`.

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
- Art direction: zinc-950 room. A tall, anonymous hooded figure, faceless, stands center, lit from
  behind by a red rim light (red-600 → red-800) that spills onto floor fog. Film grain. No text,
  no character features: *the costume is waiting for whoever wears it*. Works under a bottom
  gradient that carries the card's text.
- Alt policy: while it's a placeholder, the image is decorative (`alt=""`); the character's name
  is always in text next to it. Real photos later get `alt="{Character} costume"`.
- OG images are generated (next/og) in the same language: zinc-950, red rim glow, rank in mono,
  name in Space Grotesk, film in muted text, wordmark bottom-left. 1200 × 630.

---

## 10. Components

Client components are marked (C). Everything else renders on the server.

### 10.1 Primitives

- **Button** (preset cva, extended): variants `default` (red-800, red-50 text), `outline`
  (`--field-border`), `secondary` (zinc-800), `ghost`, `link`, `destructive`. Sizes preset.
  Loading state: spinner (Remix `loader-4-line`, spin 800 ms linear) replaces the leading icon,
  label switches to the "…ing" message, `aria-busy`. Minimum hit area 44 × 44. Links styled as
  buttons use Base UI `render` + `nativeButton={false}`.
- **Badge**: mono `micro`, uppercase, 1 px border, square.
  - `soon` — border white/20, text muted: "Soon".
  - `premium` — border `--premium` at 40 %, text `--premium`, crown icon (`vip-crown-2-line`):
    "Premium".
  - `new-blood` — border `--blood-text` at 40 %, text `--blood-text`, fire icon: "New blood"
    (the 2024–2026 breakouts marked 🔥 in the catalog). `title`/sr text: "A 2024–2026 breakout".
  - `count` — ember background, zinc-950 text (basket count).
- **Field** (label + control + hint + error): label `small` 500 always visible above the control;
  hint muted `small`; error `--destructive` `small` with an alert icon, linked by
  `aria-describedby`, control gets `aria-invalid`.
- **Input / Textarea**: `--card` fill, 1 px `--field-border`, 44 px tall, 12 px padding, square;
  hover border white/55 %; focus `--focus` outline; invalid border `--destructive`. Textarea shows
  a live character count `n / max` (mono micro).
- **Password input** (C): input + show/hide toggle button (eye icons, `aria-pressed`, label
  "Show password"/"Hide password").
- **Checkbox**: 20 px square, `--field-border`, checked = red-800 fill + red-50 check; label to
  the right, clickable.
- **Segmented control** (C): radio group rendered as joined square tabs; selected = zinc-800 fill
  + 2 px red-600 bottom bar; arrow keys move selection.
- **Select** (locale): native `<select>` (dark via `color-scheme`) for robustness, styled like
  Input. Compact header variant shows a globe icon + current endonym.
- **FormAlert**: whole-form message, `role="alert"`, 1 px destructive border at 40 %, destructive
  text, alert icon. Success variant: foreground text, check icon, border white/20.
- **Skeleton**: zinc-800 blocks with a slow sheen (1.6 s); static under reduced motion.

### 10.2 Brand and shell

- **Wordmark** (2.1).
- **Header** (C for scroll state + menu):
  - Left: wordmark → home. Desktop nav: Costumes · The Mirror (`soon`) · Pricing (`soon`).
  - Right: Pumpkin Basket button (icon + `count`, label "Pumpkin Basket, 3 saved"), locale
    select (compact), account: "Sign in" (ghost) or a square avatar with initials → menu
    (Account, Sign out).
  - Transparent over the home hero; after 24 px of scroll (and on every other page) it becomes
    `--background` at 80 % + `backdrop-blur-md` + bottom hairline.
  - Mobile (< md): wordmark, basket, menu button. Menu = full-screen overlay (`--background` 96 %),
    big `h2` links with stagger, locale select and account actions at the bottom. Focus trapped,
    Escape closes, focus returns to the menu button, body scroll locked.
- **Skip link**: first focusable, "Skip to content", visible on focus, jumps to `<main id>`.
- **Footer**:
  - Sign-off line in `display` size, outline text (1 px `--muted-foreground` stroke, transparent
    fill; fills to foreground on hover): "The end?" (message).
  - Columns: Explore (Costumes, Pumpkin Basket, The Mirror `soon`), Help (Report a bug, Share
    feedback, Request a feature, support email), Fine print (Terms `soon`, Privacy `soon`).
  - Locale select. Legal lines (2.3). Fog layer behind.
- **Section heading**: `label` overline (mono, muted, e.g. "01 — Most wanted") + `h2` + optional
  lead + optional right-aligned link ("See all 100 →").
- **Breadcrumb**: mono `label`, `/` separators, current page `aria-current="page"`.

### 10.3 Feature components

- **Countdown** (C): see 11.1.
- **CostumeCard**:
  - `article` with a stretched link (the name link's `::after` covers the card) so the whole card
    is clickable without nesting interactive elements.
  - 4:5 image, bottom gradient (`--background` → transparent, 55 % height).
  - Top-left: rank `No. 001` (mono label). Top-right: basket toggle (C) above the stretched link
    (`z-10`), 40 × 40 with a 44 px hit area, `aria-pressed`, label "Save {name} to your Pumpkin
    Basket" / "Remove {name} from your Pumpkin Basket".
  - Bottom: `new-blood` badge if trending, name (`h3`, 2-line clamp), film + year (mono micro,
    muted).
  - Hover/focus-within motion per 7.2.
- **Basket toggle** (C): outline pumpkin ↔ lit pumpkin, ignite animation on add; announces
  "Saved to your Pumpkin Basket" / "Removed" through a polite live region.
- **Collection toolbar** (C): sticky under the header. Search input (search icon, clear button),
  era chips (All · New blood · Before 1980 · 1980–1999 · 2000–2019 · 2020 and later), sort select
  (Rank · A–Z · Newest · Oldest), live result count ("24 costumes"). State mirrors the URL
  (`?q=&era=&sort=`) with `history.replaceState` so views are shareable.
- **Billing block**: the credits of a costume page, styled like the credit block at the bottom of
  a film poster: centered, uppercase Space Grotesk 500 at 13 px, tight tracking, muted, with
  small mono role labels ("Created by", "Brought to life by").
- **Wardrobe list** ("The look"): the catalog's look text split into items, each with a thin
  square bullet, `body`. Reads as a shopping checklist.
- **Store links**: "Find this costume" group of outline buttons, one per store, each ending with
  an `arrow-right-up-line` icon and sr-only "(opens in a new tab)"; `target="_blank"`
  `rel="noopener noreferrer nofollow"` (+ `sponsored` when a link is an affiliate link).
- **Empty state**: centered icon (64 px, muted), `h3`, one line of copy, one action.
- **Coming soon panel**: see 11.9.
- **Premium price line**: "2 free transformations. Then {price} per costume." `{price}` is USD 5,
  formatted by the locale's currency formatter (next-intl `format.number(5, {style: "currency",
  currency: "USD"})`), never a hardcoded "$5" string.

---

## 11. Pages

All pages: header, `<main id="content">`, footer, atmosphere layers. Titles through
`generateMetadata` (`%s · Kostuma`). Auth/account/coming-soon/legal-soon pages are `noindex`.

### 11.1 Home `/`

1. **Hero (title card)** — min-height `100svh` (max 60rem), content bottom-left aligned on desktop,
   centered on mobile. Projector glow + fog + flashlight layer.
   - Overline (`label`, muted): "Halloween · {Saturday, October 31}" (date formatted per locale).
   - H1 `display-xl`: "The darkest day is coming." (message `App.taglineLead`).
   - Line 2 `h2` in `--blood-text`: "Transform into a monster." (`App.taglineTail`).
   - **Countdown** (film leader): four cells, Days · Hours · Minutes · Seconds, `numeral` digits
     over `micro` unit labels, separated by vertical hairlines. The seconds cell sits inside a
     thin circle with a conic red sweep that turns once per second, the film-leader nod. Server
     renders `--` placeholders at final size (no layout shift); the client fills in the visitor's
     local time. Targets the next Oct 31 at 00:00 local; on Oct 31 it shows "Tonight." in
     `display` red and "The darkest day is here."; after Halloween it counts to next year.
     `role="timer"`, `aria-live="off"`, and a visually hidden sentence updated once per minute
     for screen readers ("31 days, 4 hours until Halloween").
   - Actions: primary "Browse the costumes" → `/costumes`; secondary outline "Try it on" with
     `soon` badge → `/try-on`.
   - Scroll cue: mono micro "Scroll" above a 48 px line that drips downward (2.4 s loop; hidden
     under reduced motion).
2. **Most wanted** — section heading "01 — Most wanted" / "This season's most wanted" / link "See
   all 100". Grid: top 8 by rank (2 / 3 / 4 columns).
3. **New blood** — "02 — New blood" / "Fresh from the screen": the trending costumes in a
   horizontal scroll-snap row (cards 70 % width on mobile, 4 visible on desktop), arrow buttons
   on desktop.
4. **How it works** — "03 — How it works", three steps with huge mono numerals `01 02 03`:
   Choose your monster (browse) · See yourself transformed (The Mirror, `soon` + `premium`) · Get
   the costume (store links).
5. **The Mirror teaser** — split layout: left copy ("Coming soon", `h2` "The Mirror", one
   paragraph: upload one full-body photo and one face close-up, see yourself in the costume with
   special-effects makeup; price line; button "Learn more" → `/try-on`); right an oval mirror
   frame (double hairline) holding the placeholder figure behind slow fog.
6. **Final call** — centered `display`: "Who will you become?" + primary button to costumes.

### 11.2 Costumes `/costumes`

- H1 `display` "The most wanted", lead "100 horror characters people want to become this
  Halloween."
- Collection toolbar (10.3), then the grid (2 / 3 / 4 columns). All 100 cards are server-rendered
  (crawlable); filtering happens in the browser.
- No results: empty state "Nothing lurks here." / "Try another name or film." / "Clear filters".

### 11.3 Costume `/costumes/[slug]`

- Breadcrumb Costumes / {name}.
- Desktop two columns (5 / 7): left sticky image (4:5) with the rank as a huge outline numeral
  behind it (`display-xl`, 8 % opacity); right content. Mobile: image then content.
- Content, in order:
  - `label` "No. 001 · Most wanted" + `new-blood` badge.
  - H1 `display`: the character.
  - Film line: film icon + "Scream (1996)" (lead, muted).
  - Actions: basket toggle as a labelled button ("Save to Pumpkin Basket" / "Saved"),
    "Try it on" outline with `soon` + `premium` → `/try-on?costume={slug}`.
  - **The lore** (`label` + `body-lg`).
  - **The look** (wardrobe list).
  - **Find this costume** (store links).
  - **Behind the screams** (fun fact, `body`, inside a left hairline in `--blood`).
  - **Credits** (billing block).
- Prev / next by rank ("← No. 000 {name}" / "{name} No. 002 →").
- "More from {film}" when the film has other characters, else "More most wanted" (next 4).

### 11.4 Pumpkin Basket `/basket`

- H1 "Your Pumpkin Basket", count, note "Saved on this device." (muted small).
- Rows: thumbnail (4:5, 72 px wide), name + film, actions: "Find it" (first store link),
  "Remove" (ghost, icon). "Clear basket" asks for a second click ("Click again to clear") within
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

- H1 "Your account". Profile block: name, email (mono), member since.
- "The Mirror" block: "2 free transformations waiting" + `soon` + price line.
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

Centered: `label` "404", `display` "Lost in the dark", one line, button "Back to Kostuma". Fog.

### 11.9 Coming soon pages

Shared panel ("trailer"): `label` with a blinking red REC dot (1 Hz, static under reduced
motion) "Coming soon"; `display` title; lead; up to 3 feature bullets; primary action back to
something that works now; secondary "Want it sooner? Tell us." → `/feedback?type=feature`.

| Route | Title | Content |
| --- | --- | --- |
| `/try-on` | The Mirror | What it does (one full-body photo + one face close-up → you in the costume with special-effects makeup), `premium` badge, price line, privacy note ("Your photos stay private."), CTA browse. Accepts `?costume=` to name the costume. |
| `/pricing` | Admission | Two columns: Free (browse, basket, feedback) / Premium (`premium`: 2 free transformations, then {price} per costume). Both marked `soon` where relevant. |
| `/terms` | Terms of service | "The fine print is being written." + support email. `noindex`. |
| `/privacy` | Privacy policy | Same pattern; states plainly what is stored today (account email and name, feedback messages) + support email. `noindex`. |

---

## 12. Patterns

- **Premium**: any paid capability shows the `premium` badge next to its first mention on a
  screen, and the price line near its call to action. Never hide the price.
- **Coming soon**: never a disabled button (unfocusable, unexplained). Use a working link to the
  coming-soon page with a `soon` badge.
- **External links**: new tab, `noopener noreferrer`, icon + sr-only "(opens in a new tab)".
- **Loading**: skeletons for content, spinners only inside buttons. No full-page spinners.
- **Errors**: say what happened and what to do; keep the user's input; focus moves to the first
  invalid field (or the form alert) after submit.
- **Live regions**: result counts and basket changes announce politely; form alerts assertively.

---

## 13. Accessibility checklist (WCAG 2.2 AA)

- Contrast per 3.3; focus visible everywhere (`--focus`, 2 px, offset 2 px).
- Targets ≥ 44 × 44 px.
- Landmarks (`header`, `nav` with labels, `main`, `footer`), one H1 per page, ordered headings.
- Skip link; logical tab order; mobile menu traps focus and restores it.
- Forms: visible labels, `autocomplete` (`name`, `email`, `current-password`, `new-password`),
  errors linked, no placeholder-only labels.
- Motion and flashing per 7.3.
- `lang` on `<html>` (`en`, `es`, `zh-Hans`) and on endonyms in the language list.
- Decorative images and atmosphere `aria-hidden` / `alt=""`.
- Content works without JavaScript for reading (catalog, costume pages); interactive features
  degrade to links.

---

## 14. Internationalization

- Every visible string is a message (`messages/en.json` first; `es`, `zh` fall back to English
  until translated).
- Dates, numbers, currency via next-intl formatters (countdown date, counts, price).
- Messages in sentence case; CSS applies uppercase.
- Endonyms in the locale select: English · Español · 中文, each with its own `lang`.
- Test layouts with the longest language (Spanish) and with CJK line breaking (Chinese).

---

## 15. Performance budgets

| Metric | Budget |
| --- | --- |
| LCP (4G, mid phone) | ≤ 2.0 s; the home LCP is the H1 text, visible from first paint (never starts at opacity 0) |
| CLS | ≤ 0.02 (reserved sizes for countdown, reCAPTCHA, images) |
| INP | ≤ 200 ms |
| JS per route | ≤ 120 KB gz shared + ≤ 40 KB route |
| Fonts | 3 variable families, Latin subsets, `display: swap`; CJK from the system |

- Ambient effects: CSS, `transform`/`opacity` only, no `mix-blend-mode` on full-screen layers.
- `motion` only in client islands, through `LazyMotion` + `domAnimation` + `m.*`.
- Images: `next/image`, explicit `sizes`, `priority` only on the costume page image.

---

## 16. Implementation map

| Piece | Where |
| --- | --- |
| Tokens (extensions, motion) | `app/globals.css` `:root` + `@theme inline` |
| Fonts | `app/fonts.ts` (preset) |
| Atmosphere | `components/horror/{grain,vignette,fog,projector-glow,flashlight}.tsx` |
| Shell | `components/layout/{header,mobile-menu,footer,wordmark,skip-link}.tsx` |
| Primitives | `components/ui/*` (shadcn style, cva) |
| Feature components | `components/{costume,basket,auth,forms,countdown}/*` |
| Placeholder art | `design/costume-placeholder.svg` → `public/images/costume-placeholder.{avif,webp}` |
| Visual review | Playwright screenshots at 375, 768, 1280 px for every page, checked before each commit |

---

## 17. Later

Real costume photography (per-costume art direction) · The Mirror flow (upload guide, progress
as a "developing film" animation, result reveal) · Stripe checkout styled as a ticket stub ·
translations · optional opt-in ambient sound (never autoplay) · view transitions between cards
and costume pages.
