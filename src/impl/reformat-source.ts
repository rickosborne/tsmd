import type { Linter } from "eslint";
import { dirname } from "node:path";
import { TSMD_FORMAT_NONE, type TSMDConfig, type TSMDFormatterName } from "../tsmd.js";
import type { Options as PrettierOptions } from "prettier";

type PrettierFormat = (source: string, options?: PrettierOptions) => Promise<string>;

type Formatter = (source: string, virtualPath: string) => Promise<string> | string;

const loadFormatter = async (name: TSMDFormatterName, config: TSMDConfig): Promise<Formatter> => {
	switch (name) {
		case TSMD_FORMAT_NONE: {
			return (s) => s;
		}
		case "prettier": {
			const { format } = (await import("prettier")) as { format: PrettierFormat };
			return async function prettierFormat(source: string, virtualPath: string): Promise<string> {
				const formatted = await format(source, {
					filepath: virtualPath,
				});
				return formatted;
			};
		}
		case "eslint": {
			const { ESLint } = await import("eslint");
			let baseConfig: Linter.Config | undefined = undefined;
			if (config.eslintConfigPath != null) {
				baseConfig = ((await import(config.eslintConfigPath)) as { default: Linter.Config }).default;
			}
			const eslint = new ESLint({
				baseConfig,
				cwd: config.eslintConfigPath == null ? undefined : dirname(config.eslintConfigPath),
				fix: true,
				overrideConfig: baseConfig,
				overrideConfigFile: config.eslintConfigPath,
				// useEslintrc: false,
			});
			const formatter = await eslint.loadFormatter();
			return async function eslintFormat(source: string, virtualPath: string): Promise<string> {
				const results = await eslint.lintText(source, { filePath: virtualPath, warnIgnored: false });
				const formatted = await formatter.format(results);
				return formatted;
			};
		}
		default: {
			throw new Error(`Unknown formatter: ${ name }`);
		}
	}
};

export const reformatSource = (() => {
	const formatters = new Map<TSMDFormatterName, Formatter>([
		[ TSMD_FORMAT_NONE, (s) => s ],
	]);
	return async (
		source: string,
		virtualPath: string,
		config: TSMDConfig,
	): Promise<string> => {
		const formatterName = config.formatter ?? TSMD_FORMAT_NONE;
		let formatter = formatters.get(formatterName);
		if (formatter == null) {
			formatter = await loadFormatter(formatterName, config);
			formatters.set(formatterName, formatter);
		}
		return formatter(source, virtualPath);
	};
})();
