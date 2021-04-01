import { expect } from "chai";
import { describe, it } from "mocha";
import lexer, {
	TKN_BAR,
	TKN_COMMA,
	TKN_CTR,
	TKN_DOT,
	TKN_DOTS,
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
			expect(lexer('|')).to.eql([TKN_BAR]);
		})
	})
	describe(`,`, function () {
		it(`Should produce 'TKN_COMMA'`, function () {
			expect(lexer(',')).to.eql([TKN_COMMA]);
		})
	})
	describe(`${TKN_CTR}`, function () {
		it(`Should produce 'TKN_CTR'`, function () {
			expect(lexer(':')).to.eql([TKN_CTR]);
		})
	})
	describe(`${TKN_DOT}`, function () {
		it(`Should produce 'TKN_DOT'`, function () {
			expect(lexer('.')).to.eql([TKN_DOT]);
		})
	})
	describe(`${TKN_DOTS}`, function () {
		it(`Should produce 'TKN_DOTS'`, function () {
			expect(lexer('...')).to.eql([TKN_DOTS]);
		})
	})

	describe(`${TKN_LIST_OPN}`, function () {
		it(`Should produce 'TKN_LIST_OPN'`, function () {
			expect(lexer('[')).to.eql([TKN_LIST_OPN]);
		})
	})
	describe(`${TKN_LIST_CLS}`, function () {
		it(`Should produce 'TKN_LIST_CLS'`, function () {
			expect(lexer(']')).to.eql([TKN_LIST_CLS]);
		})
	})
	describe(`'(`, function () {
		it(`Should produce 'TKN_PREN_OPN'`, function () {
			expect(lexer('(')).to.eql([TKN_PREN_OPN]);
		})
	})
	describe(`)`, function () {
		it(`Should produce 'TKN_PREN_CLS'`, function () {
			expect(lexer(')')).to.eql([TKN_PREN_CLS]);
		})
	})
	describe(`<`, function () {
		it(`Should produce 'TKN_TREE_OPN'`, function () {
			expect(lexer('<')).to.eql([TKN_TREE_OPN]);
		})
	})
	describe(`>`, function () {
		it(`Should produce 'TKN_TREE_CLS'`, function () {
			expect(lexer('>')).to.eql([TKN_TREE_CLS]);
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
			expect(actual).to.eql(
				[]
			);
		});
	});
	describe(`'    nil    '`, function () {
		it(`should produce the 'nil' token`, function () {
			const actual: TOKEN[] = lexer('    nil    ');
			expect(actual).to.eql(
				['nil']
			);
		});
	});
});

describe('Lexer (tokens)', function () {
	describe(`'nil'`, function () {
		it(`should produce the token`, function () {
			const actual: TOKEN[] = lexer('nil');
			expect(actual).to.eql(
				['nil']
			);
		});
	});
	describe(`'mytoken'`, function () {
		it(`should produce the token`, function () {
			const actual: TOKEN[] = lexer('mytoken');
			expect(actual).to.eql(
				['mytoken']
			);
		});
	});
	describe(`'nilish'`, function () {
		it(`should not split into two tokens`, function () {
			const actual: TOKEN[] = lexer('nilish');
			expect(actual).to.eql(
				['nilish']
			);
		});
	});
	describe(`'my tokens'`, function () {
		it(`should produce two separate tokens`, function () {
			const actual: TOKEN[] = lexer('my token');
			expect(actual).to.eql(
				['my', 'token']
			);
		});
	});
});

describe('Lexer (trees)', function () {
	describe(`'<nil.nil>'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('<nil.nil>');
			expect(actual).to.eql(
				[TKN_TREE_OPN, 'nil', TKN_DOT, 'nil', TKN_TREE_CLS]
			);
		});
	});
	describe(`'<<nil.nil>.nil>'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('<<nil.nil>.nil>');
			expect(actual).to.eql(
				[TKN_TREE_OPN, TKN_TREE_OPN, 'nil', TKN_DOT, 'nil', TKN_TREE_CLS, TKN_DOT, 'nil', TKN_TREE_CLS]
			);
		});
	});
	describe(`'<nil.<nil.nil>>'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('<nil.<nil.nil>>');
			expect(actual).to.eql(
				[TKN_TREE_OPN, 'nil', TKN_DOT, TKN_TREE_OPN, 'nil', TKN_DOT, 'nil', TKN_TREE_CLS, TKN_TREE_CLS]
			);
		});
	});
});

describe('Lexer (lists)', function () {
	describe(`'int[]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('int[]');
			expect(actual).to.eql(
				['int', TKN_LIST_OPN, TKN_LIST_CLS]
			);
		});
	});
	describe(`'(int|any)[]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('(int|any)[]');
			expect(actual).to.eql(
				[TKN_PREN_OPN, 'int', TKN_BAR, 'any', TKN_PREN_CLS, TKN_LIST_OPN, TKN_LIST_CLS]
			);
		});
	});
	describe(`'[int]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[int]');
			expect(actual).to.eql(
				[TKN_LIST_OPN, 'int', TKN_LIST_CLS]
			);
		});
	});
	describe(`'[int, int]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[int, int]');
			expect(actual).to.eql(
				[TKN_LIST_OPN, 'int', TKN_COMMA, 'int', TKN_LIST_CLS]
			);
		});
	});
	describe(`'[int,any]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[int,any]');
			expect(actual).to.eql(
				[TKN_LIST_OPN, 'int', TKN_COMMA, 'any', TKN_LIST_CLS]
			);
		});
	});
	describe(`'[int, any]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[int, any]');
			expect(actual).to.eql(
				[TKN_LIST_OPN, 'int', TKN_COMMA, 'any', TKN_LIST_CLS]
			);
		});
	});

	describe(`'[any, any[]]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[any, any[]]');
			expect(actual).to.eql(
				[TKN_LIST_OPN, 'any', TKN_COMMA, 'any', TKN_LIST_OPN, TKN_LIST_CLS, TKN_LIST_CLS]
			);
		});
	});
	describe(`'[any, ...]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[any, ...]');
			expect(actual).to.eql(
				[TKN_LIST_OPN, 'any', TKN_COMMA, TKN_DOTS, TKN_LIST_CLS]
			);
		});
	});
	describe(`'[..., any]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[..., any]');
			expect(actual).to.eql(
				[TKN_LIST_OPN, TKN_DOTS, TKN_COMMA, 'any', TKN_LIST_CLS]
			);
		});
	});
	describe(`'[...]'`, function () {
		it('should produce a matching token list', function () {
			const actual: TOKEN[] = lexer('[...]');
			expect(actual).to.eql(
				[TKN_LIST_OPN, TKN_DOTS, TKN_LIST_CLS]
			);
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
