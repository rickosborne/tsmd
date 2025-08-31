import type { TSMDConfig, TSMDFile } from "../tsmd.js";

import { parseConfig } from "./parse-config.js";

export const configFromFrontMatter = (file: TSMDFile): Partial<TSMDConfig> => {
	const fm = file.frontMatter;
	if (fm?.[ "tsmd" ] == null) {
		return {};
	}
	return parseConfig(fm[ "tsmd" ], file.filePath);
};
