# 04 · Copy and content

Everything a visitor reads was reviewed: the 401 interface messages, the 82 costume entries
(lore, fun fact, the look, credits), the 82 makeup guides (510 steps and their "to finish"
notes), the Terms of service and the Privacy policy, and the page titles and descriptions
search engines show. Line numbers refer to `content/costumes.ts`, `content/makeup.ts` and
`messages/en.json` at `7fd4bd8`. A fix to English content usually needs the same fix in
`content/translations/es.json` and `zh.json` (the tests hold them to the English structure).

## What's strong

- **A real house voice** in the right places: "Behind the screams", "The night is young.",
  "This page does not exist, or it has already been claimed by the night.", "Tell us what
  haunts you", "The shadows hear your whispers.", "Developing…". It is horror without being
  silly, and it never gets in the way.
- **Lore and fun facts are well researched** and written for fans: the Captain Kirk mask, the
  Pretty Woman mask's blue eyeshadow on Leatherface, "REDRUM", Milicent Patrick's credit, the
  Craft's Wiccan consultant.
- **The makeup guides are practical**: a makeup artist's order (base, second coat, shading,
  eyes, brows, lips, hair), concrete products, honest "to finish" notes for what makeup can't
  do. Plain, imperative sentences that work at a vanity.
- **Legal pages in plain words** that match the code.
- **Error messages are kind and actionable** ("Your browser blocked the Google window. Allow
  pop-ups for this site, then try again.").

> **Note on "pat":** "Pat a second coat of the white cream face paint…" is correct. To _pat_ is
> the makeup verb for pressing product on with a sponge or fingertips, so it should **not** be
> changed to "put".

## Findings

### COPY-01 · A broken bullet: "Torn" — P1, S

`content/costumes.ts:1465`, Grace (the Bride):
`pieces: ["Torn", "Bloodied wedding dress", "Sneakers", "Revolver"]`. One piece was split in
two, so the costume page lists **"Torn"** as a bullet on its own. The bug is copied into
`es.json` ("Rasgado") and `zh.json` ("撕破的"). Fix: `"Torn, bloodied wedding dress"` in all
three (and see COPY-03 for "Revolver").

### COPY-02 · "Special-effects makeup included" promises the wrong thing — P1, S

`FittingRoom.line`, shown in the basket panel and on the account page: "Try on the outfits in
your basket, special-effects makeup included."

In horror, "special-effects makeup" means blood, wounds, prosthetics and stitches, which is
exactly what the Fitting Room never renders (by the owner's rule they are how-to text). Fans
will expect gore and get makeup. Suggested: "Try on the outfits in your basket, then see the
character's makeup on your own face, step by step." (en/es/zh).

### COPY-03 · The costume card and its guide disagree — P1, S

The costume page's "The look" and the makeup guide's "to finish" describe different outfits:

| Costume  | Costume page (`costumes.ts`)                | Guide's "to finish" (`makeup.ts`)                            |
| -------- | ------------------------------------------- | ------------------------------------------------------------ |
| Hannibal | "Orange jumpsuit and restraint mask" (1110) | "A blue prison jumpsuit, or the white restraint mask" (1728) |
| Grace    | "Revolver" (1465)                           | "…sneakers and a bandolier" (2272)                           |
| Pamela   | "Green cardigan", "50s-style hair" (2402)   | "A cable-knit sweater" (3819), "Natural 80s base"            |

Pick one version each, checked against the film (Grace, for example, carries a shotgun and a
bandolier of shells, not a revolver), and use it in both places and all three languages.

### COPY-04 · Facts to correct or verify — P2, S

| Where                                    | Says                                                                               | Should say (or verify)                                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Pennywise, 179 and 182; Count Orlok, 914 | "Bill Skarsgard", "Skarsgard"                                                      | **Skarsgård** (the name has an å; the site handles Unicode everywhere else, e.g. "Kōji Suzuki")               |
| Pennywise, 182                           | "the highest-grossing horror film ever at the time"                                | _It_ (2017, ~$700M) is still generally cited as the highest-grossing horror film; drop "at the time" (verify) |
| Art the Clown, 144                       | "Terrifier 3 landed Halloween week 2024"                                           | It opened on October 11, 2024                                                                                 |
| Headless Horseman, 1213                  | "Walken had his teeth sharpened"                                                   | He wore sharpened false teeth                                                                                 |
| Mr. Boogie, 2590                         | "Derrickson has said the film was inspired by a nightmare after watching The Ring" | The nightmare was co-writer **C. Robert Cargill**'s                                                           |
| Aunt Gladys, 221                         | "an entire classroom of children vanishes … one surviving boy"                     | All but one child vanish; "the one boy left behind" (nobody is known to be dead)                              |
| The Invisible Man, 2432                  | "This was Rains' film debut"                                                       | His Hollywood debut (he appeared in a 1920 British film)                                                      |
| Victor Crowley, 1820                     | "the deformed ghost of a man accidentally killed by his father's hatchet"          | Victor was a boy when he died                                                                                 |
| Damien, 1764                             | "The 666 birthmark is one of horror's most famous props"                           | A birthmark isn't a prop: "most famous details"                                                               |
| Blade, 2726                              | "fights the blood cult"                                                            | Vague; e.g. "hunts the vampires who secretly run the city's nightlife"                                        |
| Danny Torrance, 2758                     | "communicates with a chef"                                                         | "shares 'the shining' with the hotel's cook, Dick Hallorann"                                                  |
| Jack Torrance, 1073                      | "a former volunteer firefighter"                                                   | Usually told as a former volunteer **fire marshal** (verify)                                                  |

### COPY-05 · Guides that don't match the character — P2, S

- **Ghostface, step 5 "Black nose"** (`makeup.ts:99`): the Ghostface mask has no black nose,
  only black eyes and mouth. Fans will notice. Consider dropping the step (or making it the
  mask's faint gray nose shadow).
- **Dracula (1931) with fangs** (look: "Fangs"; guide finish: "plastic fangs"): Lugosi never
  showed fangs on screen; fangs arrived with Christopher Lee in 1958. Keep them as a practical
  costume extra, but a connoisseur line in the fun fact ("Lugosi never bared fangs on screen")
  would turn a mistake into a delight.
- **Norman Bates**: the guide turns the visitor into "Mother" (gray bun, shawl), while the
  costume's main look is Norman. Name it in the guide's first line so it isn't a surprise.

### COPY-06 · Wording to fix — P2, S

| Where                               | Now                                                            | Suggested                                            |
| ----------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| Pirate Clark lore, 1320             | "… roaming a dimension of endless yellow rooms. Mild spoiler." | Move the warning to the front, or drop it            |
| Pennywise look, 187                 | "Forehead-heavy wig"                                           | "Receding red clown wig"                             |
| Georgie look, 2527                  | "Storm drain" (as a costume piece)                             | "Rubber boots"                                       |
| Leatherface look, 578               | "Skin-mask"                                                    | "Skin mask"                                          |
| Headless Horseman, `makeup.ts:1902` | "File-sharp plastic fangs"                                     | "Sharp plastic fangs"                                |
| The Craft, `makeup.ts:2429`         | "Pluck-thin your brows with concealer…"                        | "Cover the outer half of your brows with concealer…" |
| John Carver lore, 2690              | "Plymouth colony"                                              | "Plymouth Colony"                                    |
| M3GAN look, 702                     | "Mary janes"                                                   | "Mary Janes"                                         |
| Aunt Gladys look, 230               | "90s track suit"                                               | "’90s tracksuit"                                     |
| Several guides                      | "…and add lashes" (products say "false lashes")                | "…and add false lashes"                              |
| Ghostface and others                | "Two coats, and go over the nose again."                       | "Two coats. Touch up the nose with the same color."  |

### COPY-07 · Consistency and typography — P2, S

- **"ax" vs "axe"**: Pearl's look says "Pitchfork or ax" (966); six other places say "axe". Use
  "axe".
- **Decades need an apostrophe**: "70s hair" (1853), "50s-style hair" (2402), "90s track
  suit" (230), and in the guides "Pale 90s base", "Matte 90s base", "Natural 80s base",
  "arched 90s brows", "the 90s way". Write "’70s", "’90s".
- **Quotes**: names use straight quotes, `Nikki 'Freaky Nikki' Freeman`, which look like tick
  marks in Grenze Gotisch at title size. Use typographic quotes: Nikki “Freaky Nikki” Freeman.
  The interface mixes straight apostrophes ("You've") with curly quotes (“I'm not a robot”);
  one typographic pass (’ “ ”) over the messages and content would suit the type design.
- "Curtis' film debut", "Rains' film debut": house style elsewhere is "Craven's"; pick one
  rule for names ending in s ("Curtis's" is the more common modern choice).

### COPY-08 · Statements that will go stale — P2, S

Several facts are dated "as of 2026-09-30" and will be wrong soon after launch, on pages meant
to rank for years: "Navarrette hosts SNL on Oct 31, 2026" (Nikki), "Universal put Nikki in
Halloween Horror Nights Hollywood 2026", "Universal's Halloween Horror Nights Hollywood 2026
has a Sinners house" (Remmick), "A prequel titled Gladys is in the works", "Scream 7 (Feb 2026) opened to $63.6M", award claims for 2026. Rephrase them to stay true ("was announced to
host SNL on Halloween 2026") and put a content review in the calendar for early November.

### COPY-09 · The Kostuma Pro promise is risky — P1, S

`Pro.added` + `Pro.deal`: "You have been added to the premium feature waitlist. We will get
back to you in 24 hours with an awesome deal."

- **"24 hours"** is a service-level promise with a manual process behind it (the owner reads
  `waitlist/{uid}` in the Firebase console). At launch volume, or over a weekend, it will be
  broken, and the visitor's first experience of Kostuma Pro is a broken promise.
- **"deal"** implies a price, while the site promises no prices or payments.
- **"premium feature waitlist"** is a different name from the button they just pressed.

Suggested (the owner's call): "You're on the Kostuma Pro waitlist. We'll write to you at this
email as soon as it opens." If the 24-hour promise stays, automate an acknowledgement email
(OPP-13) so it is always kept.

### COPY-10 · Day or night? — P3 (proposal)

"The darkest **day** is coming." / "The darkest day is here." / then "The darkest **night** has
passed." Halloween is a night (All Hallows' **Eve**), and the after-Halloween line already says
so. "The darkest night is coming." would make the brand line consistent with itself. The
tagline is the owner's own; this is only a suggestion.

### COPY-11 · "Hahaha." — P3 (proposal)

"But you shall stay a monster until Santa comes. Hahaha." The laugh reads as a joke rather than
a threat. A horror fan's version of the same idea: "…until Santa comes. Ho. Ho. Ho." (the
owner's words otherwise unchanged).

### COPY-12 · Safety lives only in the Terms — P1, S

The Terms say "test it on a small patch of skin, keep it away from your eyes unless it's made
for them". The guides themselves ask visitors to glue down their brows, paint the inner rims
white (Pirate Clark), pour stage blood over their head (Carrie) and let fake blood run from
the eyes like tears (Ellen Hutter), with no reminder on screen. One line before step 1,
translated, protects visitors and Kostuma: "Use cosmetic-grade products only, patch-test 24
hours before, and keep paint and fake blood out of your eyes."

### COPY-13 · Search titles and descriptions say too little — P2, S

| Page          | Title / description today                                          | Suggested                                                                                                                 |
| ------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Home          | "Kostuma" / "The darkest day is coming. Transform into a monster." | "Kostuma · Horror movie costumes, tried on you, with step-by-step makeup" / mention the 82 characters and the free try-on |
| Costume pages | "Pennywise costume · Kostuma" / the lore                           | "Pennywise costume and makeup guide · Kostuma" / one line of lore plus "see it on your own face, step by step"            |

Titles aren't on the page, so this doesn't touch the minimal design; it's what decides whether
a searcher clicks.

### COPY-14 · Translations need one native read — P2, M

Spanish and Chinese were produced for this project and are held to the English structure by
tests, which is excellent, but tests can't judge tone or naturalness, and there is at least
one copied bug (COPY-01). Before launch, have one native speaker per language read the home,
the Fitting Room, two or three guides and the legal pages. Horror vocabulary especially:
"Rasgado" for a lone "Torn", and the Chinese headline breaks (UX-12).

### COPY-15 · Where the voice could do more — P3 (proposal)

Neutral copy in places the house voice would shine, kept short:

- `Error.title` "Something went wrong" → "Something went wrong in the dark."
- `FittingRoom.closed` "The Fitting Room is closed right now. Try again later." → "The Fitting
  Room is closed for the night. Come back soon."
- `Basket.cleared` "My Pumpkin Basket is empty." → fine as is (announced to screen readers).
- The three home lines could carry the promise a little more: "Try it on" → "Try it on
  yourself", "Apply makeup" → "Do the makeup, step by step". The film strip shows it; words
  make it certain for a first-time visitor.
