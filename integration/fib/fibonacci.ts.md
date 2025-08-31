---
tsmd:
	formatter: prettier
	root: true
---

# Fibonacci

Generate for Fibonacci numbers as an infinite sequence.

## Explanation

(Explanation of Fibonacci number here.)

## Implementation

We want to produce an infinite stream of integers.
We can do this via a JS Generator function:

```typescript id="signature"
export function *fibonacci() {
  // ... implementation ...
}
```

Or, if you prefer an explicit return type:

```typescript id="signature"
export function *fibonacci(): Generator<number,undefined,undefined> {
  // ... implementation ...
}
```

JavaScript's generators handle the low-level state management for us, so we just need to track the last two numbers:

```typescript id="implementation"
let low: number = 0;
let high: number = 1;
```

Since it's an infinite generator, we just loop forever:

```typescript
while (true) {
   // ... update state ...
}
```

State updates mean we need to:

1. Yield the previous number:
   ```typescript id="update"
   yield high;
   ```
2. Sum our two state numbers, `high` and `low`:
   ```typescript
   const sum = high + low;
   ```
3. Update the variables to their new values:
   ```typescript
   low = high;
   high = sum;
   ```

This generator doesn't use `return` or `next`, so that's all there is to it.
