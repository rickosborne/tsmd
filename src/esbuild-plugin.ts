import type { Loader, OnLoadResult, Plugin, PluginBuild } from "esbuild";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "url";
import { parseConfigJson } from "./impl/parse-config-json.js";
import { parseMarkdown } from "./impl/parse-markdown.js";
import { renderVirtualAsync } from "./impl/render-virtual-async.js";
import { getVirtualFormat } from "./impl/virtual-format.js";
import { TSMD_EXT_PATTERN, TSMD_LANG_TS, type TSMDConfig } from "./tsmd.js";

export interface TSMDBuildPluginConfig {
	config?: TSMDConfig | undefined;
	configPath?: string;
}

// noinspection JSUnusedGlobalSymbols
export const tsmdBuildPlugin = (pluginConfig: TSMDBuildPluginConfig = {}): Plugin => {
	let config: TSMDConfig | undefined = pluginConfig.config;
	if (pluginConfig.configPath != null) {
		const configFromFile = parseConfigJson(readFileSync(pluginConfig.configPath, "utf-8"), pluginConfig.configPath);
		config = {
			...configFromFile,
			...config,
		};
	}
	return {
		name: "tsmd",
		setup: (build: PluginBuild) => {
			build.onLoad({
				filter: TSMD_EXT_PATTERN,
				// namespace: "tsmd",  // do we want this?
			}, async ({ path }): Promise<OnLoadResult | undefined> => {
				const format = getVirtualFormat(path);
				if (format == null) {
					return undefined;
				}
				const url = pathToFileURL(path);
				const mdSource = await readFile(path, "utf-8");
				const file = parseMarkdown(mdSource, url, format);
				const contents = await renderVirtualAsync(file, url, format, config);
				let loader: Loader;
				if (format.jsx === "jsx") {
					loader = format.language === TSMD_LANG_TS ? "tsx" : "jsx";
				} else {
					loader = format.language === TSMD_LANG_TS ? "ts" : "js";
				}
				return {
					contents,
					loader,
					pluginName: "tsmd",
				}
			})
		},
	};
};
