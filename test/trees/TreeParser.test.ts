import { expect } from "chai";
import { describe, it } from "mocha";
import lexTree, { TOKEN } from "../../src/trees/TreeLexer";
import parseTree from "../../src/trees/TreeParser";
import { BinaryTree } from "../../src";
import { t, tn } from "../utils";

describe('TreeParser (valid)', function () {
	describe(`#parseTree('')`, function () {
		it('should produce an empty tree', function () {
			let tokens: TOKEN[] = lexTree('');
			expect(parseTree(tokens)).to.eql(null);
		});
	});

	describe(`#parseTree('nil')`, function () {
		it('should produce an empty tree', function () {
			let tokens: TOKEN[] = lexTree('nil');
			expect(parseTree(tokens)).to.eql(null);
		});
	});

	describe(`#parseTree('<nil.nil>')`, function () {
		it('should produce a tree with 2 empty leaves', function () {
			let tokens: TOKEN[] = lexTree('<nil.nil>');
			expect(parseTree(tokens)).to.eql(
				t(null, null)
			);
		});
	});

	describe(`#parseTree('<<nil.nil>.<nil.nil>>')`, function () {
		it('should produce a tree of trees', function () {
			let tokens: TOKEN[] = lexTree('<<nil.nil>.<nil.nil>>');
			expect(parseTree(tokens)).to.eql(
				t(t(null, null), t(null, null))
			);
		});
	});

	describe(`#parseTree('<<<nil.<nil.nil>>.nil>.<nil.<<nil.nil>.nil>>>')`, function () {
		it('should produce a complex binary tree', function () {
			const expected: BinaryTree = t(
				t(t(null, t(null, null)), null),
				t(null, t(t(null, null), null))
			);
			let tokens: TOKEN[] = lexTree('<<<nil.<nil.nil>>.nil>.<nil.<<nil.nil>.nil>>>');
			const actual: BinaryTree | null = parseTree(tokens);
			expect(actual).to.eql(expected);
		});
	});

	describe(`Numbers`, function() {
		for (let num of [0, 1, 2, 10, 100, 1009]) {
			describe(`#parseTree('${num}')`, function () {
				it(`should convert the number ${num}`, function () {
					let tokens: TOKEN[] = lexTree(`${num}`);
					let expected = tn(num);
					expect(parseTree(tokens)).to.deep.equal(expected);
				});
			});
		}
		describe(`#parseTree('<10.10>')`, function () {
			it('should accept numbers in a tree', function () {
				let tokens: TOKEN[] = lexTree(`<10.10>`);
				let expected = t(tn(10), tn(10));
				expect(parseTree(tokens)).to.deep.equal(expected);
			});
		});
		describe(`#parseTree('<nil.<1.2>>')`, function () {
			it('should accept numbers in a nested tree', function () {
				let tokens: TOKEN[] = lexTree(`<nil.<1.2>>`);
				let expected = t(null, t(tn(1), tn(2)));
				expect(parseTree(tokens)).to.deep.equal(expected);
			});
		});
		describe(`#parseTree('<<<1.2>.<3.4>>.<<5.6>.<7.8>>>')`, function () {
			it('should accept numbers in a nested tree', function () {
				let tokens: TOKEN[] = lexTree(`<<<1.2>.<3.4>>.<<5.6>.<7.8>>>`);
				let expected = t(
					t(t(tn(1), tn(2)), t(tn(3), tn(4))),
					t(t(tn(5), tn(6)), t(tn(7), tn(8)))
				);
				expect(parseTree(tokens)).to.deep.equal(expected);
			});
		});
	});
});

describe('TreeParser (invalid syntax)', function () {
	//Unmatched brackets
	describe(`#parseTree('<')`, function () {
		it('should detect an unmatched opening bracket', function () {
			let tokens: TOKEN[] = lexTree('<');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected end of input`);
		});
	});
	describe(`#parseTree('<nil.<nil.nil>')`, function () {
		it('should detect an unmatched opening bracket', function () {
			let tokens: TOKEN[] = lexTree('<nil.<nil.nil>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected end of input: Expected '>'`);
		});
	});
	describe(`#parseTree('>')`, function () {
		it('should detect an unmatched closing bracket', function () {
			let tokens: TOKEN[] = lexTree('>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: '>'`);
		});
	});
	describe(`#parseTree('nil.nil')`, function () {
		it('should detect tree without brackets', function () {
			let tokens: TOKEN[] = lexTree('nil.nil');
			expect(() => parseTree(tokens)).to.throw(Error, `Expected end of statement but got '.'`);
		});
	});


	//Missing tree element
	describe(`#parseTree('<nil>')`, function () {
		it('should detect a tree with only one child', function () {
			let tokens: TOKEN[] = lexTree('<nil>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: expected '.' got '>'`);
		});
	});
	describe(`#parseTree('<<nil.nil>>')`, function () {
		it('should detect a tree with only one child', function () {
			let tokens: TOKEN[] = lexTree('<<nil.nil>>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: expected '.' got '>'`);
		});
	});
	describe(`#parseTree('<<nil>.nil>')`, function () {
		it('should detect a nested tree with only one child', function () {
			let tokens: TOKEN[] = lexTree('<<nil>.nil>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: expected '.' got '>'`);
		});
	});
	describe(`#parseTree('<.nil>')`, function () {
		it('should detect a tree with an empty child', function () {
			let tokens: TOKEN[] = lexTree('<.nil>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: '.'`);
		});
	});
	describe(`#parseTree('<nil.>')`, function () {
		it('should detect a tree with an empty child', function () {
			let tokens: TOKEN[] = lexTree('<nil.>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: '>'`);
		});
	});
	describe(`#parseTree('<.<nil.nil>>')`, function () {
		it('should detect a tree with an empty child', function () {
			let tokens: TOKEN[] = lexTree('<.<nil.nil>>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: '.'`);
		});
	});

	//Too many tree elements
	describe(`#parseTree('<nil.nil.nil>')`, function () {
		it('should detect a tree with too many elements', function () {
			let tokens: TOKEN[] = lexTree('<nil.nil.nil>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: expected '>' got '.'`);
		});
	});
	describe(`#parseTree('<nil.<nil.nil.nil>>')`, function () {
		it('should detect a nested tree with too many elements', function () {
			let tokens: TOKEN[] = lexTree('<nil.<nil.nil.nil>>');
			expect(() => parseTree(tokens)).to.throw(Error, `Unexpected token: expected '>' got '.'`);
		});
	});
});
