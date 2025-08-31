import type { TSMDConfig, TSMDFile, TSMDOutputFormat } from "../tsmd.js";
import { configForFileSync } from "./config-for-file-sync.js";
import { renderVirtualCore } from "./render-virtual-core.js";

export const renderVirtualSync = (
	file: TSMDFile,
	url: string,
	format: TSMDOutputFormat,
	maybeConfig?: TSMDConfig | undefined,
): string => {
	const config = maybeConfig ?? configForFileSync(file);
	const { virtualSource } = renderVirtualCore(file, url, format, config);
	return virtualSource;
};
