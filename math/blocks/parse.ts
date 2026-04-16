import { CHARS, ZERO } from "./chars.ts"

export const MIN_BASE_TOKEN = "A" + ZERO.repeat(26)

export type SplitPosition = {
  base: string
  fraction: string
}

export const getPrefixSize = (char: string): number => {
  const code = char.charCodeAt(0)
  if (code >= 97 && code <= 122) return code - 97 + 2
  if (code >= 65 && code <= 90) return 90 - code + 2
  throw new Error(`Invalid base prefix : ${char}`)
}

export const getBaseToken = (position: string): string => {
  if (!position) throw new Error("Empty position")
  const size = getPrefixSize(position[0]!)
  if (size > position.length) throw new Error(`Corrupted string : ${position}`)
  return position.slice(0, size)
}

export const splitPosition = (position: string): SplitPosition => {
  const base = getBaseToken(position)
  return { base, fraction: position.slice(base.length) }
}

const assertAllCharsInAlphabet = (value: string, context: string): void => {
  for (const c of value) {
    if (!CHARS.includes(c)) throw new Error(`Invalid character in ${context} : ${c}`)
  }
}

export const validateBaseToken = (base: string): void => {
  const expected = getPrefixSize(base[0]!)
  if (base.length !== expected) throw new Error(`Corrupted base token : ${base}`)
  assertAllCharsInAlphabet(base.slice(1), "base token")
}

export const validateFraction = (fraction: string): void => {
  // Trailing zeros create ambiguous representations; we keep a canonical form.
  if (fraction.endsWith(ZERO)) throw new Error(`Trailing zeros not permitted : ${fraction}`)
  assertAllCharsInAlphabet(fraction, "fraction")
}
