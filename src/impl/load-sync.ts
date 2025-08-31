import { readFileSync } from "node:fs";
import type { LoadFnOutput, LoadHookContext, LoadHookSync } from "node:module";
import { fileURLToPath } from "node:url";
import { FORMAT_TSMD } from "../tsmd.js";
import { formatFromImportAttributes } from "./import-attributes.js";
import { parseMarkdown } from "./parse-markdown.js";
import { renderVirtualSync } from "./render-virtual-sync.js";

export const loadSync: LoadHookSync = (
	url: string,
	context: LoadHookContext,
	nextLoad: (
		nextUrl: string,
		nextContext?: Partial<LoadHookContext>,
	) => LoadFnOutput,
): LoadFnOutput => {
	if (context.format !== FORMAT_TSMD) {
		return nextLoad(url, context);
	}
	const format = formatFromImportAttributes(context.importAttributes);
	const mdSource = "" + readFileSync(fileURLToPath(url), { encoding: "utf8" });
	const file = parseMarkdown(mdSource, url, format);
	const virtual = renderVirtualSync(file, url, format);
	return {
		format: format.moduleFormat,
		shortCircuit: true,
		source: virtual,
	};
};
