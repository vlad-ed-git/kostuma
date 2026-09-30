# Find the best photo of each Kostuma costume

You are an AI agent with web search, a browser or web fetch, the ability to look at images, and
a shell in the Kostuma repository. Your job: for each of the 100 costumes in Kostuma's
collection, find **one** photo, the best one that exists, of that character in costume, download
it, check it, and record where it came from. Work through the list one costume at a time and
iterate on each until you find a photo that meets the bar below, or until you have tried hard
enough to say none exists.

## Why the photo matters

Each photo has two jobs, and it must be good enough for both:

1. **The costume's picture on the site.** Kostuma shows it as a 4:5 portrait: a 156 × 195
   thumbnail in the list and up to about 600 × 750 on the costume's page, on a very dark page.
   The character must survive a 4:5 crop and be clearly visible.
2. **The reference for virtual try-on.** Kostuma's Fitting Room will send this photo to
   YouCam's AI Clothes try-on (`cloth-v4`, garment category `full_body`) as the reference
   garment (`ref_file`): the AI dresses the customer in whatever the person in the photo
   wears. YouCam expects the reference to be **one person fully wearing the outfit**, seen from
   the front, and it rejects photos with several people (`error_multi_person`), nudity or gore
   (`error_nsfw_content_detected`), images that are too small (`error_below_min_image_size`) or
   too big (`exceed_max_filesize`), and references it can't read (`error_invalid_ref`,
   `error_apply_region_mismatch`).

## Where the costumes are

`content/costumes.ts` lists them in the owner's order. For each costume you get its `slug`
(use it for file names), `name` (the character), `films` (title and year: the first is the one
the character is known from), `broughtToLifeBy` (the performers: actors, suit performers,
makeup artists), and `look.pieces` (what the costume consists of, e.g. "Navy-blue mechanic
coveralls", "White mask", "Kitchen knife"), sometimes with `look.alternative` (another way to
wear it). Node reads the file directly:

```sh
node --input-type=module -e '
const { costumes } = await import("./content/costumes.ts")
for (const c of costumes)
  console.log(JSON.stringify({ slug: c.slug, name: c.name, films: c.films,
    performers: c.broughtToLifeBy, pieces: c.look.pieces, alternative: c.look.alternative }))'
```

## What "best" means

### Hard requirements: reject a photo that fails any of these

1. **One character, one person.** Exactly one person is visible: the character in costume. No
   second person, not even partly at the edge; no crowd, no reflection of another person.
   (Only characters who are a pair by nature, such as the Grady Twins, may show two, and only
   if no photo of one of them alone exists: flag it.)
2. **A real photo of the real costume.** The performer who played the character (the actor,
   actress, or the suit performer inside the monster) wearing the costume from the film: an
   official still, a publicity or promotional photo, a press-kit image, a behind-the-scenes or
   on-set photo, or the original performer in the costume at a premiere or convention. Never
   fan art, drawings, AI-generated or AI-upscaled images, toys, figures, statues, video game
   renders, or posters with text composited on them.
3. **The right version of the costume.** It matches the first film in `films` and the pieces in
   `look.pieces` (Michael Myers in 1978 wears navy coveralls and the white mask; Ghostface wears
   the black hooded robe and the white mask). If the photo shows a different film's version,
   it fails unless `look.alternative` describes it.
4. **The costume is visible.** Full body, head to toe, is the goal (try-on uses `full_body`);
   head to knees is the least you may accept, and only if every piece in `look.pieces` shows.
   Front or three-quarter front, standing, not crouching, lying or turned away; arms, props,
   furniture or other objects do not cover the costume.
5. **Big enough, not too big.** The longer side is at least **1024 px** and the shorter side at
   least **768 px** (YouCam recommends 1024 × 768; its minimum of 512 × 384 is too small for the
   site). No side over **4096 px** and no file over **10 MB** for the try-on copy (make a
   smaller copy; keep the original). JPEG or PNG for the try-on copy.
6. **Clean.** Sharp and in focus, no motion blur, little noise or film grain, no heavy JPEG
   blocks or banding, no watermark, logo, caption, subtitle, border, frame, or collage, not a
   screenshot of a website or a video player. Lit well enough that the costume's details and
   colors can be seen: horror stills are often near black; a silhouette fails.
7. **Not graphic.** No nudity and no gore beyond a little stage blood. YouCam rejects it, and
   the site is for 17 and up, not for shock.

### Scoring: among the photos that pass, pick the highest score (0–100)

| Points | Criterion                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 25     | **Costume visibility and fidelity**: every piece of `look.pieces` clearly visible, true colors, full body                                                |
| 15     | **Framing**: the person fills most of the height (80 % or more is ideal), portrait orientation, a clean 4:5 crop around them without cutting the costume |
| 15     | **Resolution**: 1500 px or more on the shorter side scores full points; 768 px scores none                                                               |
| 15     | **Image quality**: sharpness, low noise, no compression artifacts, good exposure                                                                         |
| 10     | **Pose**: facing the camera, standing straight, arms away from the body                                                                                  |
| 10     | **Background**: plain or uncluttered, separates clearly from the costume (helps try-on and the dark page)                                                |
| 10     | **Source**: an original official or agency file, not a re-post; the license is stated                                                                    |

A photo scoring **70 or more** is good enough to stop searching for that costume. Below 70,
keep iterating (next section) and keep the best so far.

## How to find it

Start from real photos of the performer in costume; they are the best source by far.

1. **Plan queries** from the costume's data, for example:
   - `"{name}" "{film}" {year} still`, `"{name}" full body`, `{film} {year} promotional still`
   - `"{performer}" as "{name}"`, `"{performer}" "{name}" costume full body`
   - `{film} behind the scenes {name}`, `{film} press kit`, `{film} {year} publicity photo`
2. **Search in this order of preference:**
   1. Wikimedia Commons (clear licenses, often original files), the studio's or distributor's
      press site and electronic press kit, the film's official site and social accounts.
   2. Photo agencies' editorial collections (Getty Images, Alamy, Shutterstock Editorial,
      Everett Collection, Moviestore): excellent files, but licensed; record them anyway.
   3. Film stills galleries and databases, fan wikis (Fandom) and fan sites: often high
      resolution; follow each image back to its original source and record that.
   4. Only if nothing above passes: the officially licensed costume sold by a costume maker
      (Rubie's, Spirit Halloween, Trick or Treat Studios), worn by a model on a plain
      background. It is not the performer, so flag it (`source_type: "retailer"`).
   5. Last resort, flagged: an outstanding, faithful cosplay photo with the photographer
      credited.
3. **Gather at least 8 candidates**, then **open and look at each one at full size**. Never
   judge by a thumbnail, a file name or a caption. Read its real pixel size, check every hard
   requirement, score it.
4. **Iterate** when no candidate scores 70: try the performer's name instead of the
   character's, "full body", "promo", "on set", "premiere", the film's sequels only if the
   costume is the same, other languages' sites, `look.alternative`. Up to **4 rounds** per
   costume; then take the best passing photo, or record the costume as unresolved with what
   you tried and why each finalist failed.
5. **Download the original**, the largest file the source offers (follow links to the
   original file; not the preview, not the thumbnail). Never remove or crop out a watermark,
   never bypass a paywall, a login or a site's terms: a watermarked or paywalled photo fails.
6. **Check the file**: it opens, its format is what its extension says, its size matches what
   you scored.

## What to save

- `photos/originals/{slug}.{ext}`: the file exactly as downloaded.
- `photos/youcam/{slug}.jpg`: the try-on copy. JPEG at quality 92, sRGB, longer side at most
  4096 px (only shrink, never enlarge), under 10 MB. The project has `sharp` installed:

  ```sh
  node --input-type=module -e '
  const { default: sharp } = await import("sharp")
  const [input, output] = process.argv.slice(1)
  await sharp(input).rotate().resize({ width: 4096, height: 4096, fit: "inside", withoutEnlargement: true })
    .toColorspace("srgb").jpeg({ quality: 92 }).toFile(output)' photos/originals/ghostface.jpg photos/youcam/ghostface.jpg
  ```

- `photos/manifest.json`: one entry per costume, in the owner's order:

  ```json
  {
    "slug": "ghostface",
    "name": "Ghostface",
    "status": "found",
    "file": "photos/originals/ghostface.jpg",
    "youcam_file": "photos/youcam/ghostface.jpg",
    "width": 2000,
    "height": 3000,
    "bytes": 1843200,
    "source_image_url": "https://…",
    "source_page_url": "https://…",
    "source_type": "publicity",
    "performer": "…",
    "credit": "…",
    "license": "as stated by the source, word for word",
    "rights": "clear | editorial only | unknown",
    "score": 84,
    "scores": {
      "costume": 23,
      "framing": 13,
      "resolution": 15,
      "quality": 12,
      "pose": 8,
      "background": 7,
      "source": 6
    },
    "notes": "Knife held low, fully visible; plain dark backdrop.",
    "rounds": 2,
    "runners_up": ["https://…", "https://…"]
  }
  ```

  `status` is `found`, `found-flagged` (a retailer, cosplay or pair photo, or anything else the
  owner should look at) or `unresolved` (with `notes` saying what you tried and why it failed).
  `source_type` is one of `official_still`, `publicity`, `press_kit`, `behind_the_scenes`,
  `appearance`, `commons`, `agency`, `retailer`, `cosplay`.

- `photos/report.md`: how many costumes were found, flagged and unresolved; the list of flagged
  and unresolved ones with the reason; and every photo whose `rights` is not `clear`.

Update the manifest after every costume, so an interruption loses nothing, and resume from it:
skip costumes already marked `found`.

## Rights

Film stills and publicity photos belong to studios and photographers. Record every photo's
source and license exactly; do not guess a license. Mark `rights` as `clear` only for public
domain or a license that allows commercial use (for example CC BY or CC BY-SA on Wikimedia
Commons, with its attribution in `credit`). Everything else is `editorial only` or `unknown`.
**Do not add any photo to git, and do not put any photo on the site**: the owner decides which
ones can be used, and may license them. Add `photos/` to `.gitignore` if it is not there yet.

## Rules

- Do not call the YouCam API: its units are limited and cost money. Do not generate, upscale,
  retouch or composite images.
- Children appear in some films (the Grady Twins, Danny Torrance): use official stills or
  publicity photos only.
- Keep going until every costume is `found`, `found-flagged` or `unresolved`. At the end,
  print the report.
