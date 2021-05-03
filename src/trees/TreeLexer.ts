import lexer, { SYMBOL_TOKEN } from "../converter/lexer";

export const TKN_NIL: SYMBOL_TOKEN | 'nil' = 'nil';
export type EXTENDED_TOKENS = 'true' | 'false';
export type TOKEN = SYMBOL_TOKEN | number | 'nil' | EXTENDED_TOKENS;

/**
 * Lex a tree string into a token list.
 * Essentially a wrapper around ${@link lexer}
 * @param str	The string to lex
 */
export default function lexTree(str: string) : TOKEN[] {
	//Limit the accepted token strings to only those accepted by the parser
	return lexer(str, ['true', 'false']) as TOKEN[];
}