import { expect } from "chai";
import { describe, it } from "mocha";
import { ConvertedBinaryTree, stringify } from "../src";

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
	return { children: [l, r], error };
}

/**
 *
 * @param elements
 */
function a(...elements: (ConvertedBinaryTree|string|number|null)[]): ConvertedBinaryTree {
	const standardisedElements = elements.map((e) => {
		if (e === null) return cv(null);
		if (typeof e === 'number' || typeof e === 'string') return cv(e);
		return e;
	});
	return {
		children: standardisedElements,
		value: '[]',
		list: true,
	}
}

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
