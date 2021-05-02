import { expect } from "chai";
import { describe, it } from "mocha";
import { ConvertedBinaryTree, stringify } from "../src";
import { a, ct, cv } from "./utils";

function _runTest(expected: string, tree: ConvertedBinaryTree, its?: string) {
	let itsmsg = its || 'should produce the expected value';
	describe(expected, function () {
		it(itsmsg, function () {
			const actual = stringify(tree);
			expect(actual).to.deep.equal(expected);
		});
	});
}

//Tests start
describe(`#stringify`, function () {
	_runTest(
		'nil',
		cv(null),
		`should return an empty string`
	);

	_runTest(
		`<nil.nil>`,
		ct(null, null),
		`should produce a simple tree`
	);

	_runTest(
		`<<nil.nil>.<nil.<nil.nil>>>`,
		ct(ct(null, null), ct(null, ct(null, null))),
		`should produce a nested tree`
	);

	_runTest(
		`<nil.nil.nil>`,
		{children: [cv(null), cv(null), cv(null)]},
		`should produce a tree with 3 children`
	);

	_runTest(
		`[]`,
		{list: true, value: '[]', children: [] },
		`should produce an empty list`
	);

	_runTest(
		`[nil]`,
		{list: true, value: '[]', children: [cv(null)] },
		`should produce a single-element list`
	);

	_runTest(
		`[nil,<nil.nil>]`,
		a(null, ct(null, null)),
		`should produce a list of mixed types`
	);

	_runTest(
		`[5,4,3,2,1,0]`,
		a(5, 4, 3, 2, 1, 0),
		`should produce a list of numbers`
	);

	_runTest(
		`[[3,[2,1]]]`,
		a(a(3, a(2, 1))),
		`should produce a nested list`
	);

	_runTest(
		`0`,
		cv(0),
		`should produce a number`
	);

	_runTest(
		`20`,
		cv(20),
		`should produce a number`
	);

	_runTest(
		`true`,
		cv('true'),
		`should show booleans without quotes`
	);

	_runTest(
		`false`,
		cv('false'),
		`should show booleans without quotes`
	);

	_runTest(
		`["hello","world","foo","bar"]`,
		a("hello", "world", "foo", "bar"),
		`should produce a list of strings`
	);

	_runTest(
		`<nil.nil>`,
		{value: 'myval', children: [cv(null), cv(null)]},
		`should ignore values of parent nodes`
	);

	_runTest(
		`<nil.nil>`,
		ct(null, null, "an error message"),
		`should ignore errors`
	);
});
