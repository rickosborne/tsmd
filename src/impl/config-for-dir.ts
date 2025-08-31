import { readFile } from "node:fs/promises";
import { join as pathJoin } from "path";
import { TSMD_CONFIG_NAME, type TSMDConfig, type TSMDConfigWithPath } from "../tsmd.js";
import { parseConfigJson } from "./parse-config-json.js";

export const configForDir = (() => {
	const cache = new Map<string, Partial<TSMDConfig>>();
	return async (dirPath: string): Promise<Partial<TSMDConfigWithPath>> => {
		const existing = cache.get(dirPath);
		if (existing != null) {
			return existing;
		}
		const configPath = pathJoin(dirPath, TSMD_CONFIG_NAME);
		const text = await readFile(configPath, "utf-8").catch(() => undefined);
		if (text != null) {
			const dirConfig = parseConfigJson(text, configPath);
			if (dirConfig != null) {
				cache.set(dirPath, dirConfig);
				return dirConfig;
			}
		}
		cache.set(dirPath, {});
		return {};
	};
})();
