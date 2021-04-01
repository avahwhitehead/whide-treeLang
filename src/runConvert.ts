import lexer from "./lexer";
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
function _parseAtom(atom: string, tree: BinaryTree): ConvertedBinaryTree {
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
 * Convert a binary tree from a tree to a number
 * @param tree	The tree to interpret
 * @param str	The conversion string
 */
export default function runConvert(tree: BinaryTree, str: string) : ConvertedBinaryTree {
	let tokens = lexer(str);

	let next = tokens.shift();
	if (next) return _parseAtom(next, tree);
	//Treat empty input as 'any'
	else return tree;
}
