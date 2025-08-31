import { describe, test } from "mocha";
import { expect } from "chai";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { TSMDFile } from "../../tsmd.js";
import { parseMarkdown } from "../parse-markdown.js";
import { dirname, join as pathJoin } from "node:path";

// const thisFile = __filename;
const thisDir = dirname(fileURLToPath(import.meta.url));
const fixturePath = pathJoin(thisDir, "fibonacci.ts.md");

describe(parseMarkdown.name, () => {
	test("fibonacci.ts.md", async () => {
		const md = await readFile(fixturePath, "utf-8");
		const parsed = parseMarkdown(md, fixturePath);
		const expected: TSMDFile = {
			filePath: "",
			sources: [],
			url: fixturePath,
		};
		expect(parsed).eql(expected);
	});
});
