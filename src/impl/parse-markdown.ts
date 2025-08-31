import { fileURLToPath } from "node:url";
import { pathToFileURL } from "url";
import type { FencedBlock, FencedSource, FrontMatter, TSMDFile, TSMDOutputFormat } from "../tsmd.js";
import { type LineReader, linesOf, type TextLine } from "./lines-of.js";
import { parseAttrs } from "./parse-attrs.js";
import { parse as parseYaml } from "yaml";

const readUntil = (
	terminator: string,
	reader: LineReader,
	onEOF?: (prev: TextLine | undefined) => (Error | undefined),
): TextLine[] => {
	const result: TextLine[] = [];
	let it: IteratorResult<TextLine, undefined>;
	let lastLine: TextLine | undefined = undefined;
	do {
		it = reader.next();
		if (it == null || it.done) {
			const err = onEOF?.(lastLine);
			if (err != null) {
				throw err;
			}
			break;
		}
		const textLine = it.value;
		if (textLine.line === terminator) {
			break;
		}
		result.push(textLine);
		lastLine = textLine;
	} while (!it.done);
	return result;
};

const readFrontMatter = (
	reader: LineReader,
	filePath: string,
): FrontMatter => {
	readUntil("---", reader);
	const text = readUntil("---", reader, () => new SyntaxError("Unterminated front matter"))
		.map((t) => t.line.replace(/^(\t+)/, (t) => "    ".repeat(t.length))).join("\n");
	const yaml: unknown = parseYaml(text);
	if (yaml != null && typeof yaml === "object") {
		return yaml as FrontMatter;
	}
	console.warn(`Failed to parse front matter: ${filePath}`);
	return {};
};

const readFenced = (
	reader: LineReader,
	fenced: FencedBlock,
): TextLine[] => {
	return readUntil(fenced.fence, reader, () => new SyntaxError(`Unterminated fenced code block starting at line ${ fenced.num - 1 }: ${JSON.stringify(fenced.fence)}`));
};

interface DocLinesAndBlockStart {
	docLines: string[];
	fenced?: FencedBlock | undefined;
}

const readDoc = (
	reader: LineReader,
): DocLinesAndBlockStart => {
	const docLines: string[] = [];
	let fenced: FencedBlock | undefined = undefined;
	while (!reader.done) {
		const it = reader.next();
		if (it.done) {
			break;
		}
		const { charIndex, line, num } = it.value;
		const match = /^(\s*```+)(\S*)(?:\s+(.*))?$/.exec(line);
		if (match != null) {
			const attrText = match[3];
			const attrs = attrText == null ? undefined : parseAttrs(attrText, num);
			fenced = {
				attrs, charIndex, line, num,
				fence: match[ 1 ]!,
				language: match[ 2 ],
			};
			break;
		}
	}
	return { fenced, docLines };
};


export const parseMarkdown = (
	text: string,
	urlOrPath: string | URL,
	_format?: TSMDOutputFormat,
): TSMDFile => {
	const sources: FencedSource[] = [];
	const url = urlOrPath instanceof URL ? urlOrPath : pathToFileURL(urlOrPath);
	const filePath = urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;
	const file: TSMDFile = { filePath, sources, url: url.href };
	const reader = linesOf(text, { trim: "end" });
	if (text.startsWith("---\n")) {
		file.frontMatter = readFrontMatter(reader, filePath);
	}
	while (!reader.done) {
		const { fenced } = readDoc(reader);
		if (fenced != null) {
			const source = readFenced(reader, fenced);
			sources.push({ ...fenced, source });
		}
	}
	return file;
};
