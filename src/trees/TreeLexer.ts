import lexer, { SYMBOL_TOKEN } from "../converter/lexer";

export const TKN_NIL: SYMBOL_TOKEN | 'nil' = 'nil';
export type TOKEN = SYMBOL_TOKEN | number | 'nil';

/**
 * Lex a tree string into a token list.
 * Essentially a wrapper around ${@link lexer}
 * @param str	The string to lex
 */
export default function lexTree(str: string) : TOKEN[] {
	//Using `literalsOnly=true` the only accepted token not in `SYMBOL_TOKEN` is `nil`
	return lexer(str, true) as TOKEN[];
}