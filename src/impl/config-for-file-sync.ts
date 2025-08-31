import { statSync } from "node:fs";
import { dirname } from "node:path";
import { join as pathJoin } from "path";
import type { TSMDConfig, TSMDFile } from "../tsmd.js";
import { TSMD_CONFIG_DEFAULT } from "./config-default.js";
import { configForDirSync } from "./config-for-dir-sync.js";
import { configFromFrontMatter } from "./config-from-front-matter.js";

export const configForFileSync = (() => {
	const fileMap = new WeakMap<TSMDFile, TSMDConfig>();
	const packageRoots = new Set<string>();
	return function getConfigForFileImpl(file: TSMDFile): TSMDConfig {
		const existingForFile = fileMap.get(file);
		if (existingForFile != null) {
			return existingForFile;
		}
		const fmConfig = configFromFrontMatter(file);
		const configs: Partial<TSMDConfig>[] = [ fmConfig ];
		let dirName = dirname(file.filePath);
		while (dirName !== "" && dirName !== "/") {
			const dirConfig = configForDirSync(dirName);
			configs.push(dirConfig);
			if ((dirConfig.root ?? false) || packageRoots.has(dirName)) {
				break;
			}
			if (dirConfig.root === false) {
				continue;
			}
			const packagePath = pathJoin(dirName, "package.json");
			const packageExists = statSync(packagePath, { throwIfNoEntry: false });
			if (packageExists?.isFile()) {
				packageRoots.add(dirName);
				break;
			}
			dirName = dirname(dirName);
		}
		configs.push(TSMD_CONFIG_DEFAULT);
		return configs.reduce((agg, config) => {
			return {
				...config,
				...agg,
			};
		});
	};
})();
