// Checks the YouCam patterns the makeup guides use (lib/makeup.ts) against
// YouCam's live catalogs: each must still exist and take as many colors as
// the guides give it. Public files, no API key, no units.
// Run after changing the patterns: npm run makeup:patterns
import { lipShapes, patterns } from "../../lib/makeup.ts"

const CATALOGS = "https://plugins-media.makeupar.com/wcm-saas/"

/** The catalog file of each effect category. */
const files = {
  eye_shadow: "patterns/eyeshadow.json",
  eye_liner: "patterns/eyeliner.json",
  eyebrows: "patterns/eyebrows.json",
  eyelashes: "patterns/eyelashes.json",
  blush: "patterns/blush.json",
  contour: "patterns/contour.json",
  bronzer: "patterns/bronzer.json",
  highlighter: "patterns/highlighter.json",
  lip_liner: "patterns/lipliner.json",
}

/** A catalog's patterns: label → how many colors it takes. */
async function catalog(file) {
  const response = await fetch(CATALOGS + file)
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
  const entries = await response.json()
  return new Map(entries.map((entry) => [entry.label, entry.colorNum ?? 1]))
}

const problems = []
for (const [category, file] of Object.entries(files)) {
  const known = await catalog(file)
  for (const [name, colors] of Object.entries(patterns[category])) {
    if (!known.has(name))
      problems.push(`${category}: ${name} is not in ${file}`)
    else if (known.get(name) !== colors)
      problems.push(
        `${category}: ${name} takes ${known.get(name)} colors, not ${colors}`
      )
  }
}
const shapes = await catalog("shapes/lipshape.json")
for (const shape of lipShapes)
  if (!shapes.has(shape))
    problems.push(`lip shape ${shape} is not in the catalog`)

if (problems.length) {
  console.error(problems.join("\n"))
  process.exitCode = 1
} else {
  console.log("Every pattern the guides use is in YouCam's catalogs.")
}
