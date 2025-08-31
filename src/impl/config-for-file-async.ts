import { stat } from "node:fs/promises";
import { dirname } from "node:path";
import { join as pathJoin } from "path";
import type { TSMDConfig, TSMDFile } from "../tsmd.js";
import { TSMD_CONFIG_DEFAULT } from "./config-default.js";
import { configForDir } from "./config-for-dir.js";
import { configFromFrontMatter } from "./config-from-front-matter.js";

export const configForFileAsync = (() => {
	const fileMap = new WeakMap<TSMDFile, TSMDConfig>();
	const packageRoots = new Set<string>();
	return async function getConfigForFileImpl(file: TSMDFile): Promise<TSMDConfig> {
		const existingForFile = fileMap.get(file);
		if (existingForFile != null) {
			return existingForFile;
		}
		const fmConfig = configFromFrontMatter(file);
		const configs: Partial<TSMDConfig>[] = [ fmConfig ];
		let dirName = dirname(file.filePath);
		while (dirName !== "" && dirName !== "/") {
			const dirConfig = await configForDir(dirName);
			configs.push(dirConfig);
			if ((dirConfig.root ?? false) || packageRoots.has(dirName)) {
				break;
			}
			if (dirConfig.root === false) {
				continue;
			}
			const packagePath = pathJoin(dirName, "package.json");
			const packageExists = await stat(packagePath).catch((_err: unknown) => undefined);
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
