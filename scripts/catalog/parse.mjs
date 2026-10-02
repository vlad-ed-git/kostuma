// Parses the owner's costume list (the "Part 2: The Profiles" section of a
// markdown file like halloween_horror_top_100.md) into catalog entries.
// Used by scripts/import-catalog.mjs; tested in parse.test.ts.

/**
 * @typedef {{ title: string, year: number }} Film
 * @typedef {{ pieces: string[], alternative?: string }} Look
 * @typedef {{
 *   rank: number,
 *   slug: string,
 *   name: string,
 *   trending: boolean,
 *   films: Film[],
 *   createdBy: string[],
 *   broughtToLifeBy: string[],
 *   lore: string,
 *   funFact: string,
 *   look: Look,
 * }} Entry
 */

const FIELDS = {
  "🎬": "film",
  "🧠": "createdBy",
  "🎭": "broughtToLifeBy",
  "📖": "lore",
  "⚡": "funFact",
  "👗": "look",
}

/**
 * Every profile in the markdown, in rank order.
 * @param {string} markdown
 * @returns {Entry[]}
 */
export function parseCatalog(markdown) {
  const profiles = markdown.split(/^### /m).slice(1)
  return profiles.map(parseProfile)
}

/** @param {string} block */
function parseProfile(block) {
  const [heading, ...lines] = block.split("\n")
  const title = /^(\d+)\.\s+(.+?)\s*$/.exec(heading)
  if (!title) throw new Error(`Unreadable profile heading: ${heading}`)
  const rank = Number(title[1])
  const trending = title[2].includes("🔥")
  const name = title[2].replace("🔥", "").trim()

  /** @type {Record<string, string>} */
  const fields = {}
  for (const line of lines) {
    const field = /^- (\S+) \*\*[^*]+:\*\* (.+)$/u.exec(line.trim())
    const key = field && FIELDS[/** @type {keyof FIELDS} */ (field[1])]
    if (key) fields[key] = field[2].trim()
  }
  for (const key of Object.values(FIELDS)) {
    if (!fields[key]) throw new Error(`No ${key} for #${rank} ${name}`)
  }

  return {
    rank,
    slug: slugify(name),
    name,
    trending,
    films: parseFilms(fields.film),
    createdBy: parseCredits(fields.createdBy),
    broughtToLifeBy: parseCredits(fields.broughtToLifeBy),
    lore: fields.lore,
    funFact: fields.funFact,
    look: parseLook(fields.look),
  }
}

/**
 * A URL segment from a name: lowercase ASCII words joined by hyphens, "&"
 * spelled out. Never contains a dot (page paths must not, see proxy.ts).
 * @param {string} name
 */
export function slugify(name) {
  return name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * "The Conjuring 2 (2016) / The Nun (2018)" → two films.
 * @param {string} text
 * @returns {Film[]}
 */
export function parseFilms(text) {
  return text.split(" / ").map((part) => {
    const film = /^(.+) \((\d{4})\)$/.exec(part.trim())
    if (!film) throw new Error(`Unreadable film: ${part}`)
    return { title: film[1], year: Number(film[2]) }
  })
}

/**
 * Credits split into lines at semicolons, each starting with a capital.
 * @param {string} text
 */
export function parseCredits(text) {
  return splitTopLevel(text, ";").map(capitalize)
}

/**
 * "Black dress, veil, bob haircut, or the red wedding dress." → the pieces
 * of the main outfit, plus the alternative outfit as a sentence. Commas in
 * parentheses stay put; a bare semicolon separates pieces too.
 * @param {string} text
 * @returns {Look}
 */
export function parseLook(text) {
  const sentence = text.trim().replace(/\.$/, "")
  const or = findTopLevel(sentence, /^[,;] or /)
  const main = or === -1 ? sentence : sentence.slice(0, or)
  const alternative =
    or === -1 ? undefined : `${capitalize(sentence.slice(or + 2))}.`
  const pieces = splitTopLevel(main, ",;").map(capitalize)
  return alternative ? { pieces, alternative } : { pieces }
}

/**
 * Splits at any of `separators` outside parentheses; trims the parts.
 * @param {string} text
 * @param {string} separators
 */
function splitTopLevel(text, separators) {
  const parts = []
  let depth = 0
  let start = 0
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === "(") depth++
    else if (char === ")") depth = Math.max(0, depth - 1)
    else if (depth === 0 && separators.includes(char)) {
      parts.push(text.slice(start, index))
      start = index + 1
    }
  }
  parts.push(text.slice(start))
  return parts.map((part) => part.trim()).filter(Boolean)
}

/**
 * Where `pattern` first matches outside parentheses, or -1.
 * @param {string} text
 * @param {RegExp} pattern
 */
function findTopLevel(text, pattern) {
  let depth = 0
  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    if (char === "(") depth++
    else if (char === ")") depth = Math.max(0, depth - 1)
    else if (depth === 0 && pattern.test(text.slice(index))) {
      return index
    }
  }
  return -1
}

/** @param {string} text */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
