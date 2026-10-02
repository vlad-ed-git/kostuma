// Imports the owner's costume list (markdown, like
// halloween_horror_top_100.md) into content/costumes.ts:
//
//   npm run catalog:import -- path/to/list.md
//
// Run it to start from a new list. content/costumes.ts is then the
// catalog's source of truth, curated by hand: re-running overwrites it.
import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import prettier from "prettier"

import { parseCatalog } from "./catalog/parse.mjs"

const [source] = process.argv.slice(2)
if (!source) {
  console.error("Usage: npm run catalog:import -- <list.md>")
  process.exit(1)
}

const entries = parseCatalog(await readFile(source, "utf8")).map((entry) => ({
  ...entry,
  images: [],
  stores: [],
}))

const target = fileURLToPath(new URL("../content/costumes.ts", import.meta.url))
const code = `// The collection: Kostuma's most wanted costumes, in rank order.
// Imported from the owner's list (scripts/import-catalog.mjs), then curated
// by hand: this file is the source of truth. Facts about 2025–2026 releases
// reflect the owner's list as of 2026-09-30; box-office figures are
// approximate. content/costumes.test.ts checks every entry.
import type { Costume } from "@/lib/catalog/types"

export const costumes: Costume[] = ${JSON.stringify(entries, null, 2)}
`
const options = await prettier.resolveConfig(target)
await writeFile(
  target,
  await prettier.format(code, { ...options, filepath: target })
)
console.log(`${entries.length} costumes → content/costumes.ts`)
