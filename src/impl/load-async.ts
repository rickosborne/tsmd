import { readFile } from "node:fs/promises";
import type { LoadFnOutput, LoadHook, LoadHookContext } from "node:module";
import { fileURLToPath } from "node:url";
import { FORMAT_TSMD } from "../tsmd.js";
import { formatFromImportAttributes } from "./import-attributes.js";
import { parseMarkdown } from "./parse-markdown.js";
import { renderVirtualAsync } from "./render-virtual-async.js";

export const loadAsync: LoadHook = async (
	url: string,
	context: LoadHookContext,
	nextLoad: (
		nextUrl: string,
		nextContext?: Partial<LoadHookContext>,
	) => LoadFnOutput | Promise<LoadFnOutput>,
): Promise<LoadFnOutput> => {
	if (context.format !== FORMAT_TSMD) {
		return nextLoad(url, context);
	}
	const format = formatFromImportAttributes(context.importAttributes);
	const mdSource = "" + await readFile(fileURLToPath(url), { encoding: "utf8" });
	const file = parseMarkdown(mdSource, url, format);
	const virtual = await renderVirtualAsync(file, url, format);
	return {
		format: format.moduleFormat,
		shortCircuit: true,
		source: virtual,
	};
};
