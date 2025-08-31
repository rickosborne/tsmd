import type { ModuleFormat } from "node:module";
import type { TextLine } from "./impl/lines-of.js";

export const TSMD_EXT_PATTERN = /\.([cm]?[tj]sx?)\.md$/;

export const TSMD_MODULE_CJS = "commonjs";
export const TSMD_MODULE_ESM = "module";

export type TSMDModuleType = typeof TSMD_MODULE_CJS | typeof TSMD_MODULE_ESM;

export const TSMD_LANG_TS = "typescript";
export const TSMD_LANG_JS = "javascript";

export type TSMDLanguage = typeof TSMD_LANG_TS | typeof TSMD_LANG_JS

export type TSMDUsesJSX = "jsx" | "";

export const TSMD_FORMAT_BIOME = "biome";
export const TSMD_FORMAT_PRETTIER = "prettier";
export const TSMD_FORMAT_ESLINT = "eslint";
export const TSMD_FORMAT_STANDARD = "ts-standard";
export const TSMD_FORMAT_NONE = "none";

export type TSMDFormatterName = typeof TSMD_FORMAT_BIOME | typeof TSMD_FORMAT_PRETTIER | typeof TSMD_FORMAT_ESLINT | typeof TSMD_FORMAT_STANDARD | typeof TSMD_FORMAT_NONE;

export const FORMAT_TSMD = "tsmd";

export interface TSMDOutputFormat {
	fullExt: string;
	jsx: TSMDUsesJSX;
	language: TSMDLanguage;
	moduleFormat: ModuleFormat;
	moduleType: TSMDModuleType;
	virtualExt: string;
}

export type FrontMatter = Record<string, unknown>;

export interface FencedBlock extends TextLine {
	attrs?: TSMDSourceAttrs | undefined;
	fence: string;
	language?: string | undefined;
}

export interface FencedSource extends FencedBlock {
	source: TextLine[];
}

export interface TSMDFile {
	filePath: string;
	frontMatter?: FrontMatter | undefined;
	sources: FencedSource[];
	url: string;
}

export interface TSMDSourceAttrs extends Record<string, string | undefined> {
	id?: string;
}

export interface TSMDConfig {
	allowOmitLanguage?: boolean | undefined;
	defaultLanguage?: TSMDOutputFormat["language"] | undefined;
	eslintConfigPath?: string | undefined;
	formatter?: TSMDFormatterName | undefined;
	root?: boolean | undefined;
}

export interface TSMDConfigWithPath extends Partial<TSMDConfig> {
	path: string;
}

export const TSMD_CONFIG_NAME = ".tsmd.json";
