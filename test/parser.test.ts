import { expect } from "chai";
import { describe, it } from "mocha";
import runConvert from "../src/runConvert";
import { BinaryTree } from "../src/types/Trees";

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

//================
// Whitespace
//================

describe(`#parser (whitespace)`, function () {
	describe(`Converter: ''`, function () {
		const converter = 'any';
		describe('nil', function () {
			it('should match', function () {
				expect(runConvert(null, converter)).to.eql(null);
			});
		});
		describe('<nil.nil>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(null, null),
					converter
				)).to.eql(t(null, null));
			});
		});
		describe('<<nil.nil>.<nil.nil>>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(t(null, null), t(null, null)),
					converter
				)).to.eql(t(t(null, null), t(null, null)));
			});
		});
	});

	describe(`Converter: '    '`, function () {
		const converter = 'any';
		describe('nil', function () {
			it('should match', function () {
				expect(runConvert(null, converter)).to.eql(null);
			});
		});
		describe('<nil.nil>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(null, null),
					converter
				)).to.eql(t(null, null));
			});
		});
		describe('<<nil.nil>.<nil.nil>>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(t(null, null), t(null, null)),
					converter
				)).to.eql(t(t(null, null), t(null, null)));
			});
		});
	});
});

//================
// Atoms
//================

describe(`#parser (tokens)`, function () {
	describe(`converter: 'nil'`, function () {
		const converter = 'nil';
		describe('nil', function () {
			it('should match', function () {
				expect(runConvert(null, converter)).to.eql(null);
			});
		});
		describe('<nil.nil>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(null, null),
					converter
				)).to.eql({
					expected: 'nil',
					actual: t(null, null),
				});
			});
		});
		describe('<<nil.nil>.<nil.nil>>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(t(null, null), t(null, null)),
					converter
				)).to.eql({
					expected: 'nil',
					actual: t(t(null, null), t(null, null)),
				});
			});
		});
	});

	describe(`converter: 'int'`, function () {
		const converter = 'int';
		describe('nil', function () {
			it('should match', function () {
				expect(runConvert(
					null,
					converter
				)).to.eql(0);
			});
		});
		describe('<nil.nil>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(null, null),
					converter
				)).to.eql(1);
			});
		});
		describe('<nil.<nil.<nil.nil>>>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(null, t(null, t(null, null))),
					converter
				)).to.eql(3);
			});
		});
		describe('<<nil.nil>.<nil.nil>>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(t(null, null), t(null, null)),
					converter
				)).to.eql({
					expected: 'int',
					actual: t(t(null, null), t(null, null)),
				});
			});
		});
	});

	describe(`converter: 'any'`, function () {
		const converter = 'any';
		describe('nil', function () {
			it('should match', function () {
				expect(runConvert(null, converter)).to.eql(null);
			});
		});
		describe('<nil.nil>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(null, null),
					converter
				)).to.eql(t(null, null));
			});
		});
		describe('<<nil.nil>.<nil.nil>>', function () {
			it('should produce the same tree', function () {
				expect(runConvert(
					t(t(null, null), t(null, null)),
					converter
				)).to.eql(t(t(null, null), t(null, null)));
			});
		});
	});
});
