import { TKN_TREE_OPN, TKN_TREE_CLS, TKN_DOT } from "../converter/lexer";
import { TOKEN } from "./TreeLexer";
import { _expect, _unexpectedToken } from "../utils/parser";
import ParserException from "../exceptions/ParserException";
import { BinaryTree } from "../types/Trees";

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
 * Produce a tree from a literal tree declaration ("<tree.tree>")
 * @param tokens	The token list
 */
function _interpretTree(tokens: TOKEN[]): BinaryTree {
	//Parse the left tree
	const left : BinaryTree = _tokensToTree(tokens);
	//Check for the dot separating the subtrees
	_expect(tokens, TKN_DOT);
	//Parse the right tree
	const right : BinaryTree = _tokensToTree(tokens);
	//Check the opening symbol has a matching closing symbol
	_expect(tokens, TKN_TREE_CLS);
	//Return the created tree
	return {
		left: left,
		right: right,
	};
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

	switch (token) {
		//Accept `nil`
		case 'nil':
			return null;
		//Accept binary trees
		case TKN_TREE_OPN:
			return _interpretTree(tokenList);
		//Error otherwise
		default:
			throw _unexpectedToken(token);
	}
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