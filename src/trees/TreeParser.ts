import { TKN_TREE_OPN as OPEN, TKN_TREE_CLS as CLOSE, TKN_DOT as DOT } from "../../src/converter/lexer";
import { TOKEN } from "./TreeLexer";
import { _expect, _unexpectedToken } from "../utils/parser";
import ParserException from "../exceptions/ParserException";

export type BinaryTree = {
	left: BinaryTree,
	right: BinaryTree,
} | null;

/**
 * Convert an integer to a binary tree
 * @param num	The number to convert
 */
function _numberToTree(num: number): BinaryTree {
	let res: BinaryTree = null;
	while (num > 0) {
		num--;
		res = {
			left: null,
			right: res,
		};
	}
	return res;
}

/**
 * Parse a token list into a tree node
 * @param tokenList	The list of tokens
 */
function _tokensToTree(tokenList: TOKEN[]) : BinaryTree {
	//Require the first token to be '<' or 'nil'
	const token : TOKEN|undefined = _expect(tokenList);

	//Convert numbers directly to numbers
	if (typeof token === "number") return _numberToTree(token);

	//Accept `nil`
	if (token === 'nil') return null;

	//Accept binary trees
	//"OPEN [TREE] DOT [TREE] CLOSE" ("<nil.nil>")
	if (token === OPEN) {
		//Parse the left tree
		const left : BinaryTree = _tokensToTree(tokenList);
		//Check for the dot separating the subtrees
		_expect(tokenList, DOT);
		//Parse the right tree
		const right : BinaryTree = _tokensToTree(tokenList);
		//Check the opening symbol has a matching closing symbol
		_expect(tokenList, CLOSE);
		//Return the created tree
		return {
			left: left,
			right: right,
		};
	}

	throw _unexpectedToken(token);
}

/**
 * Parse a token list into a binary tree
 * @param tokenList		The token list to parse
 */
export default function parse(tokenList: TOKEN[]) : BinaryTree {
	//Treat an empty token list as `nil`
	if (tokenList.length === 0) return null;

	//Parse into a binary tree
	const tree : BinaryTree = _tokensToTree(tokenList);
	//Shouldn't be any unparsed tokens
	if (tokenList.length > 0) {
		throw new ParserException(`Unexpected token: Expected end of statement but got '${tokenList.shift()}'`);
	}
	//Return the tree
	return tree;
}