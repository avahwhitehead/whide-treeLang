import { BinaryTree, ConvertedBinaryTree } from "./types/Trees";
import { ChoiceType, ConversionTree, ListType, TreeType } from "./parser";
import ConverterException from "./exceptions/ConverterException";

export type ConversionResult = {
	tree: ConvertedBinaryTree,
	error?: boolean,
};

//========
// Utils
//========

/**
 * Gets the value of a tree if it is treated as a number.
 * Returns undefined if the number is not strictly a valid number (i.e. the left node is not `null` at any point)
 * @param tree	The tree to interpret
 * @param cur	The starting value (default 0)
 * @returns the number represented by the tree, or `undefined` if not available
 */
function _readNumber(tree: BinaryTree, cur = 0): number|undefined {
	if (tree === null) return cur;
	if (tree.left === null) return _readNumber(tree.right, cur + 1);
	return undefined;
}

/**
 * Convert a {@link BinaryTree} to a {@link ConversionResult}
 * @param tree		The tree to convert
 * @param error		Optional error message to include
 */
function _treeToConverted(tree: BinaryTree, error?: string) : ConvertedBinaryTree {
	let res: ConvertedBinaryTree = { error };
	if (tree === null) {
		res.value = tree;
	} else {
		res.left = _treeToConverted(tree.left);
		res.right = _treeToConverted(tree.right);
	}
	return res;
}

/**
 * Shorthand method to build a {@link ConversionResult} from a {@link BinaryTree}
 * @param tree		The tree to convert
 * @param error		Optional error message to include
 */
function _treeToConversionResult(tree: BinaryTree, error?: string) : ConversionResult {
	return {
		error: !!error,
		tree: _treeToConverted(tree, error)
	};
}

/**
 * Shorthand method to build a {@link ConversionResult} from a value
 * @param value		The value to convert
 * @param error		Optional error message to include
 */
function _valueToConversionResult(value: string|number|null, error?: string) : ConversionResult {
	return {
		error: !!error,
		tree: { value, error }
	};
}

/**
 * Shorthand method to create a {@link ConversionResult} from two child {@link ConversionResult}s
 * @param left		Left-hand child result
 * @param right		Left-hand child result
 * @param error		Optional error message to include
 */
function _parentConversionResult(left: ConversionResult, right: ConversionResult, error?: string): ConversionResult {
	return {
		tree: {
			error,
			left: left.tree,
			right: right.tree
		},
		error: left.error || right.error || !!error,
	};
}

//========
// Atom Types
//========

/**
 * Converts a binary tree to an integer
 * @param tree	The tree to convert
 */
function _convertNumber(tree: BinaryTree): ConversionResult {
	const value: number|undefined = _readNumber(tree);
	if (value !== undefined) return _valueToConversionResult(value);
	return _treeToConversionResult(tree, `Not a valid number`);
}

/**
 * Convert a tree using an atom string (e.g. 'nil'/'any'/'int')
 * @param tree	The tree to check
 * @param atom	The atomic string to check against
 */
function _convertAtom(tree: BinaryTree, atom: string): ConversionResult {
	//Built-in types
	switch (atom) {
		case 'nil':
			//The tree node must be null
			if (tree === null) return _treeToConversionResult(tree);
				// return { tree: { value: null } };
			return _treeToConversionResult(tree, `Expected nil`);
		case 'any':
			//Any tree is valid
			return { tree: _treeToConverted(tree) };
		case 'int':
			return _convertNumber(tree);
	}

	//Can't check against unknown types
	return _treeToConversionResult(tree, `Unknown type '${atom}'`);
}

//========
// Converters
//========

/**
 * Convert the tree using a conversion tree 'choice' node
 * @param tree				The tree to check
 * @param conversionTree	The conversion tree node
 */
function _convertChoice(tree: BinaryTree, conversionTree: ChoiceType): ConversionResult {
	let res: ConversionResult;
	//Test the tree against each type of the choice, in order
	for (let type of conversionTree.type) {
		if (typeof type === "string") res = _convertAtom(tree, type);
		else res = _convert(tree, type);
		//Return the result if it was converted with no errors
		if (!res.error) return res;
	}

	//If there is only one type in the choice, use that error
	if (conversionTree.type.length === 1) return res!;
	//Otherwise use a generic message
	return _treeToConversionResult(
		tree,
		`Node does not match any type of '${conversionTree.type.join(`', '`)}'`
	);
}

/**
 * Convert the tree using a conversion tree 'tree' node
 * @param tree				The tree to check
 * @param conversionTree	The conversion tree node
 */
function _convertTree(tree: BinaryTree, conversionTree: TreeType): ConversionResult {
	//An empty tree can't match a TreeType node
	if (tree == null) return _treeToConversionResult(tree, `Expected a tree, got nil`);
	//Convert the left and right nodes
	return _parentConversionResult(
		_convert(tree.left, conversionTree.left),
		_convert(tree.right, conversionTree.right)
	);
}

/**
 * Convert the tree using a conversion tree 'list' node
 * @param tree				The tree to check
 * @param conversionTree	The conversion tree node
 */
function _convertList(tree: BinaryTree, conversionTree: ListType): ConversionResult {
	//Null trees match with empty lists
	if (tree === null) return _treeToConversionResult(tree);
	//Convert the left and right nodes
	return _parentConversionResult(
		//Left node must match with the acceptable types
		_convert(tree.left, conversionTree.type),
		//Right node must be a list of the same type
		_convertList(tree.right, conversionTree),
	);
}

//========
// General
//========

/**
 * Read the type of the conversion tree's root node, and convert the tree accordingly
 * @param tree				The tree to check
 * @param conversionTree	The conversion tree node
 */
function _convert(tree: BinaryTree, conversionTree: ConversionTree): ConversionResult {
	const category = conversionTree.category;
	switch (category) {
		case "choice":
			return _convertChoice(tree, (conversionTree as ChoiceType));
		case "list":
			return _convertList(tree, (conversionTree as ListType));
		case "tree":
			return _convertTree(tree, (conversionTree as TreeType));
		default:
			throw new ConverterException(`Unknown branch type: '${category}'`);
	}
}

/**
 * Match a binary tree against a given conversion tree
 * @param tree				The tree to convert
 * @param conversionTree	The conversion tree to use (should be generated by the `parser`)
 * @returns		An object containing the result of the conversion,
 * 				and a boolean saying if there is an error anywhere in the tree
 */
export default function runConvert(tree: BinaryTree, conversionTree: ConversionTree) : { tree: ConvertedBinaryTree, error: boolean } {
	//Perform the tree conversion
	const res = _convert(tree, conversionTree);
	//Return the type, ensuring `error` is always a boolean
	return {
		tree: res.tree,
		error: !!res.error,
	};
}
