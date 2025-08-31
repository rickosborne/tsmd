import { describe, test } from "mocha";
import { expect } from "chai";
import { readFile } from "node:fs/promises";
import { join as pathJoin } from "node:path";
import { TSMD_LANG_TS, TSMD_MODULE_ESM } from "../../tsmd.js";
import { parseMarkdown } from "../parse-markdown.js";
import { renderVirtualAsync } from "../render-virtual-async.js";

const thisDir = __dirname;
const mdPath = pathJoin(thisDir, "fibonacci.ts.md");
const prettierPath = pathJoin(thisDir, "fibonacci.prettier.ts");

describe(renderVirtualAsync.name, () => {
	test("prettier", async () => {
		const md = await readFile(mdPath, "utf-8");
		const ts = await readFile(prettierPath, "utf-8");
		const parsed = parseMarkdown(md, mdPath);
		const rendered = await renderVirtualAsync(parsed, mdPath, {
			language: TSMD_LANG_TS,
			virtualExt: ".ts",
			moduleFormat: "module-typescript",
			moduleType: TSMD_MODULE_ESM,
			jsx: "",
			fullExt: ".ts.md",
		});
		expect(rendered).eql(ts);
	});
});
