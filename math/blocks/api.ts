import { ZERO } from "./chars.ts"
import { MIN_BASE_TOKEN, splitPosition, validateBaseToken, validateFraction } from "./parse.ts"
import { midpoint, shiftBackward, shiftForward } from "./engine.ts"

/**
 * Validate that `position` is a properly formatted position string.
 *
 * Throws if the string is malformed or at the minimum possible value.
 */
export const validatePosition = (position: string): void => {
  const { base, fraction } = splitPosition(position)
  if (base === MIN_BASE_TOKEN && fraction.length === 0)
    throw new Error(`Limit reached : ${position}`)
  validateBaseToken(base)
  validateFraction(fraction)
}

/**
 * Generate a lexicographically-sortable "position" string between `prev` and `next`.
 *
 * This is fractional indexing for block ordering,
 * you can insert between two existing items without renumbering everything.
 */
export const between = (prev?: string | null, next?: string | null): string => {
  if (prev) validatePosition(prev)
  if (next) validatePosition(next)
  if (prev && next && prev >= next) throw new Error("prev must be < next")

  if (!prev) {
    if (!next) return "a" + ZERO
    const { base: baseNext, fraction: fracNext } = splitPosition(next)

    // When next is at the minimum base token, we can only move by extending its fraction.
    if (baseNext === MIN_BASE_TOKEN) return baseNext + midpoint("", fracNext)
    if (baseNext < next) return baseNext

    const stepped = shiftBackward(baseNext)
    if (!stepped) throw new Error("Minimum limit reached")
    return stepped
  }

  if (!next) {
    const { base: basePrev, fraction: fracPrev } = splitPosition(prev)
    const stepped = shiftForward(basePrev)
    return stepped === null ? basePrev + midpoint(fracPrev, null) : stepped
  }

  const { base: basePrev, fraction: fracPrev } = splitPosition(prev)
  const { base: baseNext, fraction: fracNext } = splitPosition(next)

  if (basePrev === baseNext) {
    return basePrev + midpoint(fracPrev, fracNext)
  }

  const stepped = shiftForward(basePrev)
  if (!stepped) throw new Error("Maximum limit reached")

  return stepped < next ? stepped : basePrev + midpoint(fracPrev, null)
}

/**
 * Generate `count` positions strictly between `prev` and `next`.
 *
 * Returned array is strictly increasing.
 */
export const betweenMany = (prev: string | null, next: string | null, count: number): string[] => {
  if (count <= 0) return []
  if (count === 1) return [between(prev, next)]

  if (!next) {
    let current = between(prev, next)
    const batch = [current]
    for (let i = 1; i < count; i++) {
      current = between(current, next)
      batch.push(current)
    }
    return batch
  }

  if (!prev) {
    let current = between(prev, next)
    const batch = [current]
    for (let i = 1; i < count; i++) {
      current = between(prev, current)
      batch.push(current)
    }
    return batch.reverse()
  }

  const midIdx = Math.floor(count / 2)
  const center = between(prev, next)

  return [
    ...betweenMany(prev, center, midIdx),
    center,
    ...betweenMany(center, next, count - midIdx - 1),
  ]
}
