import { expect } from "chai";
import { describe, it } from "mocha";
import * as util from "util";
import { ct, cv, t, tn, treeToString } from "../utils";
import runConvert, { BinaryTree, ConversionResultType } from "../../src";


function _runTest(converter: string, atoms: Map<string, string>, tree: BinaryTree, expectedValue: ConversionResultType|(()=>ConversionResultType), its = '') {
	describe(`"${converter}" (${treeToString(tree)})`, function () {
		it(its, function () {
			const actual = runConvert(tree, converter, atoms);
			let expected;
			if (typeof expectedValue === "function") expected = expectedValue();
			else expected = expectedValue;
			expect(actual).to.deep.equal(expected);
		});
	});
}

//Error message definitions
const UNKNOWN_TYPE = `Unknown type '%s'`;

//Tests start
describe(`Custom Atoms`, function () {
	let atoms = new Map<string, string>([
		['b', '<nil.nil>|nil'],
		['long_atom_name', 'b'],
		['mytree', '<<nil.nil>.<nil.nil>>'],
		['valid_atom', 'invalid_atom'],
		['mylist', 'int[]'],
	]);

	describe(`Valid`, function () {
		_runTest('b',
			atoms,
			null,
			{
				error: false,
				tree: cv('b')
			},
			`should return 'b' as the only node`
		);

		_runTest('b',
			atoms,
			t(null, null),
			{
				error: false,
				tree: {
					value: 'b',
					error: undefined,
					children: [cv(null), cv(null)]
				}
			},
			`should return 'b' above the original tree`
		);

		_runTest('long_atom_name',
			atoms,
			t(null, null),
			{
				error: false,
				tree: {
					value: 'long_atom_name',
					error: undefined,
					children: [cv(null), cv(null)]
				}
			},
			`should return 'long_atom_name' above the original tree`
		);

		_runTest('mytree',
			atoms,
			t(t(null, null), t(null, null)),
			{
				error: false,
				tree: {
					value: 'mytree',
					error: undefined,
					children: [ct(null, null), ct(null, null)]
				}
			},
			`should return 'mytree' above the original tree`
		);
		_runTest('mylist',
			atoms,
			t(tn(5), t(tn(4), t(tn(3), null))),
			{
				error: false,
				tree: {
					value: 'mylist',
					list: true,
					children: [cv(5), cv(4), cv(3)]
				}
			},
			`should return 'mylist' above the list [5,4,3]`
		);
	});

	describe(`Invalid`, function () {
		_runTest('invalid_atom',
			atoms,
			t(null, null),
			{
				error: true,
				tree: {
					error: util.format(UNKNOWN_TYPE, 'invalid_atom'),
					children: [cv(null), cv(null)]
				}
			},
			`should return an errored tree complaining about 'invalid_atom'`
		);
		_runTest('valid_atom',
			atoms,
			t(null, null),
			{
				error: true,
				tree: {
					value: 'valid_atom',
					error: util.format(UNKNOWN_TYPE, 'invalid_atom'),
					children: [cv(null), cv(null)]
				}
			},
			`should return 'valid_atom' above an errored tree complaining about 'invalid_atom'`
		);
	});
});
