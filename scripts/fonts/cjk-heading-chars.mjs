/**
 * The characters Chinese headings use (todo UX-12): every message of the
 * App and Home groups, every title, every message short enough to be a
 * heading or a label (24 characters), and every makeup guide's step
 * titles. Only Chinese and its punctuation: Latin stays Grenze Gotisch's.
 */
export function headingChars(messages, translations) {
  const texts = []
  const walk = (node, keys) => {
    if (typeof node === "string") {
      const text = node.replace(/<\/?wbr>/g, "")
      if (
        keys[0] === "App" ||
        keys[0] === "Home" ||
        keys.at(-1) === "title" ||
        text.length <= 24
      )
        texts.push(text)
    } else if (node && typeof node === "object") {
      for (const [key, value] of Object.entries(node))
        walk(value, [...keys, key])
    }
  }
  walk(messages, [])
  for (const guide of Object.values(translations.guides))
    for (const step of guide.steps) texts.push(step.title)
  const chars = new Set()
  for (const text of texts)
    for (const char of text) if (char.codePointAt(0) > 0x2e7f) chars.add(char)
  return [...chars].sort((a, b) => a.codePointAt(0) - b.codePointAt(0))
}
