import { expect } from "chai";
import { describe, it } from "mocha";
import runConvert, { ConversionResult } from "../src/converter";
import parse, { ConversionTree } from "../src/parser";
import { BinaryTree, ConvertedBinaryTree } from "../src/types/Trees";
import lexer from "../src/lexer";

/**
 * Convert a binary tree to its string representation (for displaying)
 * @param tree	The tree to convert
 */
function treeToString(tree: BinaryTree): string {
	if (tree === null) return `nil`;
	return `<${treeToString(tree.left)}.${treeToString(tree.right)}>`
}

/**
 * Convert a number to a tree
 * @param n	The number to convert
 */
function tn(n: number) : BinaryTree {
	if (n === 0) return null;
	return t(null, tn(n-1));
}

/**
 * Shorthand function for building a tree
 * @param l	The left-hand child
 * @param r	The right-hand child
 */
function t(l: BinaryTree, r: BinaryTree): BinaryTree {
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
function cv(value: string|number|null, error?: string): ConvertedBinaryTree {
	return { value, error };
}

/**
 * Same as {@link t} but for the ConvertedBinaryTree type
 * @param l		The left-hand child
 * @param r		The right-hand child
 * @param error	Optional error message
 */
function ct(l: string|number|null|ConvertedBinaryTree, r: string|number|null|ConvertedBinaryTree, error?: string): ConvertedBinaryTree {
	if (l === null) l = cv(null);
	if (r === null) r = cv(null);
	if (typeof l === 'number' || typeof l === 'string') l = cv(l);
	if (typeof r === 'number' || typeof r === 'string') r = cv(r);
	return { left: l, right: r, error };
}

function _runTest(converter: ConversionTree, tree: BinaryTree, expectedValue: any, its = '') {
	describe(treeToString(tree), function () {
		it(its, function () {
			expect(
				runConvert(tree, converter)
			).to.eql(
				expectedValue
			);
		});
	});
}

function _runAllTests(converter: string, tests: [BinaryTree, ConversionResult, string?][]) {
	let conversionTree: ConversionTree = parse(lexer(converter));
	describe(`Converter: ${converter}`, function () {
		for (let [tree, expected, its] of tests) {
			_runTest(conversionTree, tree, expected, its);
		}
	});
}

//Error message definitions
const EXPECTED_NIL = `Expected nil`;
const EXPECTED_NUMBER = `Not a valid number`;
const EXPECTED_TREE = `Expected a tree, got nil`;
const UNKNOWN_TYPE = `Unknown type 'unknown'`;

describe(`#runConvert`, function () {
	_runAllTests(
		'any',
		[
			[
				null,
				{
					error: false,
					tree: cv(null)
				},
				'should match'
			],
			[
				t(null, null),
				{
					error: false,
					tree: ct(null, null)
				},
				'should match'
			],
			[
				t(t(null, null), t(null, null)),
				{
					error: false,
					tree: ct(
						ct(null, null),
						ct(null, null)
					)
				},
				'should match'
			],
		]
	);

	_runAllTests(
		'int',
		[
			[
				null,
				{
					tree: cv(0),
					error: false,
				},
				'should match 0'
			],
			[
				t(null, null),
				{
					tree: cv(1),
					error: false,
				},
				'should match 1'
			],
			[
				t(null, t(null, null)),
				{
					tree: cv(2),
					error: false,
				},
				'should match 2'
			],
			[
				t(t(null, null), t(null, null)),
				{
					tree: ct(
						ct(null, null),
						ct(null, null),
						EXPECTED_NUMBER
					),
					error: true,
				},
				'should fail to match'
			],
		]
	);

	_runAllTests(
		'<nil.nil>',
		[
			[
				null,
				{
					tree: cv(null, EXPECTED_TREE),
					error: true,
				},
				'should fail'
			],
			[
				t(null, null),
				{
					tree: ct(null, null),
					error: false,
				},
				'should match'
			],
			[
				t(null, t(null, null)),
				{
					tree: ct(
						null,
						ct(null, null, EXPECTED_NIL),
					),
					error: true,
				},
				'should fail'
			],
			[
				t(t(null, null), t(null, null)),
				{
					tree: ct(ct(null, null, EXPECTED_NIL), ct(null, null, EXPECTED_NIL)),
					error: true,
				},
				'should fail'
			],
		]
	);

	_runAllTests(
		'<nil.any>',
		[
			[
				null,
				{
					tree: cv(null, EXPECTED_TREE),
					error: true,
				},
				'should fail'
			],
			[
				t(null, null),
				{
					tree: ct(null, null),
					error: false,
				},
				'should match'
			],
			[
				t(null, t(null, null)),
				{
					tree: ct(null, ct(null, null)),
					error: false,
				},
				'should match'
			],
			[
				t(t(null, null), t(null, null)),
				{
					tree: ct(ct(null, null, EXPECTED_NIL), ct(null, null)),
					error: true,
				},
				'should fail'
			],
		]
	);

	_runAllTests(
		'int[]',
		[
			[
				null,
				{
					tree: cv(null),
					error: false,
				},
				'should match []'
			],
			[
				t(null, null),
				{
					tree: ct(0, null),
					error: false,
				},
				'should match [0]'
			],
			[
				t(null, t(null, null)),
				{
					tree: ct(0, ct(0, null)),
					error: false,
				},
				'should match [0,0]'
			],
			[
				t(t(null, t(null, null)), t(null, null)),
				{
					tree: ct(2, ct(0, null)),
					error: false,
				},
				'should match [2,0]'
			],
			[
				t(t(t(null, null), null), t(null, null)),
				{
					tree: ct(ct(ct(null, null), null, EXPECTED_NUMBER), ct(0, null)),
					error: true,
				},
				'should fail with [E,0]'
			],
		]
	);

	_runAllTests(
		'(int|any)[]',
		[
			[
				null,
				{
					tree: cv(null),
					error: false,
				},
				'should match []'
			],
			[
				t(null, null),
				{
					tree: ct(0, null),
					error: false,
				},
				'should match [0]'
			],
			[
				t(null, t(null, null)),
				{
					tree: ct(0, ct(0, null)),
					error: false,
				},
				'should match [0,0]'
			],
			[
				t(t(null, t(null, null)), t(null, null)),
				{
					tree: ct(2, ct(0, null)),
					error: false,
				},
				'should match [2,0]'
			],
			[
				t(t(t(null, null), null), t(null, null)),
				{
					tree: ct(ct(ct(null, null), null), ct(0, null)),
					error: false,
				},
				'should match with [<<nil.nil>.nil>,0]'
			],
		]
	);

	_runAllTests(
		'[nil, any]',
		[
			[
				null,
				{
					tree: cv(null, EXPECTED_TREE),
					error: true,
				},
				'should fail []'
			],
			[
				t(null, null),
				{
					tree: ct(null, cv(null, EXPECTED_TREE)),
					error: true,
				},
				'should match [nil]'
			],
			[
				t(null, t(null, null)),
				{
					tree: ct(null, ct(null, null)),
					error: false,
				},
				'should match [nil,nil]'
			],
			[
				t(null, t(t(null, null), null)),
				{
					tree: ct(null, ct(ct(null, null), null)),
					error: false,
				},
				'should match [nil,<nil.nil>]'
			],
			[
				t(t(null, null), null),
				{
					tree: ct(ct(null, null, EXPECTED_NIL), cv(null, EXPECTED_TREE)),
					error: true,
				},
				'should fail [<nil.nil>]'
			],
		]
	);

	_runAllTests(
		'unknown[]',
		[
			[
				null,
				{
					tree: cv(null),
					error: false,
				},
				'should match []'
			],
			[
				t(null, null),
				{
					tree: ct(cv(null, UNKNOWN_TYPE), null),
					error: true,
				},
				'should fail with an unknown atom'
			],
			[
				t(null, t(null, null)),
				{
					tree: ct(cv(null, UNKNOWN_TYPE), ct(cv(null, UNKNOWN_TYPE), null)),
					error: true,
				},
				'should fail with an unknown atom'
			],
			[
				t(t(null, t(null, null)), t(null, null)),
				{
					tree: ct(
						ct(null, ct(null, null), UNKNOWN_TYPE),
						ct(cv(null, UNKNOWN_TYPE), null)
					),
					error: true,
				},
				'should fail with an unknown atom'
			],
		]
	);
});

//TODO: Should [1,2,3] match with [int,int]?
//TODO: Perhaps should add back [int, int, ...]