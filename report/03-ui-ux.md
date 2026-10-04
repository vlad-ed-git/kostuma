# 03 · Design, UX and accessibility

Reviewed on the production (e2e) build at 360, 390, 1024 and 1440 px wide, in English,
Spanish and Chinese, signed out and signed in, through a whole Fitting Room try-on (fake
renders). The design is approved and the design spec is the project's law; items that would
change what is on screen are marked **proposal** for the owner to accept or reject.

## What works

- **A world, not a template.** The red window and hooded figure, fog, the decaying-ink
  countdown, the burnt film strip under the tagline, the blood drip, the vanity mirrors with
  bulbs, the rail of hangers and the VHS title cards all belong to one place. The horror is
  visible in the first second, as the owner asked.
- **The Fitting Room reads as a dressing room**, with one clear type ladder (display title →
  stage title → step title → small capitals → body). The film strip of pictures with
  silhouettes "developing" is a lovely touch.
- **Accessibility is excellent.** axe-core 4.10 (WCAG 2.0/2.1/2.2 A and AA plus best
  practices) found **zero violations** on 12 page states, including the photo stage and a
  finished try-on. A skip link, focus moved to each new stage's heading, live regions for
  basket changes, translated accessible names, `prefers-reduced-motion` respected, 44 px
  targets, no horizontal scroll anywhere except UX-01.
- **Errors are humane and translated**; no raw error text ever reaches a visitor.
- **Clean console**: no errors, warnings or CSP violations while walking every page.

## Findings

### UX-01 · "Choose a photo" runs off the screen on small phones — P1, S

**Where:** `components/fitting-room/photo-picker.tsx:97-138` (the mirror and the button side
by side on phones).

Measured at 360 px wide (many Android phones): the face photo's button spans **196→385 px**,
so 25 px of it is cut off by the screen edge (the page clips sideways overflow), and the body
photo's button ends at 371 px. At 390 px the face button already touches the edge, past the
16 px gutter. This is the step every Fitting Room visitor must pass.

**Fix:** below ~420 px, put the button under the mirror (full width) instead of beside it, or
let its label wrap; or use the short label ("Choose") on phones while keeping the full
accessible name.

### UX-02 · On phones, picking a frame changes things off-screen — P1, S

**Where:** `components/fitting-room/try-on-steps.tsx:131` (grid areas: mirror, card, strip).

On phones the film strip sits below the step card. Tapping a frame updates the mirror and the
card **above**, out of view: the only visible change is the highlighted frame. Visitors will
tap again and again thinking nothing happened.

**Fix:** after a tap, scroll the mirror into view (instantly under reduced motion), or on
phones order the areas mirror → strip → card so the strip sits right under the mirror.

### UX-03 · A finished try-on has no way to "start the guide" — P1, S

**Where:** `components/fitting-room/try-on-steps.tsx:209-238`, `lib/fitting-room/frames.ts:42`.

When the try-on is done, the mirror shows the whole transformation (as the owner wants) and
the card shows **"Step 6 of 6"** with only "Previous step". But the visitor's next job is to sit
at the vanity and follow step 1. They have to discover that "Outfit" or "1" in the strip starts
the guide.

**Fix:** keep the final picture as the reveal, and add one button when the try-on is done and
the last frame is shown: "Start with step 1" (or "Follow the guide"), which jumps to the first
makeup frame.

### UX-04 · The confirm screen doesn't say it uses the free costume — P1, S

**Where:** `components/fitting-room/fitting-room.tsx:487-553`, `FittingRoom.confirm.line`.

"Check your photos first: once the try-on starts, they can't be changed until it's finished."
But starting also spends the account's **only** free costume: afterwards, no other costume can
be tried on without Kostuma Pro. A visitor who tries a costume casually, to see how it works,
loses the one they actually wanted, and will feel tricked.

**Fix:** one more sentence while the costume is free: "This is your free costume. Once it's
done, trying on another needs Kostuma Pro." (en/es/zh).

### UX-05 · In the basket, "Try on" looks weaker than "Remove" — P2, S

**Where:** `components/basket/basket-list.tsx:160-188`.

"Try on" (the product's reason to exist) is muted grey small capitals; "Remove" next to it is
bright. The eye goes to the destructive action. Swap the emphasis: "Try on" in the foreground
or blood color, "Remove" muted.

### UX-06 · On the home page, the link doesn't look like a link — P2, S

**Where:** `app/[locale]/page.tsx:89-101`.

"Choose your costume" is a link (with the blood drip) and "Try it on" and "Apply makeup" are
plain text, but all three look the same. On touch screens there is no hover to tell them
apart. Give the link a visible affordance (a red underline or an arrow at the end of the
text), or make the drip part of the hit area and point visibly at the list.

### UX-07 · Waiting 1.5–2 minutes with no time and no warning — P2, S (proposal)

**Where:** `components/fitting-room/try-on-steps.tsx:90-135`.

The owner removed the visible status line (it is read to screen readers only), and the
breathing silhouettes say "working". They don't say how long, or that leaving the page stops
the work (ENG-05). Until the server drives try-ons by itself, consider one quiet line under the
mirror while it runs: "This takes about two minutes. Keep this page open." Once ENG-05 is
done, it can become "You can leave: it keeps going."

### UX-08 · Kostuma Pro competes with the free try-on — P2, S (proposal)

**Where:** `components/basket/fitting-room-panel.tsx`, the account page.

Before the free costume is used, the panel shows "Step inside" and "Get Kostuma Pro" as two
equal outline buttons. The visitor hasn't seen any value yet. Suggest "Step inside" as the
primary (filled) button and Pro shown only once the free costume is used (where it already
appears, in the used state, the failure card and the replace pop-up).

### UX-09 · The "used" state doesn't lead back to the costume they used — P2, S

**Where:** `components/fitting-room/fitting-room.tsx:468-485`.

"You tried on Pennywise. Get Kostuma Pro to try on more costumes." Make "Pennywise" (or a small
"See your Pennywise" link) go to `/basket/fitting-room?costume=pennywise`, where the guide they
earned lives. That is the page they will want at the vanity on Halloween night.

### UX-10 · A failed try-on doesn't say what it cost — P2, S

**Where:** `components/fitting-room/fitting-room.tsx:417-439`.

After a failure the visitor reads why and sees "Choose other photos", but not whether the free
costume is still theirs or how many tries are left (`FAILED_TRIES = 2`). One line: "This didn't
use your free costume." / "You have one more try." With ENG-03, most failures won't cost
anything at all, and saying so builds trust.

### UX-11 · Product links don't work well outside the US and English — P2, S

**Where:** `components/fitting-room/try-on-steps.tsx:33-34` (`shopSearch` → amazon.com),
`content/translations/*.json` (products translated).

Every makeup product links to an amazon.com search **with the translated product name**:
a Chinese visitor's "orange hair color spray" searches amazon.com for `橙色染发喷雾`, and a
Spanish one for `spray de color naranja para el cabello`. Results will be poor or empty, and
amazon.com may not ship to the visitor. Keep the translated name as the link text but search
with the English term; later, consider the store for the visitor's country (Vercel gives the
country), within the owner's "one good link" rule.

### UX-12 · Chinese: headlines break inside words, and lose the brand's look — P2, M

**Where:** home tagline in `messages/zh.json`, `app/fonts/`.

At phone width the Chinese tagline breaks as "最黑暗 / 的一天即 / 将来临。", splitting 即将
("about to") across lines. Chinese has no spaces, so the browser may break between any two
characters. Add break points where a break reads well (`<wbr>` or zero-width spaces in the
zh messages) and `word-break: keep-all` on display headings.

Grenze Gotisch and Crimson Pro have no Chinese glyphs, so every Chinese heading falls back to
the system font and the page loses its identity. A free OFL display face with a brush or
woodcut feel (for example from Google Fonts' Chinese families), **subset to the characters the
zh headings use** (a few hundred), would cost tens of kilobytes and bring the horror back.

### UX-13 · The pumpkin "add" button is easy to miss on desktop — P3, S (proposal)

**Where:** `components/costume/costume-row.tsx`, `components/basket/basket-toggle.tsx`.

In the two-column list the pumpkin sits ~350 px to the right of the name, small and grey. New
visitors don't know that a pumpkin means "add to My Pumpkin Basket" until they try it. Ideas
within the minimal style: a tooltip on hover and focus ("Add to My Pumpkin Basket"), the icon
closer to the name, or a slightly larger, brighter pumpkin.

### UX-14 · Blackletter names in dense lists — P3 (proposal, test first)

Grenze Gotisch is one of the most readable blackletters, but at list sizes some capitals are
easy to misread ("N" of "Nikki" reads close to "U"; "M3GAN"). Names are what people scan for.
A five-person test would settle it; if it's a problem, keep blackletter for display titles and
set list names in Crimson Pro small capitals.

### UX-15 · Register asks for more than it needs — P3, S (proposal)

Name, email, password, confirm password, terms and the robot check. "Confirm password" is
redundant when the field has show/hide (it does), and the name is used only for the avatar's
initials. Dropping "Confirm password" removes one field from the main conversion step, in
line with the owner's low-friction principle.

### UX-16 · Small visual and wording nits — P3, S each

- The header's basket count badge crowds the "My Pumpkin Basket" label on desktop (the badge
  sits on the "M").
- "Click again to clear" (`Basket.clearConfirm`): on phones nothing is clicked; "Press again to
  clear" works for both.
- The outfit card says "note down what to buy" (proposal): the Fitting Room lives inside the
  basket, where Buy already is, so the outfit card could show the costume's Buy button right
  there.
- The global 404 has no header; fine and minimal, but a second link, "Costumes", would save a
  click for people who mistyped a costume address.

## Responsive and performance notes

| Check                         | Result                                                                  |
| ----------------------------- | ----------------------------------------------------------------------- |
| Horizontal overflow at 360 px | None, except the photo buttons (UX-01)                                  |
| Home page on phones           | ~15,900 px tall (all 82 costumes); fine by design, but see ENG-07       |
| Lazy images below the fold    | Load correctly on scroll                                                |
| Above-the-fold images         | Lazy-loaded (ENG-09)                                                    |
| reCAPTCHA box                 | Appears after ~3 s in reserved space (no layout shift)                  |
| Motion                        | All loops inside `prefers-reduced-motion: no-preference`; flashes ≤ 3/s |
