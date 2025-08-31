import type { TSMDOutputFormat } from "../tsmd.js";
import { KNOWN_LANG } from "./known-languages.js";

export const normalizeLanguage = (lang: string): TSMDOutputFormat["language"] | undefined => {
	return KNOWN_LANG.get(lang.toLowerCase());
};
