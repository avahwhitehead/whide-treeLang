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
		res.children = [
			_treeToConverted(tree.left),
			_treeToConverted(tree.right),
		];
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
			children: [left.tree, right.tree]
		},
		error: left.error || right.error || !!error,
	};
}

//========
//Internal converters
//========

/**
 * Convert each element of a list using a conversion tree's 'list' node.
 * @param tree				The tree to convert
 * @param conversionTree	The conversion tree node
 * @param atoms				Map of custom language atoms
 */
function _convertListInternal(tree: BinaryTree, conversionTree: ListType, atoms: Map<string, ConversionTree>): { children: ConvertedBinaryTree[], error?: boolean } {
	//Null trees match with empty lists
	if (tree === null) {
		return {
			children: [],
		};
	}
	//Convert the head element
	const head = _convert(tree.left, conversionTree.type, atoms);
	//Convert the rest of the list
	const tail = _convertListInternal(tree.right, conversionTree, atoms);

	//Add each element to the child nodes of the resulting tree
	let children = [head.tree];
	for (let child of tail.children) children.push(child);

	//Return the element(s)
	return {
		children,
		error: head.error || tail.error
	}
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
 * @param tree		The tree to check
 * @param atom		The atomic string to check against
 * @param atoms		Map of custom language atoms
 */
function _convertAtom(tree: BinaryTree, atom: string, atoms: Map<string, ConversionTree>): ConversionResult {
	//Built-in types
	switch (atom) {
		case 'nil':
			//The tree node must be null
			if (tree === null) return _treeToConversionResult(tree);
			return _treeToConversionResult(tree, `Expected nil`);
		case 'any':
			//Any tree is valid
			return { tree: _treeToConverted(tree) };
		case 'int':
			return _convertNumber(tree);
	}

	//Check if the atom has been defined by the user
	let atomTree: ConversionTree|undefined = atoms.get(atom);
	//Can't check against unknown types
	if (atomTree === undefined) return _treeToConversionResult(tree, `Unknown type '${atom}'`);

	//Convert using the atom
	let conversionResult = _convert(tree, atomTree, atoms);
	//Add the atom name to the root of the subtree
	conversionResult.tree.value = atom;
	//Return the converted tree
	return conversionResult;
}

//========
// Converters
//========

/**
 * Convert the tree using a conversion tree 'choice' node
 * @param tree				The tree to check
 * @param conversionTree	The conversion tree node
 * @param atoms				Map of custom language atoms
 */
function _convertChoice(tree: BinaryTree, conversionTree: ChoiceType, atoms: Map<string, ConversionTree>): ConversionResult {
	let res: ConversionResult;
	//Test the tree against each type of the choice, in order
	for (let type of conversionTree.type) {
		if (typeof type === "string") res = _convertAtom(tree, type, atoms);
		else res = _convert(tree, type, atoms);
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
 * @param atoms				Map of custom language atoms
 */
function _convertTree(tree: BinaryTree, conversionTree: TreeType, atoms: Map<string, ConversionTree>): ConversionResult {
	//An empty tree can't match a TreeType node
	if (tree == null) return _treeToConversionResult(tree, `Expected a tree, got nil`);
	//Convert the left and right nodes
	return _parentConversionResult(
		_convert(tree.left, conversionTree.left, atoms),
		_convert(tree.right, conversionTree.right, atoms)
	);
}

/**
 * Convert the tree using a conversion tree 'list' node
 * @param tree				The tree to check
 * @param conversionTree	The conversion tree node
 * @param atoms				Map of custom language atoms
 */
function _convertList(tree: BinaryTree, conversionTree: ListType, atoms: Map<string, ConversionTree>): ConversionResult {
	//Convert each element of the list
	const res = _convertListInternal(tree, conversionTree, atoms);
	//Wrap the elements in a tree structure
	const children = res.children;
	return {
		error: res.error,
		tree: {
			children,
			value: '[]',
			list: true
		}
	}
}

//========
// General
//========

/**
 * Read the type of the conversion tree's root node, and convert the tree accordingly
 * @param tree				The tree to check
 * @param conversionTree	The conversion tree node
 * @param atoms				Map of custom language atoms
 */
function _convert(tree: BinaryTree, conversionTree: ConversionTree, atoms: Map<string, ConversionTree>): ConversionResult {
	const category = conversionTree.category;
	switch (category) {
		case "choice":
			return _convertChoice(tree, (conversionTree as ChoiceType), atoms);
		case "list":
			return _convertList(tree, (conversionTree as ListType), atoms);
		case "tree":
			return _convertTree(tree, (conversionTree as TreeType), atoms);
		default:
			throw new ConverterException(`Unknown branch type: '${category}'`);
	}
}

/**
 * Match a binary tree against a given conversion tree
 * @param tree				The tree to convert
 * @param conversionTree	The conversion tree to use (should be generated by the `parser`)
 * @param atoms				Map of custom atomic values to extend the language.
 * 							Represented in {@code atomName:ConversionTree} format.
 * @returns		An object containing the result of the conversion,
 * 				and a boolean saying if there is an error anywhere in the tree
 */
export default function runConvert(tree: BinaryTree, conversionTree: ConversionTree, atoms?: Map<string, ConversionTree>) : { tree: ConvertedBinaryTree, error: boolean } {
	atoms = atoms || new Map<string, ConversionTree>();
	//Perform the tree conversion
	const res = _convert(tree, conversionTree, atoms);
	//Return the type, ensuring `error` is always a boolean
	return {
		tree: res.tree,
		error: !!res.error,
	};
}
