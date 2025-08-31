import { expect } from "chai";
import { describe, test } from "mocha";
import { linesOf, type TextLine } from "../lines-of.js";

const textLine = (line: string, num: number, charIndex: number): TextLine => ({ charIndex, line, num });

describe(linesOf.name, () => {
	test("empty", () => {
		expect(Array.from(linesOf(""))).eql([ textLine("", 1, 0) ]);
	});

	test("blanks", () => {
		expect(Array.from(linesOf(`
abc
123

xyz
		`.trim()))).eql([
			textLine("abc", 1, 0),
			textLine("123", 2, 4),
			textLine("", 3, 8),
			textLine("xyz", 4, 9),
		]);
	});

	test("trim-end", () => {
		expect(Array.from(linesOf("\tabc\t\n def ", { trim: "end" }))).eql([
			textLine("\tabc", 1, 0),
			textLine(" def", 2, 6),
		]);
	});
});
