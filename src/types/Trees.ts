export type BinaryTree = {
	left: BinaryTree,
	right: BinaryTree,
}|null;

export type ConvertedBinaryTree =
	{
		error?: string,
		left?: ConvertedBinaryTree|BinaryTree,
		right?: ConvertedBinaryTree|BinaryTree,
		value?: string|number|null,
	};