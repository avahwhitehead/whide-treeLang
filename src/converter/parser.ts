import {
	TKN_BAR,
	TKN_COMMA,
	TKN_CTR,
	TKN_DOT, TKN_DOTS,
	TKN_LIST_CLS,
	TKN_LIST_OPN,
	TKN_PREN_CLS,
	TKN_PREN_OPN,
	TKN_TREE_CLS,
	TKN_TREE_OPN,
	TOKEN
} from "./lexer";
import ParserException from "../exceptions/ParserException";

/**
 * Represents a choice of acceptable types in the position.
 * Type order is preserved.
 * Equivalent to {@code T|S|...} where {@code T} and {@code S} are types.
 */
export type ChoiceType = {
	category: 'choice',
	type: (string|number|ConversionTree)[],
}
/**
 * Represents a list of nodes of a given (set of) types.
 * Equivalent to {@code T[]} where {@code T} is a type.
 */
export type ListType = {
	category: 'list',
	type: ConversionTree,
}
/**
 * Represents a binary tree with two children.
 * Equivalent to {@code <R.S>} where {@code R} and {@code S} are types.
 */
export type TreeType = {
	category: 'tree',
	left: ConversionTree,
	right: ConversionTree,
}
/**
 * Represents the acceptable types for a ConversionTree.
 * This is an intermediate representation between the conversion string and converted tree.
 */
export type ConversionTree = ChoiceType | ListType | TreeType;

//========
// Utils
//========

/**
 * Get whether the last read token should be treated as a list.
 * (it is followed by `{@code TKN_LIST_OPEN}, {@code TKN_LIST_CLS}`).
 * The next 2 tokens are removed from the list if `true`.
 * Nothing is changed otherwise
 * @param tokens
 * @returns `false` if the next token is not {@code TKN_LIST_OPEN}
 * @returns `true` if the next two tokens are {@code TKN_LIST_OPEN} and {@code TKN_LIST_CLS}
 * @throws ParserException if the next token is {@code TKN_LIST_OPEN} and is not followed by {@code TKN_LIST_CLS}
 */
function _isList(tokens: TOKEN[]): boolean {
	//The next element must be followed by a `TKN_LIST_OPN`
	if (tokens[0] !== TKN_LIST_OPN) return false;

	//Remove the opening bracket
	tokens.shift();

	//The next token must be a closing bracket
	_expect(tokens, TKN_LIST_CLS);

	//A valid tree was received
	return true;
}

/**
 * Add a child node to a parent `choice` type.
 * This unwraps unnecessarily nested `choice` nodes.
 * @param parent	The parent node
 * @param child		The child node to add
 */
function _addToChoice(parent: ChoiceType, child: string|number|ConversionTree) {
	//Add strings and numbers directly
	if (typeof child === 'string' || typeof child === 'number') parent.type.push(child);
	//Unwrap nested choice nodes
	else if (child.category === 'choice') parent.type.push(...child.type);
	//Add other types as-is
	else parent.type.push(child);
	return parent;
}

/**
 * Create an error object for when an expected token is received
 * @param actual	The actual token received
 * @param expected	The expected token (or undefined)
 */
function _unexpectedToken(actual: TOKEN|string, ...expected: (TOKEN|string)[]): ParserException {
	if (expected.length === 0) return new ParserException(`Unexpected token: '${actual}'`);
	if (expected.length === 1) return new ParserException(`Unexpected token: expected '${expected[0]}' got '${actual}'`);
	return new ParserException(`Unexpected token: expected one of '${expected.join(`', '`)}' got '${actual}'`);
}

/**
 * Read the next token from the list.
 * Throws an error if the token list is empty, or if the token doesn't match the expected value
 * @param tokens	The token list
 * @param expected	The expected token. May be undefined to accept any token.
 */
function _expect(tokens: TOKEN[], ...expected: TOKEN[]): TOKEN {
	//Read the next token in the list
	const first = tokens.shift();

	//Unexpected end of token list
	if (first === undefined) {
		if (expected.length === 0) throw new ParserException(`Unexpected end of input`);
		else if (expected.length === 1) throw new ParserException(`Unexpected end of input: Expected '${expected[0]}'`);
		else throw new ParserException(`Unexpected end of input: Expected one of '${expected.join(`', '`)}'`);
	}

	//Allow any token if no expected was provided
	if (expected.length === 0) return first;
	//The token matches the expected value
	if (expected.includes(first)) return first;

	//The token is unexpected - throw an error
	throw _unexpectedToken(first, ...expected);
}

/**
 * Parse the internals of a list.
 * Expects the {@code TKN_LST_OPN} to have already been consumed
 * @param tokens	The token list
 */
function _interpretListInternal(tokens: TOKEN[]): ConversionTree {
	//Check if the next element says to ignore the rest of the list
	if (tokens[0] === TKN_DOTS) {
		//Remove the dots
		tokens.shift();
		//This should be the last element before the end fof the list
		_expect(tokens, TKN_LIST_CLS);
		//Allow any node here - only limit is that the rightmost leaf node is `nil`
		//Which is a guaranteed quality of the binary tree
		return {
			category: 'choice',
			type: ['any'],
		};
	}

	//Parse the first element of the list
	let left: ConversionTree = _readAllAtoms(tokens);
	//The next token should either be a comma, or list closing token
	let token = _expect(tokens, TKN_COMMA, TKN_LIST_CLS);

	let right: ConversionTree;
	if (token === TKN_LIST_CLS) {
		//If the list ends here, the right node should be `nil`
		right = {
			category: 'choice',
			type: ['nil']
		};
	} else {
		//Otherwise, continue parsing the list
		right = _interpretListInternal(tokens);
	}
	//Return the created list node
	return {
		category: 'tree',
		left: left,
		right: right,
	};
}

//========
// Atoms
//========

/**
 * Read the next atom (nil/int/nil[]/int[]/nil[][]...) from the token list
 * @param tokens	The token list
 */
function _readAtom(tokens: TOKEN[]) : string|number|ConversionTree {
	//Read the first token in the list, or error if it doesn't exist
	let first: TOKEN = _expect(tokens);

	let res: string|ConversionTree;
	switch (first) {
		//These should only ever be encountered by type-specific methods
		//Never by this method directly
		case TKN_BAR:
		case TKN_COMMA:
		case TKN_CTR:
		case TKN_DOT:
		case TKN_DOTS:
		case TKN_LIST_CLS:
		case TKN_PREN_CLS:
		case TKN_TREE_CLS:
			throw _unexpectedToken(first);

		//Interpret the next part of the token list as a tree
		case TKN_TREE_OPN:
			res = _interpretTree(tokens);
			break;
		//Read the contents of the parentheses
		case TKN_PREN_OPN:
			res = _interpretParen(tokens);
			break;
		case TKN_LIST_OPN:
			res = _interpretList(tokens);
			break;
		//Allow atomic types
		default:
			res = {
				category: 'choice',
				type: [first],
			};
	}

	//Wrap in nested lists as needed
	while (_isList(tokens)) {
		res = {
			category: 'list',
			type: res
		};
	}

	//Unwrap `choice`s of single items
	//This just saves unnecessarily wrapping all leaf nodes in a `choice`
	if (res.category === 'choice' && res.type.length === 1) return res.type[0];
	//Return the produced type
	return res;
}

/**
 * Read as many atoms as possible (atom[|atom[|atom[...]]]) from the token list
 * @param tokens
 */
function _readAllAtoms(tokens: TOKEN[]): ConversionTree {
	//The parent of all the read atoms
	let res: ChoiceType = {
		category: 'choice',
		type: [],
	};

	//Read the next atom
	_addToChoice(res, _readAtom(tokens));
	while (tokens[0] === TKN_BAR) {
		//Remove the separator from the head of the list
		tokens.shift();
		//Read the next atom
		_addToChoice(res, _readAtom(tokens));
	}

	//Unwrap `choice`s of single items
	if (res.category === 'choice' && res.type.length === 1) {
		const t = res.type[0];
		if (typeof t !== 'string' && typeof t !== 'number') return t;
	}
	//Return the produced type
	return res;
}

//========
//Sections
//========

/**
 * Read a pair of parentheses and their content from the token list.
 * Expects the opening paren to have already been removed from the list.
 * @param tokens	The token list
 */
function _interpretParen(tokens: TOKEN[]): ConversionTree {
	//Read the contents of the parentheses
	let tree: ConversionTree = _readAllAtoms(tokens);
	//Expect a closing paren
	_expect(tokens, TKN_PREN_CLS);
	//Return the produced type
	return tree;
}

/**
 * Read a tree and its children from the token list.
 * Expects the opening symbol to have already been removed from the list.
 * @param tokens	The token list
 */
function _interpretTree(tokens: TOKEN[]): TreeType {
	//Read the left-hand child
	let left: ConversionTree = _readAllAtoms(tokens);
	//Expect a separator between the elements
	_expect(tokens, TKN_DOT);
	//Read the right-hand child
	let right: ConversionTree = _readAllAtoms(tokens);
	//Expect a matching closing bracket
	_expect(tokens, TKN_TREE_CLS);
	//Return the tree type
	return {
		category: "tree",
		left: left,
		right: right,
	};
}

/**
 * Read a fixed type list from the token list.
 * Expects the opening symbol to have already been removed from the token list.
 * @param tokens	The token list
 */
function _interpretList(tokens: TOKEN[]): ConversionTree {
	//Return a `nil` token if the list has no content
	if (tokens[0] === TKN_LIST_CLS) {
		tokens.shift();
		return {
			category: 'choice',
			type: ['nil']
		};
	}
	//Parse the elements of the list
	return _interpretListInternal(tokens);
}

/**
 * Parse a token list into a conversion tree.
 * This is an intermediate step between lexing the string and converting the tree
 * @param tokens	The token list to parse
 */
export default function parse(tokens: TOKEN[]) : ConversionTree {
	//Treat an empty input list as matching any tree
	if (tokens.length === 0) tokens = ['any'];

	//Parse the token list
	let res: ConversionTree = _readAllAtoms(tokens);

	//Error if there are any unparsed tokens left
	if (tokens.length > 0) throw new ParserException(`Unexpected token: '${tokens[0]}'`);

	//Unwrap the root node if it is a choice of only 1 option
	if (res.category === 'choice' && res.type.length === 1) {
		const t = res.type[0];
		if (typeof t !== 'string' && typeof t !== 'number') return t;
	}
	//Return the produced tree
	return res;
}
