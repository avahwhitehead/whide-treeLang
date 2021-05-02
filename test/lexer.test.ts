import { expect } from "chai";
import { describe, it } from "mocha";
import lexer, {
	TKN_BAR,
	TKN_COMMA,
	TKN_CTR,
	TKN_DOT,
	TKN_LIST_CLS,
	TKN_LIST_OPN,
	TKN_PREN_CLS,
	TKN_PREN_OPN,
	TKN_TREE_CLS,
	TKN_TREE_OPN,
	TOKEN
} from "../src/lexer";

describe('Lexer (symbols)', function () {
	describe(`'|'`, function () {
		it(`Should produce 'TKN_BAR'`, function () {
			const expected: TOKEN[] = [TKN_BAR];
			const actual: TOKEN[] = lexer('|');
			expect(actual).to.eql(expected);
		})
	})
	describe(`,`, function () {
		it(`Should produce 'TKN_COMMA'`, function () {
			const expected: TOKEN[] = [TKN_COMMA];
			const actual: TOKEN[] = lexer(',');
			expect(actual).to.eql(expected);
		})
	})
	describe(`${TKN_CTR}`, function () {
		it(`Should produce 'TKN_CTR'`, function () {
			const expected: TOKEN[] = [TKN_CTR];
			const actual: TOKEN[] = lexer(':');
			expect(actual).to.eql(expected);
		})
	})
	describe(`${TKN_DOT}`, function () {
		it(`Should produce 'TKN_DOT'`, function () {
			const expected: TOKEN[] = [TKN_DOT];
			const actual: TOKEN[] = lexer('.');
			expect(actual).to.eql(expected);
		})
	})

	describe(`${TKN_LIST_OPN}`, function () {
		it(`Should produce 'TKN_LIST_OPN'`, function () {
			const expected: TOKEN[] = [TKN_LIST_OPN];
			const actual: TOKEN[] = lexer('[');
			expect(actual).to.eql(expected);
		})
	})
	describe(`${TKN_LIST_CLS}`, function () {
		it(`Should produce 'TKN_LIST_CLS'`, function () {
			const expected: TOKEN[] = [TKN_LIST_CLS];
			const actual: TOKEN[] = lexer(']');
			expect(actual).to.eql(expected);
		})
	})
	describe(`'(`, function () {
		it(`Should produce 'TKN_PREN_OPN'`, function () {
			const expected: TOKEN[] = [TKN_PREN_OPN];
			const actual: TOKEN[] = lexer('(');
			expect(actual).to.eql(expected);
		})
	})
	describe(`)`, function () {
		it(`Should produce 'TKN_PREN_CLS'`, function () {
			const expected: TOKEN[] = [TKN_PREN_CLS];
			const actual: TOKEN[] = lexer(')');
			expect(actual).to.eql(expected);
		})
	})
	describe(`<`, function () {
		it(`Should produce 'TKN_TREE_OPN'`, function () {
			const expected: TOKEN[] = [TKN_TREE_OPN];
			const actual: TOKEN[] = lexer('<');
			expect(actual).to.eql(expected);
		})
	})
	describe(`>`, function () {
		it(`Should produce 'TKN_TREE_CLS'`, function () {
			const expected: TOKEN[] = [TKN_TREE_CLS];
			const actual: TOKEN[] = lexer('>');
			expect(actual).to.eql(expected);
		})
	})
});

describe('Lexer (whitespace)', function () {
	describe(`''`, function () {
		it('should produce an empty list', function () {
			const actual: TOKEN[] = lexer('');
			expect(actual).to.eql(
				[]
			);
		});
	});
	describe(`'    '`, function () {
		it('should produce an empty list', function () {
			const actual: TOKEN[] = lexer('    ');
			const expected: TOKEN[] = []
			expect(actual).to.eql(expected);
		});
	});
	describe(`'    nil    '`, function () {
		it(`should produce the 'nil' token`, function () {
			const actual: TOKEN[] = lexer('    nil    ');
			const expected: TOKEN[] = ['nil']
			expect(actual).to.eql(expected);
		});
	});
});

describe('Lexer (tokens)', function () {
	describe(`'nil'`, function () {
		it(`should produce the token`, function () {
			const actual: TOKEN[] = lexer('nil');
			const expected: TOKEN[] = ['nil']
			expect(actual).to.eql(expected);
		});
	});
	describe(`'mytoken'`, function () {
		it(`should produce the token`, function () {
			const actual: TOKEN[] = lexer('mytoken');
			const expected: TOKEN[] = ['mytoken']
			expect(actual).to.eql(expected);
		});
	});
	describe(`'nilish'`, function () {
		it(`should not split into two tokens`, function () {
			const actual: TOKEN[] = lexer('nilish');
			const expected: TOKEN[] = ['nilish']
			expect(actual).to.eql(expected);
		});
	});
	describe(`'my tokens'`, function () {
		it(`should produce two separate tokens`, function () {
			const actual: TOKEN[] = lexer('my token');
			const expected: TOKEN[] = ['my', 'token']
			expect(actual).to.eql(expected);
		});
	});
	for (let num of ['0', '1', '9', '10', '226']) {
		describe(`'${num}'`, function () {
			it(`should produce the number ${num}`, function () {
				const actual: TOKEN[] = lexer(num);
				const expected: TOKEN[] = [Number.parseInt(num)];
				expect(actual).to.eql(expected);
			});
		});
	}
	describe(`'10 5'`, function () {
		it(`should produce the tokens 10 and 5`, function () {
			const actual: TOKEN[] = lexer('10 5');
			const expected: TOKEN[] = [10, 5];
			expect(actual).to.eql(expected);
		});
	});
	describe(`'10atom'`, function () {
		it(`should produce two tokens (10 and 'atom')`, function () {
			const actual: TOKEN[] = lexer('10atom');
			const expected: TOKEN[] = [10, 'atom'];
			expect(actual).to.eql(expected);
		});
	});
	describe(`'atom 10'`, function () {
		it(`should produce the tokens 'atom' and 10`, function () {
			const actual: TOKEN[] = lexer('atom 10');
			const expected: TOKEN[] = ['atom', 10];
			expect(actual).to.eql(expected);
		});
	});
});

describe('Lexer (trees)', function () {
	describe(`'<nil.nil>'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('<nil.nil>');
			const expected: TOKEN[] = [TKN_TREE_OPN, 'nil', TKN_DOT, 'nil', TKN_TREE_CLS]
			expect(actual).to.eql(expected);
		});
	});
	describe(`'<<nil.nil>.nil>'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('<<nil.nil>.nil>');
			const expected: TOKEN[] = [TKN_TREE_OPN, TKN_TREE_OPN, 'nil', TKN_DOT, 'nil', TKN_TREE_CLS, TKN_DOT, 'nil', TKN_TREE_CLS]
			expect(actual).to.eql(expected);
		});
	});
	describe(`'<nil.<nil.nil>>'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('<nil.<nil.nil>>');
			const expected: TOKEN[] = [TKN_TREE_OPN, 'nil', TKN_DOT, TKN_TREE_OPN, 'nil', TKN_DOT, 'nil', TKN_TREE_CLS, TKN_TREE_CLS]
			expect(actual).to.eql(expected);
		});
	});
});

describe('Lexer (lists)', function () {
	describe(`'int[]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('int[]');
			const expected: TOKEN[] = ['int', TKN_LIST_OPN, TKN_LIST_CLS]
			expect(actual).to.eql(expected);
		});
	});
	describe(`'(int|any)[]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('(int|any)[]');
			const expected: TOKEN[] = [TKN_PREN_OPN, 'int', TKN_BAR, 'any', TKN_PREN_CLS, TKN_LIST_OPN, TKN_LIST_CLS]
			expect(actual).to.eql(expected);
		});
	});
	describe(`'[int]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[int]');
			const expected: TOKEN[] = [TKN_LIST_OPN, 'int', TKN_LIST_CLS]
			expect(actual).to.eql(expected);
		});
	});
	describe(`'[int, int]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[int, int]');
			const expected: TOKEN[] = [TKN_LIST_OPN, 'int', TKN_COMMA, 'int', TKN_LIST_CLS]
			expect(actual).to.eql(expected);
		});
	});
	describe(`'[int,any]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[int,any]');
			const expected: TOKEN[] = [TKN_LIST_OPN, 'int', TKN_COMMA, 'any', TKN_LIST_CLS]
			expect(actual).to.eql(expected);
		});
	});
	describe(`'[int, any]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[int, any]');
			const expected: TOKEN[] = [TKN_LIST_OPN, 'int', TKN_COMMA, 'any', TKN_LIST_CLS]
			expect(actual).to.eql(expected);
		});
	});

	describe(`'[any, any[]]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[any, any[]]');
			const expected: TOKEN[] = [TKN_LIST_OPN, 'any', TKN_COMMA, 'any', TKN_LIST_OPN, TKN_LIST_CLS, TKN_LIST_CLS]
			expect(actual).to.eql(expected);
		});
	});
});

describe('Lexer (lexer errors)', function () {
	function _errorMessage(char: string, position: number): string {
		return `Unexpected token '${char}' at position ${position}`;
	}

	describe(`'-'`, function () {
		it('Should throw an unexpected token error', function () {
			expect(() => lexer('-')).to.throw(
				_errorMessage('-', 0)
			);
		});
	});

	describe(`'nil-'`, function () {
		it(`Should throw an unexpected token error at '-'`, function () {
			expect(() => lexer('nil-')).to.throw(
				_errorMessage('-', 3)
			);
		});
	});
});
