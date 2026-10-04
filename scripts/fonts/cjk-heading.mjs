// The Chinese headings' display face (todo UX-12): Ma Shan Zheng (OFL,
// google/fonts ofl/mashanzheng), subset to the characters Chinese headings
// use. Writes app/fonts/cjk-heading.txt (those characters);
// app/fonts/fonts.test.ts fails when a Chinese heading needs a character
// the file lacks: run this, then subset the font again with it:
//
//   node scripts/fonts/cjk-heading.mjs
//   pyftsubset MaShanZheng-Regular.ttf --text-file=app/fonts/cjk-heading.txt \
//     --flavor=woff2 --layout-features='*' --no-hinting \
//     --output-file=app/fonts/cjk-heading.woff2   (fonttools + brotli)
import { readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { headingChars } from "./cjk-heading-chars.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const read = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"))

const chars = headingChars(
  read("messages/zh.json"),
  read("content/translations/zh.json")
)
writeFileSync(path.join(root, "app/fonts/cjk-heading.txt"), chars.join(""))
console.log(`${chars.length} characters: app/fonts/cjk-heading.txt`)
