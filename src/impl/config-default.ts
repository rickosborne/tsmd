import { TSMD_FORMAT_NONE, TSMD_LANG_TS, type TSMDConfig } from "../tsmd.js";

export const TSMD_CONFIG_DEFAULT: Readonly<TSMDConfig> = Object.freeze({
	allowOmitLanguage: true,
	defaultLanguage: TSMD_LANG_TS,
	eslintConfigPath: undefined,
	formatter: TSMD_FORMAT_NONE,
	root: true,
});
