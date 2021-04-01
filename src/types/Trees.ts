export type BinaryTree = {
	left: BinaryTree,
	right: BinaryTree,
}|null;

export type ConvertedBinaryTree = {
	left: ConvertedBinaryTree,
	right: ConvertedBinaryTree,
}|{
	expected: string,
	actual: BinaryTree,
}|null|number|string|ConvertedBinaryTree[];