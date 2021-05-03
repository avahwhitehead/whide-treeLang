import { TKN_COMMA, TKN_DOT, TKN_LIST_CLS, TKN_LIST_OPN, TKN_TREE_CLS, TKN_TREE_OPN } from "../converter/lexer";
import {
	TKN_ASSIGN,
	TKN_ASSIGN_1, TKN_CONS,
	TKN_DO_ASSIGN, TKN_DO_CONS, TKN_DO_HD, TKN_DO_IF, TKN_DO_TL,
	TKN_DO_WHILE,
	TKN_FALSE, TKN_HD, TKN_IF, TKN_QUOTE, TKN_TL,
	TKN_TRUE, TKN_VAR,
	TKN_WHILE,
	TOKEN
} from "./TreeLexer";
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
 * Produce a list from a list of tokens
 * @param tokens	The token list
 */
function _interpretList(tokens: TOKEN[]): BinaryTree {
	//If the list is empty, return just the terminator `nil`
	if (tokens[0] === TKN_LIST_CLS) {
		tokens.shift();
		return null;
	}

	//Pointers to the top and bottom of the binary tree
	//So the tree can be built downwards (in-order)
	let head: BinaryTree = {
		//Parse the first node immediately
		left: _tokensToTree(tokens),
		right: null,
	}
	let tail: BinaryTree = head;

	//Keep parsing the list until a terminator symbol (']') is found
	//There must be a separator (`,`) between each element
	while (_expect(tokens, TKN_COMMA, TKN_LIST_CLS) === TKN_COMMA) {
		//Add the next element to the end of the tree
		tail.right = {
			left: _tokensToTree(tokens),
			right: null,
		}
		//Move the tail pointer down the tree
		tail = tail.right;
	}
	//Return the produced tree
	return head;
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
		case 'nil':
		case TKN_FALSE:
			return _numberToTree(0);
		case TKN_TRUE:
			return _numberToTree(1);
		//Accept binary trees
		case TKN_TREE_OPN:
			return _interpretTree(tokenList);
		//Accept lists
		case TKN_LIST_OPN:
			return _interpretList(tokenList);
		//Accept the programs-as-data atoms using the HWhile numerical representations
		case TKN_ASSIGN:
		case TKN_ASSIGN_1:
			return _numberToTree(2);
		case TKN_DO_ASSIGN:
			return _numberToTree(3);
		case TKN_WHILE:
			return _numberToTree(5);
		case TKN_DO_WHILE:
			return _numberToTree(7);
		case TKN_IF:
			return _numberToTree(11);
		case TKN_DO_IF:
			return _numberToTree(13);
		case TKN_VAR:
			return _numberToTree(17);
		case TKN_QUOTE:
			return _numberToTree(19);
		case TKN_HD:
			return _numberToTree(23);
		case TKN_DO_HD:
			return _numberToTree(29);
		case TKN_TL:
			return _numberToTree(31);
		case TKN_DO_TL:
			return _numberToTree(37);
		case TKN_CONS:
			return _numberToTree(41);
		case TKN_DO_CONS:
			return _numberToTree(43);
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