import { entriesOf } from "@rickosborne/foundation/entries-of";
import type { TSMDConfig } from "../tsmd.js";
import { TSMD_CONFIG_DEFAULT } from "./config-default.js";
import { fixConfigPaths } from "./fix-config-paths.js";

export const parseConfig = (config: unknown, filePath: string): Partial<TSMDConfig> => {
	const result: Partial<TSMDConfig> = {};
	if (config != null && typeof config === "object") {
		const maybeConfig = config as Partial<TSMDConfig>;
		for (const [ key, defaultValue ] of entriesOf(TSMD_CONFIG_DEFAULT)) {
			let value = maybeConfig[ key ];
			if (value == null) {
				value = defaultValue;
			} else if (defaultValue != null && typeof value !== typeof defaultValue) {
				console.error(`Wrong config type for ${ key }, expected ${ typeof defaultValue } found actual ${ typeof value }, in: ${ filePath }`);
				value = defaultValue;
			} else {
				(result as Record<string, unknown>)[ key ] = value;
			}
		}
		for (const [ key ] of entriesOf(config)) {
			if (key in TSMD_CONFIG_DEFAULT) {
				// handled above
			} else if (key !== "$schema") {
				console.error(`Unknown config key ${ JSON.stringify(key) } in ${ filePath }`);
			}
		}
	}
	return fixConfigPaths(result, filePath);
};
