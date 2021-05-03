import lexer, { SYMBOL_TOKEN } from "../converter/lexer";

export type EXTENDED_TOKENS = 'true' | 'false'
	|'@asgn'|'@:='|'@doAsgn'|'@while'|'@doWhile'|'@if'|'@doIf'
	|'@var'|'@quote'|'@hd'|'@doHd'|'@tl'|'@doTl'|'@cons'|'@doCons'
export type TOKEN = SYMBOL_TOKEN | number | 'nil' | EXTENDED_TOKENS;

export const TKN_NIL: TOKEN = 'nil';
export const TKN_FALSE: EXTENDED_TOKENS = 'false';
export const TKN_TRUE: EXTENDED_TOKENS = 'true';
export const TKN_ASSIGN: EXTENDED_TOKENS = '@asgn';
export const TKN_ASSIGN_1: EXTENDED_TOKENS = '@:=';
export const TKN_DO_ASSIGN: EXTENDED_TOKENS = '@doAsgn';
export const TKN_WHILE: EXTENDED_TOKENS = '@while';
export const TKN_DO_WHILE: EXTENDED_TOKENS = '@doWhile';
export const TKN_IF: EXTENDED_TOKENS = '@if';
export const TKN_DO_IF: EXTENDED_TOKENS = '@doIf';
export const TKN_VAR: EXTENDED_TOKENS = '@var';
export const TKN_QUOTE: EXTENDED_TOKENS = '@quote';
export const TKN_HD: EXTENDED_TOKENS = '@hd';
export const TKN_DO_HD: EXTENDED_TOKENS = '@doHd';
export const TKN_TL: EXTENDED_TOKENS = '@tl';
export const TKN_DO_TL: EXTENDED_TOKENS = '@doTl';
export const TKN_CONS: EXTENDED_TOKENS = '@cons';
export const TKN_DO_CONS: EXTENDED_TOKENS = '@doCons';

const TOKEN_LIST: EXTENDED_TOKENS[] = [
	TKN_FALSE,TKN_TRUE,
	TKN_ASSIGN, TKN_ASSIGN_1, TKN_DO_ASSIGN,
	TKN_WHILE, TKN_DO_WHILE,
	TKN_IF, TKN_DO_IF,
	TKN_VAR, TKN_QUOTE,
	TKN_HD, TKN_DO_HD,
	TKN_TL, TKN_DO_TL,
	TKN_CONS, TKN_DO_CONS
]

/**
 * Lex a tree string into a token list.
 * Essentially a wrapper around ${@link lexer}
 * @param str	The string to lex
 */
export default function lexTree(str: string) : TOKEN[] {
	//Limit the accepted token strings to only those accepted by the parser
	return lexer(str, TOKEN_LIST) as TOKEN[];
}