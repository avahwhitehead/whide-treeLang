import { expect } from "chai";
import { describe, it } from "mocha";
import lexTree, { TOKEN } from "../../src/trees/TreeLexer";
import parseTree, { BinaryTree } from "../../src/trees/TreeParser";

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
			expect(parseTree(tokens)).to.eql({
				left: null,
				right: null,
			});
		});
	});

	describe(`#parseTree('<<nil.nil>.<nil.nil>>')`, function () {
		it('should produce a tree of trees', function () {
			let tokens: TOKEN[] = lexTree('<<nil.nil>.<nil.nil>>');
			expect(parseTree(tokens)).to.eql({
				left: {
					left: null,
					right: null,
				},
				right: {
					left: null,
					right: null,
				}
			});
		});
	});

	describe(`#parseTree('<<<nil.<nil.nil>>.nil>.<nil.<<nil.nil>.nil>>>')`, function () {
		it('should produce a complex binary tree', function () {
			const expected: BinaryTree = {
				left: {
					left: {
						left: null,
						right: {
							left: null,
							right: null
						}
					},
					right: null
				},
				right: {
					left: null,
					right: {
						left: {
							left: null,
							right: null
						},
						right: null
					}
				}
			};
			let tokens: TOKEN[] = lexTree('<<<nil.<nil.nil>>.nil>.<nil.<<nil.nil>.nil>>>');
			const actual: BinaryTree | null = parseTree(tokens);
			expect(actual).to.eql(expected);
		});
	});
});

describe('TreeParser (invalid syntax)', function () {
	//Unmatched brackets
	describe(`#parseTree('<')`, function () {
		it('should detect an unmatched opening bracket', function () {
			let tokens: TOKEN[] = lexTree('<');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected end of statement/i);
		});
	});
	describe(`#parseTree('<nil.<nil.nil>')`, function () {
		it('should detect an unmatched opening bracket', function () {
			let tokens: TOKEN[] = lexTree('<nil.<nil.nil>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected end of statement/i);
		});
	});
	describe(`#parseTree('>')`, function () {
		it('should detect an unmatched closing bracket', function () {
			let tokens: TOKEN[] = lexTree('>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});
	describe(`#parseTree('nil.nil')`, function () {
		it('should detect tree without brackets', function () {
			let tokens: TOKEN[] = lexTree('nil.nil');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});


	//Missing tree element
	describe(`#parseTree('<nil>')`, function () {
		it('should detect a tree with only one child', function () {
			let tokens: TOKEN[] = lexTree('<nil>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});
	describe(`#parseTree('<<nil.nil>>')`, function () {
		it('should detect a tree with only one child', function () {
			let tokens: TOKEN[] = lexTree('<<nil.nil>>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});
	describe(`#parseTree('<<nil>.nil>')`, function () {
		it('should detect a nested tree with only one child', function () {
			let tokens: TOKEN[] = lexTree('<<nil>.nil>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});
	describe(`#parseTree('<.nil>')`, function () {
		it('should detect a tree with an empty child', function () {
			let tokens: TOKEN[] = lexTree('<.nil>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});
	describe(`#parseTree('<nil.>')`, function () {
		it('should detect a tree with an empty child', function () {
			let tokens: TOKEN[] = lexTree('<nil.>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});
	describe(`#parseTree('<.<nil.nil>>')`, function () {
		it('should detect a tree with an empty child', function () {
			let tokens: TOKEN[] = lexTree('<.<nil.nil>>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});

	//Too many tree elements
	describe(`#parseTree('<nil.nil.nil>')`, function () {
		it('should detect a tree with too many elements', function () {
			let tokens: TOKEN[] = lexTree('<nil.nil.nil>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});
	describe(`#parseTree('<nil.<nil.nil.nil>>')`, function () {
		it('should detect a nested tree with too many elements', function () {
			let tokens: TOKEN[] = lexTree('<nil.<nil.nil.nil>>');
			expect(() => parseTree(tokens)).to.throw(Error, /^unexpected token/i);
		});
	});
});
