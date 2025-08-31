# @rickosborne/tsmd

Node.js loader for `.ts.md` literate TypeScript + Markdown files.
Put your TypeScript code inside your docs instead of the other way around:

``````markdown
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
``````

The loader stitches together the code in that Markdown to produce a virtual TypeScript file:

```typescript
export function* fibonacci(): Generator<number, undefined, undefined> {
	let low: number = 0;
	let high: number = 1;
	while (true) {
		yield high;
		const sum = high + low;
		low = high;
		high = sum;
	}
}
```

This file is then passed along to the rest of the loaders.
If your file was named `fibonacci.ts.md`, then the virtual file looks like `fibonacci.ts`.
The same holds true for other TS extensions like `.tsx`, `.cts`, and `.mts`, etc.

## Usage

In modern versions of node:

```shell
node --loader @rickosborne/tsmd path/to/some.ts.md
```

It should also work with tools which take a similarly-formatted `loader` name in their configuration, like Mocha or WebPack.

It probably _won't_ work with tools that pull shenanigans with module loading, like Jest.
(But I haven't tried.)

## Processing

The order of your Markdown does not need to follow the order of the generated TypeScript.
That is, if the narrative explanation makes more sense to start from the bottom, or the middle, or jumping all around, you can do that.
The code assembler takes some hints about how to build the final source from your narrative.

### Region IDs

The most basic hint is to give a fenced code block an `id`:

``````markdown
```typescript id="log-the-error"
console.error(`The failure rate is: ${errorRate}`);
```
``````

This marks the entire fenced block as a region identified by that ID.
This ID can technically be any text, but for reasons you'll see below, you probably want to stick with HTML-ID-like.

### Region ID reuse

If you reuse that ID later, this overwrites the region with the updated content.
This can be useful if you want to give a simplified explanation first, as an overview or example, and then build out to the more complex version later.
Think of it like talking through a refactoring exercise.

### Region placeholders

You can reference a region (even ones created later in the document) with an ellipsis comment:

``````markdown
```typescript
if (errorRate > 0.05) {
  // ... log the error ...
}
```
``````

The magic there is the leading `// ...` and trailing `...`.
(The Unicode `…`, `᠁`, and `⋯` are also acceptable, if you prefer.)
The text in between becomes a Region ID reference.

You can also use `/* … block … */` comments, but the parse will only find them if the entire comment is single-line.
That is, references will not be picked up if they are in, for example, JSDoc/TSDoc:

```typescript
/**
 * ... this is NOT a range reference ...
 */
```

When it comes time to resolve those references, several variations will be tried:

- The same literal value: `"log the error"`
- A kebab-case version: `"log-the-error"`
- A camelCase version: `"logTheError"`
- The same three above, but with just the first word: `"log"`.
  This means you can keep in longer, human-readable placeholder comments like:
  ```typescript
  // ... log the error using the console ...
  ```
  But when implementing them, your Region ID can be short and sweet and not distracting:
  ``````markdown
  ```typescript id="log"
  console.error(`The failure rate is: ${errorRate}`);
  ```
  ``````

If none of those can be found, the comment is left in the source as a comment, without its magic.

### Ongoing code

If a fenced code block doesn't have an `id`, it is assumed to be a follow-up to the previous region's code.

### Indents

You don't need to maintain before- and after- indenting in your code blocks.
Like the `function` and `while` examples above, the regions which have their code inserted can be at any indentation level.

Aren't you glad this is TypeScript, not Python?

### Collapsed and Hidden regions

If you want to show some code which won't be included in the virtual file, add `-h` in the fenced code block header:

``````markdown
```typescript -h
// Now, you might be tempted to do something like:
const uriWithFragment = path.join(uri, fragment);
// ... but it doesn't work like you'd expect.
```
``````

Having said that, you could also just give the block a Region ID which is then overwritten with the "correct" code later.
Overwritten code doesn't make it into the virtual file.
Your choice.

Note that the `// ...` above does not become a Region ID reference.
Not just because it's in a hidden (`-h`) region, but also because there's no trailing ellipsis.

Yes, the `-h` syntax is stolen shamelessly from [LiTScript Regions](https://johtela.github.io/litscript/src/region.html).

### Imports

Let's face it: `import` blocks probably aren't going to help someone understand your code.
For that reason, they can be put anywhere in your `.ts.md` file, even at the very end, and don't need an `id`.

Any fenced code blocks which contain only `import` statements and newlines will be hoisted to the top of the virtual TypeScript file.
