import { type TSMDOutputFormat } from "../tsmd.js";
import { normalizeLanguage } from "./normalize-language.js";

export const isRenderedLanguage = (sourceLang: string, outLang: TSMDOutputFormat["language"]): boolean => {
	return normalizeLanguage(sourceLang) === outLang;
};
