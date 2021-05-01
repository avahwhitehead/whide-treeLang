import runConvert from "./converter";
import { BinaryTree, ConvertedBinaryTree } from "./types/Trees";
import lexer, { TOKEN } from "./lexer";
import parser, { ConversionTree } from "./parser";
import stringify from "./stringify";

export { BinaryTree, ConvertedBinaryTree } from "./types/Trees";

export { stringify };

/**
 * Represents the result of a tree conversion.
 */
export type ConversionResultType = {
	/**
	 * The result of the conversion
	 */
	tree: ConvertedBinaryTree,
	/**
	 * This is true if there is an error anywhere in the tree.
	 * False if the tree was converted without any issues.
	 */
	error: boolean
};

function _runParse(conversionString: string): ConversionTree {
	//First lex the input into tokens
	let tokens: TOKEN[] = lexer(conversionString);
	//Then parse the result into a ConversionTree
	return parser(tokens);
}

/**
 * Convert a binary tree using the provided conversion string
 * @param tree				The tree to convert
 * @param conversionString	The conversion string to use
 * @param customAtoms		Custom atomic values to extend the language.
 * 							Represented in {@code atomName:conversionString} format.
 * 							(e.g. {@code "mybool": "true|false"})
 * @returns		Object containing the result of the conversion
 */
export default function(tree: BinaryTree, conversionString: string, customAtoms?: Map<string, string>): ConversionResultType {
	//Parse the conversion string into a ConversionTree
	let parseResult: ConversionTree = _runParse(conversionString);

	//Parse each of the custom atoms into a ConversionTree
	customAtoms = customAtoms || new Map<string, string>();
	let atoms: Map<string, ConversionTree> = new Map<string, ConversionTree>();
	customAtoms.forEach((converter: string, name: string) => {
		let parseResult: ConversionTree = _runParse(converter);
		atoms.set(name, parseResult);
	});

	//Finally perform the conversion
	return runConvert(tree, parseResult, atoms);
}