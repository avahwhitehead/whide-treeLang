import lexer, { SYMBOL_TOKEN } from "../converter/lexer";

export const TKN_NIL: SYMBOL_TOKEN | 'nil' = 'nil';
export type TOKEN = SYMBOL_TOKEN | number | 'nil';

/**
 * Lex a tree string into a token list.
 * Essentially a wrapper around ${@link lexer}
 * @param str	The string to lex
 */
export default function lexTree(str: string) : TOKEN[] {
	//Limit the accepted token strings to only `nil`
	return lexer(str, false) as TOKEN[];
}