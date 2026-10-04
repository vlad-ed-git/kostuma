# 05 · Product–market fit

## The product in one sentence

Kostuma helps horror fans choose a Halloween costume, see it on themselves, and then **do the
character's makeup at home, step by step, on their own face**, with links to where to buy
everything.

## The job it does, and who for

Horror fans aged 17 and up, planning a look in the two to four weeks before October 31. They
have four jobs. Among the alternatives they reach for, none we know of covers all four in one
flow (this is not a full market survey):

| Job                   | Where they go today                                   | What Kostuma adds                                         |
| --------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| "Help me choose"      | Pinterest, TikTok, "best horror costumes" lists       | 82 curated characters, newest films first, real lore      |
| "Show me on me"       | Their imagination; AR filters (Snapchat, TikTok)      | The outfit tried on their own full-body photo             |
| "Teach me the makeup" | YouTube and TikTok tutorials (on someone else's face) | **The tutorial on their own face, one picture per step**  |
| "Where do I buy it"   | Spirit Halloween, HalloweenCostumes.com, Amazon       | One trusted search link per shop, per costume and product |

The owner has already named the differentiator: the makeup guide on your own face. Free
tutorials are everywhere, AR filters are instant and social, but neither shows _your_ face
after _each_ step of _real_ makeup you can buy and apply. That is a genuine, defensible gap,
especially paired with a horror-fan curation that general shops don't have.

## What already fits

- A sharp niche with built-in urgency (a date nobody can move) and a visual product.
- A brand with a real identity, which matters in a category full of generic shops.
- Three languages from day one; the US Hispanic market is a large share of Halloween spending,
  and Spanish opens Mexico and Latin America too.
- An SEO foundation (246 indexable pages, hreflang, structured data, social cards).
- Free to start, no card, honest privacy terms.

## Risks and gaps

### PMF-01 · The season is 27 days long, and the product isn't live — P0

Production (`main`) doesn't contain the Fitting Room yet (ENG-10). Searches for "\<character\>
costume" and "\<character\> makeup" peak in the second half of October, and a new domain takes
days to weeks to be indexed; Search Console isn't set up yet (it is waiting on the owner).

- Ship the approved stack within days, verify the domain in Google Search Console and Bing
  Webmaster Tools, submit `/sitemap.xml`, and request indexing for the 20 most-wanted costume
  pages in each language.
- SEO alone may be too slow for this season: plan a social launch (short videos of real
  transformations on TikTok, Instagram and YouTube Shorts) for the second week of October.

### PMF-02 · The value is behind the steepest steps — P1 (proposal)

Before seeing anything of their own, a visitor must: add a costume, create an account, find a
**full-body photo** (hard: it needs another person or a timer, the whole body, a plain
background), find a face photo, confirm, and wait 1.5–2 minutes. Every step loses people, and
the hardest one (the full-body photo) serves the **secondary** feature (the outfit).

The makeup guide, the primary feature, needs only the face photo. Proposal: let every costume
be tried "makeup only" (the path already exists for all-makeup costumes: `allMakeup` in the
render plan), with the outfit as an optional first step for those who have a full-body photo.
A try-on that skips the outfit also costs 4 units less (the two outfit renders): 4–8 instead of
8–12.

### PMF-03 · The guides are invisible to search and to undecided visitors — P2

The 510 makeup steps exist only inside the Fitting Room, after sign-up and photos. Yet "how to
do Pennywise makeup" is exactly what people type in October, in all three of Kostuma's
languages. Publishing each guide's **words** on its costume page (steps, products, "to finish"
notes; no visitor pictures) would create 246 makeup-tutorial pages and give undecided visitors
a reason to try it on their own face. It fits the owner's rules: no new menu item, the costume
page's only action is still "Add to My Pumpkin Basket", and the Fitting Room stays the way to
see it on yourself. See OPP-17.

### PMF-04 · Success would cause an outage: unit economics — P0

Each free try-on costs 8–12 YouCam units. About 532 units remain, enough for roughly 45–65
visitors. A launch that works (say 1,000 sign-ups in October) needs around 10,000 units for
free try-ons alone, before Kostuma Pro exists. And nothing today stops the spending when units
run out (ENG-02).

Decide before launch:

- the **daily budget** (and buy the units for it),
- **who** gets a free try-on (a verified email, SEC-02),
- what happens when the day's budget is spent (a waiting line or "come back tomorrow", never
  a failure),
- what "makeup only" saves (PMF-02).

### PMF-05 · No way to learn what works — P1

There are no analytics at all, by choice (the Privacy policy says so). That's admirable, but
with four weeks of season Kostuma can't afford to guess. Two privacy-respecting options:

- **Cookieless page analytics** (Vercel Web Analytics, or a self-hosted Umami): no cookies, no
  personal data, no consent banner needed in most places.
- **Server-side funnel counters**: increment daily counters in Firestore at the moments that
  matter. No personal data, nothing in the browser.

| Funnel step                                | Counter                      |
| ------------------------------------------ | ---------------------------- |
| Costume page viewed (by costume)           | page analytics               |
| Added to My Pumpkin Basket                 | `basketAdds/{date}`          |
| Account created (password / Google)        | `signUps/{date}`             |
| Try-on started / done / failed (by reason) | `tryOns/{date}`              |
| Guide followed past step 3                 | page analytics event         |
| Buy clicked (by shop)                      | `buyClicks/{date}`           |
| Kostuma Pro joined (by source)             | already stored in `waitlist` |
| Units per finished try-on                  | from ENG-02's budget         |

Update the Privacy policy's "no analytics" sentence in the same change (the project's rule:
the policy is true to the code).

### PMF-06 · Kostuma Pro is a promise without a product — P2

The waitlist is the right instrument for testing demand. To learn from it: record where it was
pressed (already stored), compare joins with used free costumes, and in the follow-up email ask
one question ("What would you use Kostuma Pro for?"). Keep the on-site promise modest (COPY-09)
until there's a decision on what Pro is.

### PMF-07 · Trust at the photo step — P2

Kostuma asks strangers for photos of their face and body. It lives on `kostuma.vercel.app`,
its legal pages name no operator (SEC-05), and its contact address is a personal Gmail. Each
of these is small; together they make a cautious visitor stop at "Choose a photo". A custom
domain (and an email address on it) is cheap, improves trust, and builds brand value in search
for next Halloween too. The one-line privacy promise near the photos ("They stay private.") is
good; the consent line of SEC-03 will reinforce it.

### PMF-08 · No sharing loop — P2

"Transformation" videos and before/after reveals are one of the most shared formats around
Halloween, and Kostuma produces exactly that material, then keeps it locked away. Letting
visitors **download their own pictures** (unaltered, one tap, their choice) costs almost
nothing and turns every happy visitor into an ad (OPP-11). Nothing is published by Kostuma;
privacy is untouched.

### PMF-09 · After October 31 — P2

From November 1 the site counts down to Christmas, which keeps the brand alive, but demand for
costumes drops sharply. Dates that fit Kostuma's world, in order:

- **Día de los Muertos (November 1–2)**: the biggest face-paint occasion of the year in Mexico
  and among Spanish speakers in the US, and Kostuma already speaks Spanish. A Catrina guide
  would be a natural candidate if the owner wants it: its base (white face, dark sockets, dark
  nose, colored lips) is the kind of coat Makeup VTO renders, and the flowers and swirls would
  be "to finish" text, like every other guide's details.
- **Friday the 13th, November 13, 2026**: Jason and Pamela Voorhees are already in the
  catalog.
- **Krampusnacht (December 5)** and Christmas horror: Krampus and Billy Chapman are already
  there.
- Horror conventions and big horror releases through the year, and next Halloween: the pages
  keep earning search traffic if the domain stays live and fresh.

### PMF-10 · Say the promise in words, once — P3 (proposal)

The home shows the transformation on the film strip without words, which is beautiful, but a
first-time visitor may still not realize the pictures will be **of them**. The three lines are
the natural place to make it certain ("Try it on yourself", "Do the makeup, step by step";
COPY-15), and the page title and description should say it to searchers (COPY-13).

## How to know it's working

Suggested launch targets to review weekly (adjust once real numbers exist):

- at least 20 % of visitors add a costume to My Pumpkin Basket,
- at least 30 % of basket holders who press "Try on" finish signing up,
- at least 90 % of started try-ons finish (failures by reason, ENG-03),
- at least half of finished try-ons view step 3 or later (the guide is used, not just looked at),
- Buy clicks and Kostuma Pro joins per finished try-on, by costume,
- units per finished try-on, and cost per engaged visitor.
