export const splitWords = (text: string) => text.split(/\s+/g);

export const ucFirst = (text: string) => {
	if (text.length < 2) {
		return text.toUpperCase();
	}
	return text.substring(0, 1).toUpperCase().concat(text.substring(1));
};

export const titleWord = (word: string) => {
	if (word.length < 2) {
		return word.toUpperCase();
	}
	return word.substring(0, 1).toUpperCase().concat(word.substring(1).toLowerCase());
};

export const kebabWords = (text: string) => splitWords(text).join("-");

export const camelWords = (text: string) => splitWords(text).map((word, index) => index === 0 ? word.toLowerCase() : ucFirst(word)).join("");

export const titleWords = (text: string) => splitWords(text).map((word) => titleWord(word)).join("");
