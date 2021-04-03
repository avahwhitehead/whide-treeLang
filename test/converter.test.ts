import { expect } from "chai";
import { describe, it } from "mocha";
import runConvert from "../src/converter";
import parse, { ConversionTree } from "../src/parser";
import { BinaryTree } from "../src/types/Trees";
import lexer from "../src/lexer";

function treeToString(tree: BinaryTree): string {
	if (tree === null) return `nil`;
	return `<${treeToString(tree.left)}.${treeToString(tree.right)}>`
}

function tn(n: number) : BinaryTree {
	if (n === 0) return null;
	return t(null, tn(n-1));
}

function t(l: BinaryTree, r: BinaryTree): BinaryTree {
	return {
		left: (typeof l === 'number' ? tn(l) : l),
		right: (typeof r === 'number' ? tn(r) : r),
	};
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

function _runAllTests(converter: string, tests: [BinaryTree, any, string?][]) {
	let conversionTree: ConversionTree = parse(lexer(converter));
	describe(`Converter: ${converter}`, function () {
		for (let [tree, expected, its] of tests) {
			_runTest(conversionTree, tree, expected, its);
		}
	});
}

describe(`#runConvert (valid)`, function () {
	_runAllTests(
		'any',
		[
			[
				null,
				true,
				'should match'
			],
			[
				t(null, null),
				true,
				'should match'
			],
			[
				t(t(null, null), t(null, null)),
				true,
				'should match'
			],
		]
	);

	_runAllTests(
		'int',
		[
			[
				null,
				true,
				'should match 0'
			],
			[
				t(null, null),
				true,
				'should match 1'
			],
			[
				t(null, t(null, null)),
				true,
				'should match 2'
			],
			[
				t(t(null, null), t(null, null)),
				false,
				'should fail to match'
			],
		]
	);

	_runAllTests(
		'<nil.nil>',
		[
			[
				null,
				false,
				'should fail'
			],
			[
				t(null, null),
				true,
				'should match'
			],
			[
				t(null, t(null, null)),
				false,
				'should fail'
			],
			[
				t(t(null, null), t(null, null)),
				false,
				'should fail'
			],
		]
	);

	_runAllTests(
		'<nil.any>',
		[
			[
				null,
				false,
				'should fail'
			],
			[
				t(null, null),
				true,
				'should match'
			],
			[
				t(null, t(null, null)),
				true,
				'should match'
			],
			[
				t(t(null, null), t(null, null)),
				false,
				'should fail'
			],
		]
	);

	_runAllTests(
		'int[]',
		[
			[
				null,
				true,
				'should match []'
			],
			[
				t(null, null),
				true,
				'should match [0]'
			],
			[
				t(null, t(null, null)),
				true,
				'should match [0,0]'
			],
			[
				t(t(null, t(null, null)), t(null, null)),
				true,
				'should match [2,0]'
			],
			[
				t(t(t(null, null), null), t(null, null)),
				false,
				'should fail with [E,0]'
			],
		]
	);

	_runAllTests(
		'(int|any)[]',
		[
			[
				null,
				true,
				'should match []'
			],
			[
				t(null, null),
				true,
				'should match [0]'
			],
			[
				t(null, t(null, null)),
				true,
				'should match [0,0]'
			],
			[
				t(t(null, t(null, null)), t(null, null)),
				true,
				'should match [2,0]'
			],
			[
				t(t(t(null, null), null), t(null, null)),
				true,
				'should match with [<<nil.nil>.nil>,0]'
			],
		]
	);

	_runAllTests(
		'[nil, any]',
		[
			[
				null,
				false,
				'should fail []'
			],
			[
				t(null, null),
				true,
				'should match [nil]'
			],
			[
				t(null, t(null, null)),
				true,
				'should match [nil,nil]'
			],
			[
				t(null, t(t(null, null), null)),
				true,
				'should match [nil,<nil.nil>]'
			],
			[
				t(t(null, null), null),
				false,
				'should fail [<nil.nil>, null]'
			],
		]
	);

	_runAllTests(
		'unknown[]',
		[
			[
				null,
				true,
				'should match []'
			],
			[
				t(null, null),
				false,
				'should fail with an unknown atom'
			],
			[
				t(null, t(null, null)),
				false,
				'should fail with an unknown atom'
			],
			[
				t(t(null, t(null, null)), t(null, null)),
				false,
				'should fail with an unknown atom'
			],
		]
	);
});

//TODO: Should [1,2,3] match with [int,int]?
//TODO: Perhaps should add back [int, int, ...]