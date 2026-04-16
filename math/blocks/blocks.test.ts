import { describe, expect, it } from "bun:test"

import { between, betweenMany, validatePosition } from "./index.ts"

const isStrictlyIncreasing = (xs: readonly string[]): boolean => {
  for (let i = 1; i < xs.length; i++) {
    if (!(xs[i - 1]! < xs[i]!)) return false
  }
  return true
}

describe("blocks fractional indexing", () => {
  it("generates a position between nulls", () => {
    const p = between(null, null)
    validatePosition(p)
  })

  it("generates a position between two positions", () => {
    const a = between(null, null)
    const b = between(a, null)
    const m = between(a, b)
    expect(a < m).toBeTrue()
    expect(m < b).toBeTrue()
    validatePosition(m)
  })

  it("generates many positions between null and null", () => {
    const xs = betweenMany(null, null, 50)
    expect(xs.length).toBe(50)
    expect(isStrictlyIncreasing(xs)).toBeTrue()
    xs.forEach(validatePosition)
  })

  it("generates many positions after a previous", () => {
    const start = between(null, null)
    const xs = betweenMany(start, null, 50)
    expect(xs.length).toBe(50)
    expect(start < xs[0]!).toBeTrue()
    expect(isStrictlyIncreasing(xs)).toBeTrue()
    xs.forEach(validatePosition)
  })

  it("generates many positions before a next", () => {
    const end = between(null, null)
    const xs = betweenMany(null, end, 50)
    expect(xs.length).toBe(50)
    expect(xs[xs.length - 1]! < end).toBeTrue()
    expect(isStrictlyIncreasing(xs)).toBeTrue()
    xs.forEach(validatePosition)
  })

  it("returns empty array for count <= 0", () => {
    expect(betweenMany(null, null, 0)).toEqual([])
    expect(betweenMany(null, null, -1)).toEqual([])
  })
})
