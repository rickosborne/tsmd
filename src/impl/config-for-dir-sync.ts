import { existsSync, readFileSync } from "node:fs";
import { join as pathJoin } from "path";
import { TSMD_CONFIG_NAME, type TSMDConfig, type TSMDConfigWithPath } from "../tsmd.js";
import { parseConfigJson } from "./parse-config-json.js";

export const configForDirSync = (() => {
	const cache = new Map<string, Partial<TSMDConfig>>();
	return (dirPath: string): Partial<TSMDConfigWithPath> => {
		const existing = cache.get(dirPath);
		if (existing != null) {
			return existing;
		}
		const configPath = pathJoin(dirPath, TSMD_CONFIG_NAME);
		let text: string | undefined;
		try {
			if (existsSync(configPath)) {
				text = readFileSync(configPath, "utf-8");
				const dirConfig = parseConfigJson(text, configPath);
				if (dirConfig != null) {
					cache.set(dirPath, dirConfig);
					return dirConfig;
				}
			}
		} catch (err: unknown) {
			console.error(err);
			console.error(`Failed to parse config: ${ configPath }`);
		}
		cache.set(dirPath, {});
		return {};
	};
})();
