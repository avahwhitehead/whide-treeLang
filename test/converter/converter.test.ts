import { expect } from "chai";
import { describe, it } from "mocha";
import runConvert, { ConversionResult } from "../../src/converter/converter";
import parse, { ConversionTree } from "../../src/converter/parser";
import { BinaryTree } from "../../src";
import lexer from "../../src/converter/lexer";
import * as util from "util";
import {
	a,
	ct,
	cv,
	t,
	treeToString,
	UNKNOWN_TYPE,
	EXPECTED_TREE,
	EXPECTED_NIL,
	INVALID_NUMBER,
	EXPECTED_FALSE,
	EXPECTED_TRUE,
	EXPECTED_BOOL,
	EXPECTED,
	tn,
	EXPECTED_NUMBER
} from "../utils";

function _runTest(conversionString: string, tree: BinaryTree, expectedValue: ConversionResult|(()=>ConversionResult), its = '', displayTree?: string) {
	let converter: ConversionTree = parse(lexer(conversionString));
	describe(`"${conversionString}" (${displayTree || treeToString(tree)})`, function () {
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
	describe('any', function () {
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
	});

	describe('int', function () {
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
					INVALID_NUMBER
				),
				error: true,
			},
			'should fail to match'
		);
	});

	describe('<nil.nil>', function () {
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
	});

	describe('<nil.any>', function () {
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
	});

	describe('int[]', function () {
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
				tree: a(ct(ct(null, null), null, INVALID_NUMBER),0),
				error: true,
			},
			'should fail with [E,0]'
		);
	});

	describe('(int|any)[]', function () {
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
	});

	describe('[nil, any]', function () {
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
	});

	describe('unknown[]', function() {
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

	describe('booleans', function () {
		//Test 'true' and 'false'
		_runTest('false',
			null,
			{
				tree: cv('false'),
				error: false,
			},
			`should produce the node 'false'`
		);
		_runTest('false',
			t(null, null),
			{
				tree: ct(null, null, EXPECTED_FALSE),
				error: true,
			},
			`should fail expecting 'false'`
		);
		_runTest('true',
			t(null, null),
			{
				tree: cv('true'),
				error: false,
			},
			`should produce the node 'true'`
		);
		_runTest('true',
			null,
			{
				tree: cv(null, EXPECTED_TRUE),
				error: true,
			},
			`should fail expecting 'true'`
		);
		_runTest('true',
			t(null, t(null, null)),
			{
				tree: ct(null, ct(null, null), EXPECTED_TRUE),
				error: true,
			},
			`should fail expecting 'true'`
		);
		_runTest('true',
			t(t(null, null), null),
			{
				tree: ct(ct(null, null), null, EXPECTED_TRUE),
				error: true,
			},
			`should fail expecting 'true'`
		);

		//Test 'bool' and 'boolean'
		for (let bool of ['bool', 'boolean']) {
			_runTest(bool,
				null,
				{
					tree: cv('false'),
					error: false,
				},
				`should produce the node 'false'`
			);
			_runTest(bool,
				t(null, null),
				{
					tree: cv('true'),
					error: false,
				},
				`should produce the node 'true'`
			);
			_runTest(bool,
				t(null, t(null, null)),
				{
					tree: ct(null, ct(null, null), EXPECTED_BOOL),
					error: true,
				},
				`should fail to match either 'true' or 'false'`
			);
			_runTest(bool,
				t(t(null, null), null),
				{
					tree: ct(ct(null, null), null, EXPECTED_BOOL),
					error: true,
				},
				`should fail to match either 'true' or 'false'`
			);
		}
	});

	describe('numbers', function () {
		_runTest(`4`,
			t(null, t(t(null, null), t(null, t(null, null)))),
			{
				tree: ct(null, ct(ct(null, null), ct(null, ct(null, null))), util.format(EXPECTED_NUMBER, 4)),
				error: true,
			},
			`should error with an invalid number expecting 4`
		);

		//Test different numbers
		for (let num of [3, 10, 100, 1000]) {
			_runTest(`${num}`,
				tn(num),
				{
					tree: cv(num),
					error: false,
				},
				`should produce ${num}`,
				`${num}`
			);
			_runTest(`${num}`,
				null,
				{
					tree: cv(0, util.format(EXPECTED, num)),
					error: true,
				},
				`should fail with 0 but expecting ${num}`
			);
		}
	});
});
