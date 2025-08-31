import { dirname } from "node:path";
import { resolve as pathResolve } from "path";
import type { TSMDConfig, TSMDConfigWithPath } from "../tsmd.js";

export const fixConfigPaths = (config: Partial<TSMDConfig>, path: string): TSMDConfigWithPath => {
	const fixed: TSMDConfigWithPath = { ...config, path };
	if (fixed.eslintConfigPath?.startsWith(".")) {
		fixed.eslintConfigPath = pathResolve(dirname(path), fixed.eslintConfigPath);
	}
	return fixed;
};
