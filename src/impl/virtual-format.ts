import type { ModuleFormat } from "node:module";
import { TSMD_EXT_PATTERN, TSMD_LANG_JS, TSMD_LANG_TS, TSMD_MODULE_CJS, TSMD_MODULE_ESM, type TSMDLanguage, type TSMDModuleType, type TSMDOutputFormat } from "../tsmd.js";

export const getVirtualFormat = (
	specifier: string,
	// context: ResolveHookContext,
): TSMDOutputFormat | undefined => {
	const match = TSMD_EXT_PATTERN.exec(specifier);
	if (match == null) {
		return undefined;
	}
	const ext = match[ 1 ]!;
	const language: TSMDLanguage = ext.includes("js") ? TSMD_LANG_JS : TSMD_LANG_TS;
	const moduleType: TSMDModuleType = ext.startsWith("c") ? TSMD_MODULE_CJS : TSMD_MODULE_ESM;
	const moduleFormat: ModuleFormat = language === "javascript" ? moduleType === TSMD_MODULE_CJS ? "commonjs" : "module" : moduleType === TSMD_MODULE_CJS ? "commonjs-typescript" : "module-typescript";
	// console.log(`[${jsModuleFormat}]`, specifier, "context", context);
	return {
		fullExt: match[ 0 ],
		jsx: ext.endsWith("x") ? "jsx" : "",
		language,
		moduleFormat,
		moduleType,
		virtualExt: ".".concat(ext),
	};
};
