/**
 * Up to two letters for an avatar: the first of the first two words of the
 * name ("Wednesday Addams" → "WA"), else of the email. Whole characters,
 * never half of one (emoji, accents, CJK).
 */
export function initials(name: string, email = "") {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
  const fallback = Array.from(email.trim())[0] ?? ""
  return (letters || fallback).toLocaleUpperCase()
}
