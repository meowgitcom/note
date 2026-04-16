## meow[note] math blocks

Fractional indexing for ordering blocks in meow[note].

Instead of storing an integer index per block (which forces renumbering when you insert in the middle), each block gets a lexicographically-sortable `position` string.

To insert, generate a new position strictly between the two neighbors.

### API

- `between(prev, next)`
  - Returns a position `p` such that `prev < p < next` (where missing sides are treated as unbounded).
- `betweenMany(prev, next, count)`
  - Returns `count` positions, strictly increasing, all between `prev` and `next`.
- `validatePosition(position)`
  - Throws if the string is not in canonical form.

### Examples

#### Generate a position `between` two spots

```ts
import { between } from "./index.ts"

// Insert at the beginning
const first = between(null, null)
const second = between(first, null)

// Insert between two existing blocks
const inserted = between(first, second)

// Lexicographic order is the block order.
console.log([first, inserted, second].sort())
```

#### Generate multiple positions with `betweenMany`

```ts
import { betweenMany } from "./index.ts"

const positions = betweenMany(null, null, 5)
// Returns 5 evenly-spaced positions for bulk insertion

console.log(positions)
// e.g. ["a0", "aG", "aS", "ac", "am"] (sorted)

// Insert between two existing blocks
const batch = betweenMany("a0", "b0", 3)
console.log(batch)
// e.g. ["aW", "a4V", "aU0"]
```

#### Validate positions with `validatePosition`

```ts
import { validatePosition, between } from "./index.ts"

// Valid positions don't throw
const valid = between(null, null)
validatePosition(valid) // ok

// Invalid positions throw
try {
  validatePosition("x") // wrong length prefix
} catch (e) {
  console.error("Invalid position :", e.message)
}

try {
  validatePosition("aa0") // trailing zeros
} catch (e) {
  console.error("Invalid position :", e.message)
}
```
