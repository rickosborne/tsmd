import type { TSMDConfig, TSMDFile, TSMDOutputFormat } from "../tsmd.js";
import { configForFileAsync } from "./config-for-file-async.js";
import { reformatSource } from "./reformat-source.js";
import { renderVirtualCore } from "./render-virtual-core.js";

export const renderVirtualAsync = async (
	file: TSMDFile,
	urlOrPath: string | URL,
	format: TSMDOutputFormat,
	maybeConfig?: TSMDConfig | undefined,
): Promise<string> => {
	const config = maybeConfig ?? await configForFileAsync(file);
	const {
		virtualPath,
		virtualSource,
	} = renderVirtualCore(file, urlOrPath, format, config);
	return reformatSource(virtualSource, virtualPath, config);
};
