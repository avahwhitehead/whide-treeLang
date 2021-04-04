export type BinaryTree = {
	left: BinaryTree,
	right: BinaryTree,
}|null;

export type ConvertedBinaryTree =
	{
		/**
		 * Error message to display on this element
		 */
		error?: string,
		/**
		 * {@code true} if this element represents a list.
		 * {@code false} otherwise.
		 */
		list?: boolean,
		/**
		 * The child nodes of this node.
		 * There should only be 2 for any node (left/right), unless this is a list.
		 */
		children?: ConvertedBinaryTree[],
		/**
		 * The string value to display at this node.
		 * {@code null} represents 'nil'
		 */
		value?: string|number|null,
	};