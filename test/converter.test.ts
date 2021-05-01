import { expect } from "chai";
import { describe, it } from "mocha";
import runConvert, { ConversionResult } from "../src/converter";
import parse, { ConversionTree } from "../src/parser";
import { BinaryTree } from "../src";
import lexer from "../src/lexer";
import * as util from "util";
import { a, ct, cv, t, treeToString, UNKNOWN_TYPE, EXPECTED_TREE, EXPECTED_NIL, EXPECTED_NUMBER } from "./utils";

function _runTest(conversionString: string, tree: BinaryTree, expectedValue: ConversionResult|(()=>ConversionResult), its = '') {
	let converter: ConversionTree = parse(lexer(conversionString));
	describe(`"${conversionString}" (${treeToString(tree)})`, function () {
		it(its, function () {
			const actual = runConvert(tree, converter);
			let expected;
			if (typeof expectedValue === "function") expected = expectedValue();
			else expected = expectedValue;
			expect(actual).to.deep.equal(expected);
		});
	});
}

//Tests start
describe(`#runConvert`, function () {
	_runTest('any',
		null,
		{
			error: false,
			tree: cv(null)
		},
		'should match'
	);
	_runTest('any',
		t(null, null),
		{
			error: false,
			tree: ct(null, null)
		},
		'should match'
	);
	_runTest('any',
		t(t(null, null), t(null, null)),
		{
			error: false,
			tree: ct(
				ct(null, null),
				ct(null, null)
			)
		},
		'should match'
	);

	_runTest('int',
		null,
		{
			tree: cv(0),
			error: false,
		},
		'should match 0'
	);
	_runTest('int',
		t(null, null),
		{
			tree: cv(1),
			error: false,
		},
		'should match 1'
	);
	_runTest('int',
		t(null, t(null, null)),
		{
			tree: cv(2),
			error: false,
		},
		'should match 2'
	);
	_runTest('int',
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
	);

	_runTest('<nil.nil>',
		null,
		{
			tree: cv(null, EXPECTED_TREE),
			error: true,
		},
		'should fail'
	);
	_runTest('<nil.nil>',
		t(null, null),
		{
			tree: ct(null, null),
			error: false,
		},
		'should match'
	);
	_runTest('<nil.nil>',
		t(null, t(null, null)),
		{
			tree: ct(
				null,
				ct(null, null, EXPECTED_NIL),
			),
			error: true,
		},
		'should fail'
	);
	_runTest('<nil.nil>',
		t(t(null, null), t(null, null)),
		{
			tree: ct(ct(null, null, EXPECTED_NIL), ct(null, null, EXPECTED_NIL)),
			error: true,
		},
		'should fail'
	);

	_runTest('<nil.any>',
		null,
		{
			tree: cv(null, EXPECTED_TREE),
			error: true,
		},
		'should fail'
	);
	_runTest('<nil.any>',
		t(null, null),
		{
			tree: ct(null, null),
			error: false,
		},
		'should match'
	);
	_runTest('<nil.any>',
		t(null, t(null, null)),
		{
			tree: ct(null, ct(null, null)),
			error: false,
		},
		'should match'
	);
	_runTest('<nil.any>',
		t(t(null, null), t(null, null)),
		{
			tree: ct(ct(null, null, EXPECTED_NIL), ct(null, null)),
			error: true,
		},
		'should fail'
	);

	_runTest('int[]',
		null,
		{
			tree: a(),
			error: false,
		},
		'should match []'
	);
	_runTest('int[]',
		t(null, null),
		{
			tree: a(0),
			error: false,
		},
		'should match [0]'
	);
	_runTest('int[]',
		t(null, t(null, null)),
		{
			tree: a(0, 0),
			error: false,
		},
		'should match [0,0]'
	);
	_runTest('int[]',
		t(t(null, t(null, null)), t(null, null)),
		{
			tree: a(2, 0),
			error: false,
		},
		'should match [2,0]'
	);
	_runTest('int[]',
		t(t(t(null, null), null), t(null, null)),
		{
			tree: a(ct(ct(null, null), null, EXPECTED_NUMBER),0),
			error: true,
		},
		'should fail with [E,0]'
	);

	_runTest('(int|any)[]',
		null,
		{
			tree: a(),
			error: false,
		},
		'should match []'
	);
	_runTest('(int|any)[]',
		t(null, null),
		{
			tree: a(0),
			error: false,
		},
		'should match [0]'
	);
	_runTest('(int|any)[]',
		t(null, t(null, null)),
		{
			tree: a(0, 0),
			error: false,
		},
		'should match [0,0]'
	);
	_runTest('(int|any)[]',
		t(t(null, t(null, null)), t(null, null)),
		{
			tree: a(2,0),
			error: false,
		},
		'should match [2,0]'
	);
	_runTest('(int|any)[]',
		t(t(t(null, null), null), t(null, null)),
		{
			tree: a(ct(ct(null, null), null), 0),
			error: false,
		},
		'should match with [<<nil.nil>.nil>,0]'
	);

	_runTest('[nil, any]',
		null,
		{
			tree: cv(null, EXPECTED_TREE),
			error: true,
		},
		'should fail []'
	);
	_runTest('[nil, any]',
		t(null, null),
		{
			tree: ct(null, cv(null, EXPECTED_TREE)),
			error: true,
		},
		'should match [nil]'
	);
	_runTest('[nil, any]',
		t(null, t(null, null)),
		{
			tree: ct(null, ct(null, null)),
			error: false,
		},
		'should match [nil,nil]'
	);
	_runTest('[nil, any]',
		t(null, t(t(null, null), null)),
		{
			tree: ct(null, ct(ct(null, null), null)),
			error: false,
		},
		'should match [nil,<nil.nil>]'
	);
	_runTest('[nil, any]',
		t(t(null, null), null),
		{
			tree: ct(ct(null, null, EXPECTED_NIL), cv(null, EXPECTED_TREE)),
			error: true,
		},
		'should fail [<nil.nil>]'
	);

	_runTest('unknown[]',
		null,
		{
			tree: a(),
			error: false,
		},
		'should match []'
	);
	_runTest('unknown[]',
		t(null, null),
		{
			tree: a(cv(null, util.format(UNKNOWN_TYPE, 'unknown'))),
			error: true,
		},
		'should fail with an unknown atom'
	);
	_runTest('unknown[]',
		t(null, t(null, null)),
		{
			tree: a(cv(null, util.format(UNKNOWN_TYPE, 'unknown')), cv(null, util.format(UNKNOWN_TYPE, 'unknown'))),
			error: true,
		},
		'should fail with an unknown atom'
	);
	_runTest('unknown[]',
		t(t(null, t(null, null)), t(null, null)),
		{
			tree: a(
				ct(null, ct(null, null), util.format(UNKNOWN_TYPE, 'unknown')),
				cv(null, util.format(UNKNOWN_TYPE, 'unknown'))
			),
			error: true,
		},
		'should fail with an unknown atom'
	);
});
