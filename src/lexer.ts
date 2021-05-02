import LexerException from "./exceptions/LexerException";

type SYMBOL_TOKEN = '<' | '>' | '[' | ']' | '(' | ')' | '|' | '.' | '...' | ',' | ':';

//Symbols
export const TKN_DOT: SYMBOL_TOKEN = '.';
export const TKN_DOTS: SYMBOL_TOKEN = '...';
export const TKN_BAR: SYMBOL_TOKEN = '|';
export const TKN_COMMA: SYMBOL_TOKEN = ',';
export const TKN_CTR: SYMBOL_TOKEN = ':';
export const TKN_TREE_OPN: SYMBOL_TOKEN = '<';
export const TKN_TREE_CLS: SYMBOL_TOKEN = '>';
export const TKN_LIST_OPN: SYMBOL_TOKEN = '[';
export const TKN_LIST_CLS: SYMBOL_TOKEN = ']';
export const TKN_PREN_OPN: SYMBOL_TOKEN = '(';
export const TKN_PREN_CLS: SYMBOL_TOKEN = ')';
const SYMBOL_LIST = [
	TKN_DOTS, TKN_DOT,
	TKN_CTR,
	TKN_COMMA, TKN_BAR,
	TKN_TREE_OPN, TKN_TREE_CLS,
	TKN_LIST_OPN, TKN_LIST_CLS,
	TKN_PREN_OPN, TKN_PREN_CLS,
];

//All tokens
export type TOKEN = SYMBOL_TOKEN | string | number;

export default function lexer(converterString: string) : TOKEN[] {
	let res: TOKEN[] = [];
	let pos = 0;
	while (converterString.length) {
		//Remove any whitespace characters from the start of the string
		let startingLength = converterString.length;
		converterString = converterString.trimStart()
		pos += startingLength - converterString.length;

		//Stop if the remaining characters were all whitespace
		if (!converterString) break;

		//Check to see if the next token is a symbol
		let token: SYMBOL_TOKEN | null = _checkForSymbolToken(converterString);
		if (token !== null) {
			res.push(token);
			pos += token.length;
			converterString = converterString.substr(token.length);
			continue;
		}
		//Check to see if the next token is a number
		let num: [number, number] | null = _checkForNumberToken(converterString);
		if (num !== null) {
			res.push(num[0]);
			pos += num[1];
			converterString = converterString.substr(num[1]);
			continue;
		}
		//Check to see if the next token is an atomic type
		let atom: string | null = _checkForAtomToken(converterString);
		if (atom != null) {
			res.push(atom);
			pos += atom.length;
			converterString = converterString.substr(atom.length);
			continue;
		}

		//Unknown token
		throw new LexerException(`SyntaxError: Unexpected token '${converterString.charAt(0)}' at position ${pos}`);
	}
	return res;
}

/**
 * Get the symbol token matching the start of the provided string.
 * @param str	The string to check
 * @example {@code '<nil>'} returns {@code '<'}
 * @example {@code 'nil>'} returns {@code null}
 * @example {@code '[]'} returns {@code '['}
 * @returns	The matching token string, or {@code null} if there isn't a match
 */
function _checkForSymbolToken(str: string) : SYMBOL_TOKEN|null {
	for (let token of SYMBOL_LIST) {
		if (str.substr(0, token.length) === token) return token
	}
	return null;
}

/**
 * Get a number matching the start of the provided string.
 * @param str	The string to check
 * @example	{@code '0'}	returns {@code [0, 1]}
 * @example	{@code '1'}	returns {@code [1, 1]}
 * @example	{@code '99'} returns {@code [99, 2]}
 * @example	{@code '10 20'} returns {@code [10, 2]}
 * @example	{@code 'hi'} returns {@code null}
 * @returns	The found number and the length of its string, or {@code null} if there isn't a match
 */
function _checkForNumberToken(str: string) : [number, number]|null {
	let match: RegExpExecArray | null = /^\d+/.exec(str);
	if (!match) return null;
	return [Number.parseInt(match[0]), match[0].length];
}

/**
 * Get an atom matching the start of the provided string.
 * This will be the longest string consisting of the alphanumeric characters (a-z, 0-9) in any case, and '_'.
 * @param str	The string to check
 * @example {@code '<nil>'} returns {@code null}
 * @example {@code 'nil>'} returns {@code nil}
 * @example {@code 'nilish'} returns {@code 'nilish'}
 * @example {@code 'my atom'} returns {@code 'my'}
 * @returns	The matching atom string, or {@code null} if there isn't a match
 */
function _checkForAtomToken(str: string) : string|null {
	let match: RegExpExecArray | null = /^[a-z0-9_]+/i.exec(str);
	if (!match) return null;
	return match[0];
}