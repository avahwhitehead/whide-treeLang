import { BinaryTree, ConvertedBinaryTree } from "../src";

//Error message definitions
export const EXPECTED_NIL = `Expected nil`;
export const EXPECTED_NUMBER = `Not a valid number`;
export const EXPECTED_TREE = `Expected a tree, got nil`;
export const UNKNOWN_TYPE = `Unknown type '%s'`;

//Other definitions
const EMPTY_LIST_STR = '[]';

//Useful functions

/**
 * Convert a binary tree to its string representation (for displaying)
 * @param tree	The tree to convert
 */
export function treeToString(tree: BinaryTree): string {
	if (tree === null) return `nil`;
	return `<${treeToString(tree.left)}.${treeToString(tree.right)}>`
}

/**
 * Convert a number to a tree
 * @param n	The number to convert
 */
export function tn(n: number) : BinaryTree {
	if (n === 0) return null;
	return t(null, tn(n-1));
}

/**
 * Shorthand function for building a tree
 * @param l	The left-hand child
 * @param r	The right-hand child
 */
export function t(l: BinaryTree, r: BinaryTree): BinaryTree {
	return {
		left: (typeof l === 'number' ? tn(l) : l),
		right: (typeof r === 'number' ? tn(r) : r),
	};
}

/**
 * Convert the given value to a ConvertedBinaryTree type
 * @param value	The value to use
 * @param error	Optional error message
 */
export function cv(value: string|number|null, error?: string): ConvertedBinaryTree {
	return { value, error };
}

/**
 * Same as {@link t} but for the ConvertedBinaryTree type
 * @param l		The left-hand child
 * @param r		The right-hand child
 * @param error	Optional error message
 */
export function ct(l: string|number|null|ConvertedBinaryTree, r: string|number|null|ConvertedBinaryTree, error?: string): ConvertedBinaryTree {
	if (l === null) l = cv(null);
	if (r === null) r = cv(null);
	if (typeof l === 'number' || typeof l === 'string') l = cv(l);
	if (typeof r === 'number' || typeof r === 'string') r = cv(r);
	return { children: [l, r], error };
}

/**
 * Produce an array tree-representation from a list of elements
 * @param elements	The elements to use, in order
 * @returns	Converted array-tree made of the provided elements
 */
export function a(...elements: (ConvertedBinaryTree|string|number|null)[]): ConvertedBinaryTree {
	const standardisedElements = elements.map((e) => {
		if (e === null) return cv(null);
		if (typeof e === 'number' || typeof e === 'string') return cv(e);
		return e;
	});
	return {
		children: standardisedElements,
		value: EMPTY_LIST_STR,
		list: true,
	}
}
