import type { TSMDSourceAttrs } from "../tsmd.js";

interface TextCursor {
	at: number;
	done: boolean;
	gen: StringIterator<string>;
	num: number;
	peeked: string[];
	text: string;
	unseen: string[];
}

const cursorPeek = (cursor: TextCursor): string | undefined => {
	if (cursor.unseen.length > 0) {
		const seen = cursor.unseen.shift()!;
		cursor.peeked.push(seen);
		return seen;
	}
	const it = cursor.gen.next();
	if (it.done) {
		return undefined;
	}
	const char = it.value;
	cursor.peeked.push(char);
	return char;
};

const cursorTake = (cursor: TextCursor): string | undefined => {
	if (cursor.unseen.length > 0) {
		return cursor.unseen.shift();
	}
	if (cursor.peeked.length > 0) {
		return cursor.peeked.shift();
	}
	if (cursor.done) {
		return undefined;
	}
	const it = cursor.gen.next();
	if (it.done) {
		cursor.done = true;
		return undefined;
	}
	return it.value;
};

const readWhile = (pattern: RegExp, cursor: TextCursor): string => {
	let result = "";
	while (cursor.peeked.length > 0) {
		const char = cursor.peeked.shift()!;
		if (pattern.test(char)) {
			result = result.concat(char);
		} else {
			cursor.peeked.unshift(char);
			return result;
		}
	}
	while (!cursor.done) {
		const char = cursorPeek(cursor);
		if (char == null || !pattern.test(char)) {
			break;
		}
		cursorTake(cursor);
		result = result.concat(char);
	}
	return result;
};

const readAttr = (cursor: TextCursor): [ string, string ] | [ undefined, undefined ] => {
	// remove any trailing space
	readWhile(/\s/, cursor);
	const name = readWhile(/[^\s=]/, cursor);
	if (name === "") {
		return [ undefined, undefined ];
	}
	const eqOrSpace = cursorTake(cursor);
	if (eqOrSpace == null || /\s/.test(eqOrSpace)) {
		if (eqOrSpace != null) {
			readWhile(/\s/, cursor);
		}
		return [ name, name ];
	}
	const maybeQuote = cursorPeek(cursor);
	let takeWhile: RegExp;
	let takeSuffix: string | undefined = undefined;
	if (maybeQuote === '"') {
		takeWhile = /[^"]/;
		cursorTake(cursor);
		takeSuffix = maybeQuote;
	} else if (maybeQuote === "'") {
		takeWhile = /[^']/;
		cursorTake(cursor);
		takeSuffix = maybeQuote;
	} else {
		takeWhile = /\S/;
	}
	const value = readWhile(takeWhile, cursor);
	if (takeSuffix != null) {
		const endQuote = cursorTake(cursor);
		if (endQuote !== takeSuffix) {
			throw new Error(`Unterminated attribute value for ${ JSON.stringify(name) } on line ${ cursor.num }`);
		}
	}
	return [ name, value ];
};

export const parseAttrs = (text: string, lineNum: number): TSMDSourceAttrs => {
	const attrs: TSMDSourceAttrs = {};
	const cursor: TextCursor = {
		at: 0,
		done: false,
		gen: text[ Symbol.iterator ](),
		num: lineNum,
		peeked: [],
		text,
		unseen: [],
	};
	while (!cursor.done) {
		const [ name, value ] = readAttr(cursor);
		if (name != null && value != null) {
			attrs[ name ] = value;
		} else {
			break;
		}
	}
	return attrs;
};
