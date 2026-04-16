import { CHARS, ZERO, MAX_CHAR } from "./chars.ts"

export const midpoint = (left: string, right: string | null): string => {
  if (right !== null && left >= right) throw new Error("left must be < right")
  if (left.endsWith(ZERO) || right?.endsWith(ZERO)) throw new Error("Trailing zeros detected")

  if (right) {
    let sharedPrefix = 0
    while ((left[sharedPrefix] || ZERO) === right[sharedPrefix]) sharedPrefix++
    if (sharedPrefix > 0) {
      return (
        right.slice(0, sharedPrefix) + midpoint(left.slice(sharedPrefix), right.slice(sharedPrefix))
      )
    }
  }

  const leftIdx = left ? CHARS.indexOf(left[0]!) : 0
  const rightIdx = right !== null ? CHARS.indexOf(right[0]!) : CHARS.length
  if (leftIdx < 0) throw new Error(`Invalid character in left : ${left[0]}`)
  if (right !== null && rightIdx < 0) throw new Error(`Invalid character in right : ${right[0]}`)

  if (rightIdx - leftIdx > 1) {
    return CHARS[Math.round((leftIdx + rightIdx) / 2)]!
  }

  if (right && right.length > 1) {
    return right.charAt(0)
  }

  return CHARS[leftIdx]! + midpoint(left.slice(1), null)
}

export const shiftForward = (token: string): string | null => {
  const chars = [...token]
  const prefix = chars.shift()!
  let requiresCarry = true

  for (let i = chars.length - 1; i >= 0 && requiresCarry; i--) {
    const currentIdx = CHARS.indexOf(chars[i]!)
    if (currentIdx < 0) throw new Error(`Invalid character in token : ${token}`)
    const nextIdx = currentIdx + 1
    if (nextIdx === CHARS.length) {
      chars[i] = ZERO
    } else {
      chars[i] = CHARS[nextIdx]!
      requiresCarry = false
    }
  }

  if (!requiresCarry) return prefix + chars.join("")
  if (prefix === "Z") return "a" + ZERO
  if (prefix === "z") return null

  const nextPrefix = String.fromCharCode(prefix.charCodeAt(0) + 1)
  if (nextPrefix > "a") {
    chars.push(ZERO)
  } else {
    chars.pop()
  }

  return nextPrefix + chars.join("")
}

export const shiftBackward = (token: string): string | null => {
  const chars = [...token]
  const prefix = chars.shift()!
  let requiresBorrow = true

  for (let i = chars.length - 1; i >= 0 && requiresBorrow; i--) {
    const currentIdx = CHARS.indexOf(chars[i]!)
    if (currentIdx < 0) throw new Error(`Invalid character in token : ${token}`)
    const prevIdx = currentIdx - 1
    if (prevIdx === -1) {
      chars[i] = MAX_CHAR
    } else {
      chars[i] = CHARS[prevIdx]!
      requiresBorrow = false
    }
  }

  if (!requiresBorrow) return prefix + chars.join("")
  if (prefix === "a") return "Z" + MAX_CHAR
  if (prefix === "A") return null

  const prevPrefix = String.fromCharCode(prefix.charCodeAt(0) - 1)
  if (prevPrefix < "Z") {
    chars.push(MAX_CHAR)
  } else {
    chars.pop()
  }

  return prevPrefix + chars.join("")
}
