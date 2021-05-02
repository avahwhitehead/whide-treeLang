import ParserException from "../exceptions/ParserException";

/**
 * Create an error object for when an expected token is received
 * @param actual	The actual token received
 * @param expected	The expected token (or undefined)
 */
export function _unexpectedToken<T>(actual: string|T, ...expected: (string|T)[]): ParserException {
	if (expected.length === 0) return new ParserException(`Unexpected token: '${actual}'`);
	if (expected.length === 1) return new ParserException(`Unexpected token: expected '${expected[0]}' got '${actual}'`);
	return new ParserException(`Unexpected token: expected one of '${expected.join(`', '`)}' got '${actual}'`);
}

/**
 * Read the next token from the list.
 * Throws an error if the token list is empty, or if the token doesn't match the expected value
 * @param tokens	The token list
 * @param expected	The expected token. May be undefined to accept any token.
 */
export function _expect<TOKEN>(tokens: TOKEN[], ...expected: TOKEN[]): TOKEN {
	//Read the next token in the list
	const first = tokens.shift();

	//Unexpected end of token list
	if (first === undefined) {
		if (expected.length === 0) throw new ParserException(`Unexpected end of input`);
		else if (expected.length === 1) throw new ParserException(`Unexpected end of input: Expected '${expected[0]}'`);
		else throw new ParserException(`Unexpected end of input: Expected one of '${expected.join(`', '`)}'`);
	}

	//Allow any token if no expected was provided
	if (expected.length === 0) return first;
	//The token matches the expected value
	if (expected.includes(first)) return first;

	//The token is unexpected - throw an error
	throw _unexpectedToken(first, ...expected);
}