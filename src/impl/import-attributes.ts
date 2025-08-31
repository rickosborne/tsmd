import { assertDefined, expectDefined } from "@rickosborne/guard/is-defined";
import { TSMD_LANG_JS, TSMD_LANG_TS, TSMD_MODULE_CJS, TSMD_MODULE_ESM, type TSMDOutputFormat } from "../tsmd.js";

import type { ImportAttributes } from "node:module";

const ensureOneOf = <T extends string>(value: string | undefined, name: string, ...expected: T[]): T => {
	assertDefined(value, name);
	for (const one of expected) {
		if (value == one) {
			return one;
		}
	}
	throw new Error(`${ name } must be one of: ${ expected.map((v) => JSON.stringify(v)).join(" ") }`);
};

export const formatFromImportAttributes = (attr: ImportAttributes): TSMDOutputFormat => {
	return {
		fullExt: expectDefined(attr[ "fullExt" ], "fullExt"),
		jsx: ensureOneOf(attr[ "jsx" ], "jsx", "jsx", ""),
		language: ensureOneOf(attr[ "language" ], "language", TSMD_LANG_JS, TSMD_LANG_TS),
		moduleFormat: ensureOneOf(attr["moduleFormat"], "commonjs", "commonjs-typescript", "module", "module-typescript"),
		moduleType: ensureOneOf(attr[ "moduleType" ], "moduleType", TSMD_MODULE_ESM, TSMD_MODULE_CJS),
		virtualExt: expectDefined(attr[ "virtualExt" ], "virtualExt"),
	};
};
