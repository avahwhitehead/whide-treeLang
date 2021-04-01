import lexer, {
	TKN_DOT,
	TKN_TREE_CLS,
	TKN_TREE_OPN,
	TOKEN
} from "./lexer";
import { BinaryTree, ConvertedBinaryTree } from "./types/Trees";
import ParserException from "./exceptions/ParserException";

/**
 * Convert a tree to a number.
 * Returns undefined if the number is not strictly a valid number (i.e. the left node is not `null` at any point)
 * @param tree	The tree to interpret
 * @param cur	The starting value (default 0)
 * @returns the number represented by the tree, or `undefined` if not available
 */
function _readNumber(tree: BinaryTree, cur = 0): number|undefined {
	if (tree === null) return cur;
	if (tree.left !== null) return undefined;
	return _readNumber(tree.right, cur + 1);
}

/**
 * Convert a tree to its final value based on an atom token
 * @param atom	The atom to use
 * @param tree	The tree to convert
 */
function _matchAtom(atom: string, tree: BinaryTree): ConvertedBinaryTree {
	if (atom === 'nil') {
		//The tree has to be `null` to be valid
		if (tree === null) return null;
		return {
			expected: `nil`,
			actual: tree
		};
	} else if (atom === 'any') {
		//Any value is valid here
		return tree;
	//TODO: Replace 'int' with a substitution (when custom atoms/counters are supported) of '<nil:count:.int>|nil'
	} else if (atom === 'int') {
		//Try to convert the tree to a number
		let num = _readNumber(tree);
		if (num !== undefined) return num;
		//Invalid value
		return {
			expected: `int`,
			actual: tree,
		}
	}
	//Error on unknown atoms
	throw new ParserException(`Unknown atom '${atom}'`);
}

/**
 * Match the binary tree against an explicit tree in the conversion string
 * @param tree		The binary tree to convert
 * @param tokens	Token list representing the conversion string
 */
function _matchTree(tree: BinaryTree, tokens: TOKEN[]): ConvertedBinaryTree {
	if (tree == null) {
		return {
			//TODO: Display actual value here instead of "tree"
			expected: 'tree',
			actual: tree
		}
	}

	//Left side of the tree
	let left = _convert(tree.left, tokens);

	//Dot
	let dot = tokens.shift();
	if (dot !== TKN_DOT) throw new ParserException(`SyntaxError: Expected '${TKN_DOT}' but got '${dot}'`);

	//Right side of the tree
	let right = _convert(tree.right, tokens);

	let close = tokens.shift();
	if (close !== TKN_TREE_CLS) throw new ParserException(`SyntaxError: Expected '${TKN_TREE_CLS}' but got '${dot}'`);

	//Return the created tree
	return {
		left,
		right
	};
}

function _convert(tree: BinaryTree, tokens: TOKEN[]): ConvertedBinaryTree {
	let next = tokens.shift();
	if (!next) throw new ParserException(`Unexpected end of string`);

	if (next === TKN_TREE_OPN) {
		//The token is the start of a tree node
		return _matchTree(tree, tokens);
	} else {
		//Assume anything else is an atom
		return _matchAtom(next, tree);
	}
}

/**
 * Convert a binary tree from a tree to a number
 * @param tree	The tree to interpret
 * @param str	The conversion string
 */
export default function runConvert(tree: BinaryTree, str: string) : ConvertedBinaryTree {
	//Lex the input
	let tokens = lexer(str);
	//Treat empty input as 'any'
	if (tokens === []) return tree;
	return _convert(tree, tokens);
}
