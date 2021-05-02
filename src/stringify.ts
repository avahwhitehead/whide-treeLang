import { ConvertedBinaryTree } from "./";

/**
 * Combine a list of trees into a single string, separated by a separator.
 * This is for building the inside of trees/lists
 * @param children  The trees to combine
 * @param sep       The character(s) used to separate the trees
 */
function buildChildren(children: ConvertedBinaryTree[], sep = '.'): string {
    let res = '';
    for (let i = 0; i < children.length; i++) {
        res += stringify(children[i]);
        if (i < children.length - 1) res += sep;
    }
    return res;
}

/**
 * Convert a value to its string format.
 * @param value     The value to convert
 */
function stringifyVal(value: string|number|null|undefined): string {
    //Undefined/null values are 'nil'
    if (value === undefined || value === null) return `nil`;
    //Stringify numbers
    else if (typeof value === "number") return `${value}`;
    //Keep booleans as-is
    else if (value === "true" || value === "false") return value;
    //Wrap strings in ""
    else return `"${value}"`;
}

/**
 * Produce a string representation of a {@code ConvertedBinaryTree} object
 * @param tree  The tree to stringify
 * @return  String representing the tree
 */
export default function stringify(tree: ConvertedBinaryTree): string {
    let children = tree.children || [];
    //Stringify lists
    if (tree.list) return `[${buildChildren(children, ',')}]`;
    //Stringify tree types
    if (children.length) return `<${buildChildren(children, '.')}>`;
    //Otherwise stringify the node's value
    return stringifyVal(tree.value);
}