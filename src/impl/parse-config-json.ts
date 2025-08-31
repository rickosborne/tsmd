import type { TSMDConfigWithPath } from "../tsmd.js";
import { fixConfigPaths } from "./fix-config-paths.js";
import { parseConfig } from "./parse-config.js";

export const parseConfigJson = (text: string, configPath: string): TSMDConfigWithPath | undefined => {
	try {
		const json: unknown = JSON.parse(text);
		if (json != null && typeof json === "object") {
			const dirConfig = parseConfig(json, configPath);
			return fixConfigPaths(dirConfig, configPath);
		}
	} catch (err: unknown) {
		console.error(err);
		console.error(`Failed to parse config: ${ configPath }`);
	}
	return undefined;
};
