const MINOR_WORDS = new Set([
  "and", "or", "the", "of", "at", "for", "in", "on", "a", "an", "to", "from", "by", "with", "&", "y", "yr",
])
const ACRONYMS = new Set(["vip"])

// Zero-width/formatting Unicode chars (ZWSP, ZWNJ, ZWJ, LRM, RLM, BOM) that sometimes
// arrive via numeric HTML entities and render invisibly but corrupt copy/paste and search.
const ZERO_WIDTH_RE = /[​-‏﻿]/g

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

function capitaliseToken(token: string): string {
  const match = token.match(/^([^a-zA-Z]*)([a-zA-Z])(.*)$/)
  if (!match) return token
  const [, prefix, first, rest] = match
  return prefix + first.toUpperCase() + rest.toLowerCase()
}

function recaseWord(word: string): string {
  return word
    .split(/([-&@])/)
    .map((part) => (part === "-" || part === "&" || part === "@" ? part : capitaliseToken(part)))
    .join("")
}

// Title-cases a name, but only touches words that are ALL CAPS or all lowercase.
// Words already in mixed case (e.g. "BJ's", "AnimalInn", "Cefn-y-Crib") are left
// alone — they're almost always intentional stylisation, not sloppy data entry.
function toTitleCase(str: string): string {
  const words = str.split(" ")
  return words
    .map((word, i) => {
      if (!word) return word
      const letters = word.replace(/[^a-zA-Z]/g, "")
      if (!letters) return word

      const lower = letters.toLowerCase()
      const isFirstOrLast = i === 0 || i === words.length - 1

      if (ACRONYMS.has(lower)) {
        return word.replace(/[a-zA-Z]+/g, (m) => m.toUpperCase())
      }
      if (!isFirstOrLast && MINOR_WORDS.has(lower)) {
        return word.replace(/[a-zA-Z]+/g, (m) => m.toLowerCase())
      }
      // Short all-caps tokens are usually initials (AJ, BJ, K9) — leave them be.
      if (letters.length <= 2) return word

      const isUpper = letters === letters.toUpperCase()
      const isLower = letters === lower
      if (!isUpper && !isLower) return word

      return recaseWord(word)
    })
    .join(" ")
}

export function normaliseName(name: string): string {
  return toTitleCase(decodeHtmlEntities(name).replace(ZERO_WIDTH_RE, "")).replace(/\s+/g, " ").trim()
}
