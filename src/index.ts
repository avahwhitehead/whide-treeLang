import runConvert from "./converter";
import { BinaryTree, ConvertedBinaryTree } from "./types/Trees";
import lexer, { TOKEN } from "./lexer";
import parser, { ConversionTree } from "./parser";

export { BinaryTree, ConvertedBinaryTree } from "./types/Trees";

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

/**
 * Convert a binary tree using the provided conversion string
 * @param tree				The tree to convert
 * @param conversionString	The conversion string to use
 * @returns		Object containing the result of the conversion
 */
export default function(tree: BinaryTree, conversionString: string): ConversionResultType {
	//First lex the input into tokens
	let tokens: TOKEN[] = lexer(conversionString);
	//Then parse the result into a ConversionTree
	let parseResult: ConversionTree = parser(tokens);
	//Finally perform the conversion
	return runConvert(tree, parseResult);
}