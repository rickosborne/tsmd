import { TSMD_LANG_JS, TSMD_LANG_TS, type TSMDOutputFormat } from "../tsmd.js";

export const KNOWN_LANG = new Map<string, TSMDOutputFormat["language"]>([
	[ "typescript", TSMD_LANG_TS ],
	[ "ts", TSMD_LANG_TS ],
	[ "cts", TSMD_LANG_TS ],
	[ "mts", TSMD_LANG_TS ],
	[ "tsx", TSMD_LANG_TS ],
	[ "javascript", TSMD_LANG_JS ],
	[ "js", TSMD_LANG_JS ],
	[ "jsx", TSMD_LANG_JS ],
	[ "ecmascript", TSMD_LANG_JS ],
	[ "esm", TSMD_LANG_JS ],
	[ "cjs", TSMD_LANG_JS ],
	[ "mjs", TSMD_LANG_JS ],
]);
