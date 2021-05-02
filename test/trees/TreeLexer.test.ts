import { expect } from "chai";
import { describe, it } from "mocha";
import { TKN_TREE_OPN as OPEN, TKN_TREE_CLS as CLOSE, TKN_DOT as DOT } from "../../src/converter/lexer";
import lexTree, { TOKEN, TKN_NIL as NIL } from "../../src/trees/TreeLexer";

describe('TreeLexer (valid)', function () {
	describe(`#lexTree('')`, function () {
		it('should produce an empty list', function () {
			const expected: TOKEN[] = [];
			const actual: TOKEN[] = lexTree('');
			expect(actual).to.eql(expected);
		});
	});

	describe(`#lexTree('nil')`, function () {
		it('should produce an empty tree', function () {
			const expected: TOKEN[] = [NIL];
			const actual: TOKEN[] = lexTree('nil');
			expect(actual).to.eql(expected);
		});
	});

	describe(`#lexTree('<nil.nil>')`, function () {
		it('should produce a tree with 2 empty leaves', function () {
			const expected: TOKEN[] = [OPEN, NIL, DOT, NIL, CLOSE];
			const actual: TOKEN[] = lexTree('<nil.nil>');
			expect(actual).to.eql(expected);
		});
	});

	describe(`#lexTree('<<<nil.<nil.nil>>.nil>.<nil.<<nil.nil>.nil>>>')`, function () {
		it('should produce a complex binary tree', function () {
			const expected: TOKEN[] = [
				OPEN, OPEN, OPEN, NIL, DOT, OPEN, NIL, DOT, NIL, CLOSE, CLOSE, DOT, NIL, CLOSE, DOT, OPEN, NIL, DOT, OPEN, OPEN, NIL, DOT, NIL, CLOSE, DOT, NIL, CLOSE, CLOSE, CLOSE
			];
			const actual: TOKEN[] = lexTree('<<<nil.<nil.nil>>.nil>.<nil.<<nil.nil>.nil>>>');
			expect(actual).to.eql(expected);
		});
	});

	describe(`#lexTree('>>><<<<')`, function () {
		it('should allow any combination of valid tokens', function () {
			const expected: TOKEN[] = [CLOSE, CLOSE, CLOSE, OPEN, OPEN, OPEN, OPEN];
			const actual: TOKEN[] = lexTree('>>><<<<');
			expect(actual).to.eql(expected);
		});
	});
});

describe('TreeLexer (invalid syntax)', function () {
	function _errorMessage(char: string, position: number): string {
		return `Unexpected token '${char}' at position ${position}`;
	}

	describe(`#lexTree('ni')`, function () {
		it('should detect invalid token', function () {
			expect(() => {
				lexTree('ni');
			}).to.throw(_errorMessage('ni', 0));
		});
	});

	describe(`#lexTree('<nil.nol>')`, function () {
		it('should detect invalid token', function () {
			expect(() => {
				lexTree('<nil.nol>');
			}).to.throw(_errorMessage('nol', 5));
		});
	});
});
