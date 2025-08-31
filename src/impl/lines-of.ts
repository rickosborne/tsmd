export interface LinesOfOptions {
	eol?: string | undefined;
	trim?: boolean | "end" | undefined;
}

export interface LineReader extends Generator<TextLine, undefined, undefined> {
	readonly charIndex: number;
	readonly done: boolean;
	readonly line: string;
	readonly num: number;
}

export type TextLine = {
	/**
	 * The character index of the start of the line in the original text, starting at `0`.
	 */
	charIndex: number;
	/**
	 * The text of the line.  Affected by the `trim` option.
	 */
	line: string;
	/**
	 * The line number, starting at `1`.
	 */
	num: number;
};

export function linesOf(
	text: string,
	options: LinesOfOptions = {},
): LineReader {
	let charIndex = 0;
	const length = text.length;
	const eol = options.eol ?? "\n";
	const eolLength = eol.length;
	if (eolLength < 1) {
		throw new SyntaxError("eol must be at least 1 character");
	}
	const trim = options.trim ?? true;
	const trimEnd = trim === "end";
	let num = 0;
	let done = false;
	let line = "";

	function *lineReader(): Generator<TextLine, undefined, undefined> {
		do {
			num++;
			let br = text.indexOf(eol, charIndex);
			if (br < 0) {
				br = length;
			}
			line = text.substring(charIndex, br);
			if (trimEnd) {
				line = line.replace(/\s+$/, "");
			} else if (trim) {
				line = line.trim();
			}
			yield { charIndex, line, num };
			charIndex = br + eolLength;
		} while (charIndex < length);
		done = true;
	}

	const reader = lineReader();
	return Object.defineProperties(reader, {
		charIndex: {
			get(): number {
				return charIndex;
			},
		},
		done: {
			get(): boolean {
				return done;
			},
		},
		line: {
			get(): string {
				return line;
			},
		},
		num: {
			get(): number {
				return num;
			},
		},
	}) as LineReader;
}
