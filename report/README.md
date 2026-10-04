# Kostuma pre-launch audit

An outside review of Kostuma, done on 2026-10-04 on branch `feat/audit` (code at commit
`7fd4bd8`, "feat(basket): Buy leads to the shops that have each costume"). It looks at the
product from five angles: engineering, security and privacy, design and UX, copy and content,
and product–market fit. Then it lists what YouCam and free tools could add.

The brief was to **enhance the product, not change what it is**. Every suggestion keeps the
owner's flow (Browse → My Pumpkin Basket → Fitting Room → Buy), the owner's names, dark-only
design, and the owner's rules for the makeup guides (face pictures come only from YouCam's
Makeup VTO and Hair Color; nothing is ever drawn on a visitor's picture). Where a suggestion
adds anything visible, it is marked as a **proposal** for the owner to accept or reject.

## How to read this

| File                                                       | What's in it                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------ |
| [01-engineering.md](01-engineering.md)                     | Architecture, YouCam pipeline, scale, performance, reliability, CI |
| [02-security-privacy.md](02-security-privacy.md)           | Vulnerabilities, abuse, auth, dependencies, privacy and legal      |
| [03-ui-ux.md](03-ui-ux.md)                                 | Layout bugs, flows, accessibility, phones, languages               |
| [04-copy-content.md](04-copy-content.md)                   | Typos, wrong facts, contradictions, voice, the makeup guides       |
| [05-product-market-fit.md](05-product-market-fit.md)       | Audience, timing, funnel, unit economics, measurement, positioning |
| [06-missed-opportunities.md](06-missed-opportunities.md)   | What YouCam and free tech could add, checked against the rules     |
| [07-action-plan.md](07-action-plan.md)                     | Everything above as one ordered checklist                          |
| [appendix-method-evidence.md](appendix-method-evidence.md) | What was run, measured and verified, and how to reproduce it       |

Every finding has an id (`ENG-01`, `SEC-02`, `UX-03`, `COPY-04`, `PMF-05`, `OPP-06`) so it
can be referenced in tickets and commits, and a priority:

| Priority | Meaning                                                                      |
| -------- | ---------------------------------------------------------------------------- |
| **P0**   | Launch blocker. Fix before real visitors arrive.                             |
| **P1**   | High. Fix before launch if at all possible, else in the first days after it. |
| **P2**   | Medium. Quality, scale or conversion; plan it for the next weeks.            |
| **P3**   | Low. Polish, hygiene, nice to have.                                          |

Effort is given as **S** (under half a day), **M** (one to two days) or **L** (three days or
more).

## The verdict in one paragraph

Kostuma is unusually well built for an MVP: strict security headers and a nonce-based CSP,
server-only secrets, every input validated twice, private photos served only to their owner,
1,929 passing unit tests, a large end-to-end suite, **zero** automated accessibility
violations, and everything translated into three languages. The design has a strong,
coherent horror identity, and the 82 makeup guides are a real asset. What stands between
this MVP and a safe launch is mostly **operational**: the Fitting Room will run into YouCam's
rate limit with only two or three people using it at once, nothing caps or monitors YouCam
spending, free try-ons can be farmed with throwaway accounts, one dependency has a critical
advisory, and production (`main`) doesn't contain any of the work since `feat/basket` yet.
Halloween is 27 days away, so the order of work matters as much as the work.

## Top 12, in the order to do them

| #   | Id               | What                                                                                                    | Priority | Effort |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------- | -------- | ------ |
| 1   | SEC-01           | Upgrade Next.js 16.3.4 → 16.3.8 (critical advisory in `next/og`, which the social cards use)            | P0       | S      |
| 2   | ENG-01           | Stay under YouCam's rate limit (250 calls / 5 min): throttle status checks, handle 429, queue starts    | P0       | M      |
| 3   | ENG-02           | A unit budget, a kill switch and a low-units alert; never charge visitors for YouCam's outages          | P0       | M      |
| 4   | SEC-02           | Stop free-costume farming (password accounts made outside the register form, unverified emails)         | P0       | S–M    |
| 5   | ENG-10           | Ship the approved stack: merge to `main`, set Vercel env vars, check rules, submit the sitemap          | P0       | S      |
| 6   | UX-01            | The "Choose a photo" button runs off the screen on small phones                                         | P1       | S      |
| 7   | ENG-03           | Infrastructure failures use up the visitor's tries and free costume                                     | P1       | S      |
| 8   | COPY-01, COPY-02 | A broken bullet ("Torn") in three languages; "special-effects makeup included" promises the wrong thing | P1       | S      |
| 9   | ENG-06           | Two photos can exceed the 4 MB upload limit; send them at the size the server keeps                     | P1       | S      |
| 10  | SEC-03, SEC-04   | Face-photo consent, a retention period, and self-serve deletion                                         | P1       | M      |
| 11  | UX-02, UX-03     | On phones, picking a frame changes the mirror off-screen; a finished try-on has no "start at step 1"    | P1       | S      |
| 12  | PMF-03, OPP-17   | Put the makeup guides' words on the costume pages (search traffic in three languages)                   | P2       | M      |

## What is already excellent (keep it)

- **Security baseline**: per-request nonce CSP with `strict-dynamic`, HSTS,
  `frame-ancestors 'none'`, COOP, a tight Permissions-Policy, `server-only` modules, zod on
  every server action, deny-by-default Firestore and Storage rules, owner-scoped picture
  routes with strict id validation, an open-redirect guard, fail-closed reCAPTCHA, hashed
  rate-limit keys, EXIF stripped from photos, YouCam tasks deleted after use.
- **Quality gates**: lint with zero warnings, strict TypeScript, Prettier, 1,929 unit tests,
  about 140 end-to-end tests each run on desktop Chrome and a Pixel 7, emulator suites for
  Firestore rules and real accounts, every message required in all three languages by a test.
- **Accessibility**: axe-core (WCAG 2.2 AA + best practices) found nothing on 12 page states,
  including a finished try-on. Reduced motion stills every loop. Focus is managed on every
  stage change. Controls are named in one translated message each.
- **Design identity**: a coherent "Midnight Picture House" world: the window, the decaying-ink
  countdown, the burnt film strip, the vanity mirrors with bulbs, VHS title cards. It looks
  like nothing else in the category.
- **Content**: 82 researched characters with lore, fun facts and credits, 82 makeup guides
  (510 steps) written in a makeup artist's order, and all of it in Spanish and Chinese.
- **Honest legal pages** that describe what the code actually does.

## Scope and limits

- Code reviewed: every server module, API route, server action, store and rule file, the
  Fitting Room client, and the main UI components; configs, CI and deploy settings.
- The running app was reviewed on the project's own end-to-end build (`E2E=1`, served on
  port 3100), whose stand-ins replace Firebase and YouCam. **No YouCam units were spent, no
  production data was touched, and the owner's dev server was left alone.** Real YouCam
  timings come from the project's own measurements (about 6–10 s per makeup step, about 1.5
  minutes for a Pennywise try-on).
- Facts about 2025–2026 films (box office, awards, events) were not independently verified;
  where something looks wrong it is flagged as "verify", not as an error.
- Legal points are risks to raise with a lawyer, not legal advice.
