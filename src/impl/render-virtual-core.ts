import { basename, dirname, join as pathJoin } from "node:path";
import { SourceMapGenerator } from "source-map";
import { pathToFileURL } from "url";
import type { FencedSource, TSMDConfig, TSMDFile, TSMDOutputFormat } from "../tsmd.js";
import { isRenderedLanguage } from "./is-rendered-language.js";
import type { TextLine } from "./lines-of.js";
import { camelWords, kebabWords, splitWords, titleWords } from "./words.js";

interface SourceCode extends TextLine {
	id?: string | undefined;
	type: "code"
}

interface SourceRef extends TextLine {
	id?: undefined;
	ref: string;
	type: "ref"
}

interface SourceBlocks extends TextLine {
	blocks: SourceObj[];
	id?: string | undefined;
	type: "blocks";
}

type SourceObj = SourceCode | SourceRef | SourceBlocks;

const refFromLine = (textLine: TextLine): SourceRef | undefined => {
	const single = /^\s*\/\/\s*(\.{3,}|[…᠁⋯])\s*(.+?)\s*\1/.exec(textLine.line);
	let ref: string | undefined = single?.[ 2 ];
	if (ref == null) {
		const pair = /^\s*\/\*\s*(\.{3,}|[…᠁⋯])\s*(.+?)\s*\1\s*\*\//.exec(textLine.line);
		ref = pair?.[ 2 ];
	}
	if (ref == null) {
		return undefined;
	}
	return { ...textLine, ref, type: "ref" };
};

const codeFromLine = (textLine: TextLine): SourceCode => {
	return { ...textLine, type: "code" };
};

const parseSource = (
	source: FencedSource,
	_config: TSMDConfig,
): SourceObj => {
	const blocks: SourceObj[] = [];
	for (const textLine of source.source) {
		const ref = refFromLine(textLine);
		if (ref != null) {
			blocks.push(ref);
		} else {
			const code: SourceCode = codeFromLine(textLine);
			blocks.push(code);
		}
	}
	if (blocks.length === 1) {
		return blocks[ 0 ]!;
	}
	return { ...source, blocks, type: "blocks" };
};

interface OnVisitReturn<T> {
	returnValue: T;
	type: "done";
}

type SourceObjVisitor<T> = (code: SourceObj, parent: SourceBlocks | undefined, index: number) => (OnVisitReturn<T> | undefined | void);

const visitBlocks = <T = void>(source: SourceBlocks, defaultReturn: T, visitor: SourceObjVisitor<T>): T => {
	const visit = (block: SourceObj, parent: SourceBlocks | undefined, index: number): OnVisitReturn<T> | undefined | void => {
		let choice: OnVisitReturn<T> | undefined | void = undefined;
		const type = block.type;
		if (block.type === "ref") {
			choice = visitor(block, parent, index);
		} else if (block.type === "code") {
			choice = visitor(block, parent, index);
		} else if (block.type === "blocks") {
			choice = visitor(block, parent, index);
			if (choice == null) {
				for (let i = 0; i < block.blocks.length; i++) {
					choice = visit(block.blocks[ i ]!, block, i);
					if (choice != null) {
						break;
					}
				}
			}
		} else {
			throw new Error(`Unknown source type: ${ JSON.stringify(type) }`);
		}
		return choice;
	};
	const result = visit(source, undefined, 0);
	return result?.returnValue ?? defaultReturn;
};

const replaceObj = (before: SourceObj, after: SourceObj, top: SourceBlocks): boolean => {
	return visitBlocks(
		top,
		false,
		(obj: SourceObj, parent: SourceBlocks | undefined, index: number): (OnVisitReturn<boolean> | void) => {
			if (obj === before) {
				if (parent == null) {
					throw new Error("Unexpected attempt to replace top-level parent.");
				}
				parent.blocks[ index ] = after;
				return { returnValue: true, type: "done" };
			}
		},
	);
};

const appendSibling = (before: SourceObj, after: SourceObj, top: SourceBlocks): boolean => {
	const blocks = top.blocks;
	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[ i ]!;
		if (block === before) {
			blocks.splice(i + 1, 0, after);
			return true;
		} else if (block.type === "blocks") {
			const replaced = appendSibling(before, after, block);
			if (replaced) {
				return true;
			}
		}
	}
	return false;
};

const REF_TRANSFORMS: ((ref: string) => string)[] = [
	(ref) => ref,
	(ref) => kebabWords(ref),
	(ref) => kebabWords(ref.toLowerCase()),
	(ref) => camelWords(ref),
	(ref) => camelWords(ref.toLowerCase()),
	(ref) => titleWords(ref),
	(ref) => splitWords(ref)[ 0 ]!,
	(ref) => splitWords(ref)[ 0 ]!.toLowerCase(),
];

const resolveRef = (source: SourceRef, objById: Map<string, SourceObj>): SourceObj | undefined => {
	const ref = source.ref;
	for (const transform of REF_TRANSFORMS) {
		const actual = transform(ref);
		const obj = objById.get(actual);
		if (obj != null) {
			return obj;
		}
	}
	console.warn(`Unresolved reference: ${ JSON.stringify(ref) }`);
	return undefined;
};

const refResolvesToId = (source: SourceRef, id: string): boolean => {
	const ref = source.ref;
	for (const transform of REF_TRANSFORMS) {
		const actual = transform(ref);
		if (actual === id) {
			return true;
		}
	}
	return false;
};

const loggableSource = (source: SourceObj, file: TSMDFile): string => {
	let base = file.url.concat(":", source.num.toString(10));
	if (source.id != null) {
		base = base.concat(" id=", JSON.stringify(source.id));
	}
	const type = source.type;
	if (source.type === "code") {
		return base.concat(` code: ${ source.line }`);
	} else if (source.type === "ref") {
		return base.concat(` ref: ${ source.ref }`);
	} else if (source.type === "blocks") {
		return base.concat(` block: ${ source.blocks.length } line${ source.blocks.length === 1 ? "" : "s" }`);
	}
	return base.concat(` ?${ type }?`);
};

const replaceRef = (id: string, after: SourceObj, top: SourceBlocks): boolean => {
	return visitBlocks(
		top,
		false,
		(obj: SourceObj, parent: SourceBlocks | undefined, index: number): (OnVisitReturn<boolean> | void) => {
			if (obj.type === "ref" && refResolvesToId(obj, id)) {
				if (parent == null) {
					throw new SyntaxError("Unexpected attempt to replace top-level parent.");
				}
				parent.blocks[ index ] = after;
				return { returnValue: true, type: "done" };
			}
		},
	);
};

const IMPORT_STATEMENT_PATTERN = /^import\s+\{.+?}\s+from\s+".+?"(?:\s+with\s+\{.+?})?;?$/ms;

const isImportOrEmptyLine = (line: string): boolean => IMPORT_STATEMENT_PATTERN.test(line) || /^\s+$/.test(line);

const isImportBlock = (source: SourceObj): boolean => {
	if (source.type === "code") {
		return isImportOrEmptyLine(source.line);
	}
	if (source.type === "blocks") {
		return source.blocks.every((block) => isImportBlock(block));
	}
	return false;
};

interface RenderedVirtual {
	originalDir: string;
	originalFileName: string;
	virtualFileName: string;
	virtualPath: string;
	virtualSource: string;
}

export const renderVirtualCore = (
	file: TSMDFile,
	urlOrPath: string | URL,
	format: TSMDOutputFormat,
	config: TSMDConfig,
): RenderedVirtual => {
	// const config = maybeConfig ?? getConfigForFileSync(file);
	const top: SourceBlocks = {
		charIndex: 0,
		blocks: [],
		line: "",
		num: 1,
		type: "blocks",
	};
	let lastObj: SourceObj | undefined = undefined;
	const objById = new Map<string, SourceObj>();
	const originalFileName = basename(file.filePath);
	const originalDir = dirname(file.filePath);
	const virtualFileName = originalFileName.replace(format.fullExt, format.virtualExt);
	const virtualPath = pathJoin(originalDir, virtualFileName);
	for (const source of file.sources) {
		const language = source.language ?? config.defaultLanguage;
		if (language == null && !config.allowOmitLanguage) {
			throw new SyntaxError(`A language identifier is required at: ${ urlOrPath.toString() }:${ source.line }`);
		}
		if (language != null && format.language != null && !isRenderedLanguage(language, format.language)) {
			continue;
		}
		let added = false;
		const obj: SourceObj = parseSource(source, config);
		const id = source.attrs?.id;
		if (id != null) {
			const before = objById.get(id);
			objById.set(id, obj);
			if (before != null) {
				added = replaceObj(before, obj, top);
			}
			if (!added) {
				added = replaceRef(id, obj, top);
			}
		}
		if (lastObj != null && !added) {
			added = appendSibling(lastObj, obj, top);
		}
		if (!added) {
			if (isImportBlock(obj)) {
				top.blocks.unshift(obj);
			} else {
				top.blocks.push(obj);
			}
			added = true;
		}
		lastObj = obj;
	}
	const text: string[] = [];
	const visited = new Set<SourceObj>();
	const sourceMap = new SourceMapGenerator({
		file: virtualFileName,
		sourceRoot: pathToFileURL(originalDir).toString(),
	});
	// sourceMap.setSourceContent(originalFileName, markdown);
	const addObj = (obj: SourceObj): void => {
		const type = obj.type;
		if (visited.has(obj)) {
			console.warn(`Cycle detected: ${ loggableSource(obj, file) }`);
			return;
		}
		visited.add(obj);
		if (obj.type === "code") {
			text.push(obj.line);
			sourceMap.addMapping({
				generated: {
					column: 1,
					line: text.length,
				},
				...(obj.id == null ? {} : { name: obj.id }),
				original: {
					column: 1,
					line: obj.num,
				},
				source: originalFileName,
			});
		} else if (obj.type === "ref") {
			const ref = resolveRef(obj, objById);
			if (ref == null) {
				text.push(obj.line);
			} else {
				addObj(ref);
			}
		} else if (obj.type === "blocks") {
			for (const block of obj.blocks) {
				addObj(block);
			}
		} else {
			throw new Error(`Unknown SourceObj type: ${ type }`);
		}
	};
	addObj(top);
	const sourceMapComment = "//# sourceMappingURL=data:application/json;base64,".concat(Buffer.from(sourceMap.toString()).toString("base64"));
	text.push(sourceMapComment);
	return {
		originalDir,
		originalFileName,
		virtualSource: text.join("\n"),
		virtualFileName,
		virtualPath,
	};
};

