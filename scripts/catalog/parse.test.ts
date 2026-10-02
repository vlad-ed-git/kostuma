// @vitest-environment node
import { describe, expect, it } from "vitest"

import {
  parseCatalog,
  parseCredits,
  parseFilms,
  parseLook,
  slugify,
} from "./parse.mjs"

const profile = `# The list

## Part 2: The Profiles

### 1. Ghostface
- 🎬 **Film:** Scream (1996)
- 🧠 **Created by:** Kevin Williamson (script) & Wes Craven (director)
- 🎭 **Brought to life by:** Mask by Fun World (designer Brigitte Sleiertin, c. 1990); voiced by Roger L. Jackson
- 📖 **Lore:** A prank-calling slasher.
- ⚡ **Fun fact:** The mask was found in a house.
- 👗 **The look:** Black hooded robe, white mask, prop knife.
- 🖼️ **Images (large):** [Costume view](https://example.com)

### 2. Nikki 'Freaky Nikki' Freeman 🔥
- 🎬 **Film:** The Conjuring 2 (2016) / The Nun (2018)
- 🧠 **Created by:** James Wan; inspired by case files
- 🎭 **Brought to life by:** Someone
- 📖 **Lore:** Lore.
- ⚡ **Fun fact:** Fact.
- 👗 **The look:** Black dress, veil, or the red wedding dress.
`

describe("parseCatalog", () => {
  it("reads every profile in order, ignoring image links", () => {
    const [first, second] = parseCatalog(profile)
    expect(first).toEqual({
      rank: 1,
      slug: "ghostface",
      name: "Ghostface",
      trending: false,
      films: [{ title: "Scream", year: 1996 }],
      createdBy: ["Kevin Williamson (script) & Wes Craven (director)"],
      broughtToLifeBy: [
        "Mask by Fun World (designer Brigitte Sleiertin, c. 1990)",
        "Voiced by Roger L. Jackson",
      ],
      lore: "A prank-calling slasher.",
      funFact: "The mask was found in a house.",
      look: { pieces: ["Black hooded robe", "White mask", "Prop knife"] },
    })
    expect(second.trending).toBe(true)
    expect(second.name).toBe("Nikki 'Freaky Nikki' Freeman")
    expect(second.films).toHaveLength(2)
  })

  it("refuses a profile with a missing field", () => {
    expect(() =>
      parseCatalog("### 3. Nobody\n- 🎬 **Film:** Nothing (2000)\n")
    ).toThrow(/No createdBy for #3 Nobody/)
  })
})

describe("slugify", () => {
  it.each([
    ["Ghostface", "ghostface"],
    ["Nikki 'Freaky Nikki' Freeman", "nikki-freaky-nikki-freeman"],
    ["Jigsaw & Billy the Puppet", "jigsaw-and-billy-the-puppet"],
    ["Dr. Frank-N-Furter", "dr-frank-n-furter"],
    ["The Nun (Valak)", "the-nun-valak"],
    [
      "Elisabeth Sparkle / Monstro Elisasue",
      "elisabeth-sparkle-monstro-elisasue",
    ],
    ["M3GAN", "m3gan"],
    ["Pokémon Señor", "pokemon-senor"],
  ])("%s → %s", (name, slug) => {
    expect(slugify(name)).toBe(slug)
    expect(slug).not.toContain(".")
  })
})

describe("parseFilms", () => {
  it("reads one or several films with their years", () => {
    expect(parseFilms("Pearl (2022) / X (2022)")).toEqual([
      { title: "Pearl", year: 2022 },
      { title: "X", year: 2022 },
    ])
    expect(parseFilms("Ju-On: The Grudge (2002)")).toEqual([
      { title: "Ju-On: The Grudge", year: 2002 },
    ])
  })

  it("refuses a film without a year", () => {
    expect(() => parseFilms("Scream")).toThrow(/Unreadable film/)
  })
})

describe("parseCredits", () => {
  it("splits at semicolons outside parentheses and capitalizes", () => {
    expect(parseCredits("Mask by Fun World (a; b); voiced by Roger")).toEqual([
      "Mask by Fun World (a; b)",
      "Voiced by Roger",
    ])
  })
})

describe("parseLook", () => {
  it("lists the pieces of a simple outfit", () => {
    expect(
      parseLook("Navy-blue coveralls, white mask, kitchen knife.")
    ).toEqual({
      pieces: ["Navy-blue coveralls", "White mask", "Kitchen knife"],
    })
  })

  it("keeps commas inside parentheses", () => {
    expect(
      parseLook("Bandages (soaked in tea for aging), dust, glowing eyes.")
    ).toEqual({
      pieces: ["Bandages (soaked in tea for aging)", "Dust", "Glowing eyes"],
    })
  })

  it("separates an alternative outfit after ', or'", () => {
    expect(
      parseLook("Black dress, veil, bob haircut, or the red wedding dress.")
    ).toEqual({
      pieces: ["Black dress", "Veil", "Bob haircut"],
      alternative: "Or the red wedding dress.",
    })
    expect(
      parseLook(
        "Red robe and black cape (Jigsaw), or Billy: white face, red spiral cheeks."
      )
    ).toEqual({
      pieces: ["Red robe and black cape (Jigsaw)"],
      alternative: "Or Billy: white face, red spiral cheeks.",
    })
  })

  it("separates an alternative outfit after '; or'", () => {
    expect(
      parseLook("Animal-print top, fake blood; or the purple floral dress.")
    ).toEqual({
      pieces: ["Animal-print top", "Fake blood"],
      alternative: "Or the purple floral dress.",
    })
  })

  it("treats a bare semicolon as another piece", () => {
    expect(parseLook("1930s period wear; vampire makeup and fangs.")).toEqual({
      pieces: ["1930s period wear", "Vampire makeup and fangs"],
    })
  })

  it("keeps an 'or' inside a piece", () => {
    expect(parseLook("Black cape, jack-o'-lantern or sword.")).toEqual({
      pieces: ["Black cape", "Jack-o'-lantern or sword"],
    })
  })
})
