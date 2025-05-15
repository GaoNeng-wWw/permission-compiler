import { describe, it, expect } from 'vitest';
import { Parser } from '../permission-parser';
import { Token, TokenKind } from '../permission-lexer';

describe('Parser', () => {
  const createToken = (kind: TokenKind, char: string = ''): Token => ({
    kind,
    char,
    humanKind: TokenKind[kind],
  });

  it('should parse a single identifier', () => {
    const tokens = [createToken(TokenKind.IDENTIFIER, 'x'), createToken(TokenKind.EOF)];
    const parser = new Parser(tokens);
    const result = parser.run();
    expect(result).toEqual({
      type: 'Identifier',
      name: 'x',
    });
  });

  it('should parse a prefix expression', () => {
    const tokens = [
      createToken(TokenKind.NOT),
      createToken(TokenKind.IDENTIFIER, 'x'),
      createToken(TokenKind.EOF),
    ];
    const parser = new Parser(tokens);
    const result = parser.run();
    expect(result).toEqual({
      type: 'PrefixExpr',
      operator: { kind: TokenKind.NOT, char: '', humanKind: 'NOT' },
      expr: { type: 'Identifier', name: 'x' },
    });
  });

  it('should parse a binary expression', () => {
    const tokens = [
      createToken(TokenKind.IDENTIFIER, 'x'),
      createToken(TokenKind.AND),
      createToken(TokenKind.IDENTIFIER, 'y'),
      createToken(TokenKind.EOF),
    ];
    const parser = new Parser(tokens);
    const result = parser.run();
    expect(result).toEqual({
      type: 'BinaryExpr',
      lhs: { type: 'Identifier', name: 'x' },
      rhs: { type: 'Identifier', name: 'y' },
      operator: { kind: TokenKind.AND, char: '', humanKind: 'AND' },
    });
  });

  it('should parse a grouped expression', () => {
    const tokens = [
      createToken(TokenKind.LEFT_PARENTHESIS),
      createToken(TokenKind.IDENTIFIER, 'x'),
      createToken(TokenKind.RIGHT_PARENTHESIS),
      createToken(TokenKind.EOF),
    ];
    const parser = new Parser(tokens);
    const result = parser.run();
    expect(result).toEqual({
      type: 'Identifier',
      name: 'x',
    });
  });

  it('should parse a function call', () => {
    const tokens = [
      createToken(TokenKind.IDENTIFIER, 'fn'),
      createToken(TokenKind.LEFT_PARENTHESIS),
      createToken(TokenKind.IDENTIFIER, 'x'),
      createToken(TokenKind.COMMA),
      createToken(TokenKind.IDENTIFIER, 'y'),
      createToken(TokenKind.RIGHT_PARENTHESIS),
      createToken(TokenKind.EOF),
    ];
    const parser = new Parser(tokens);
    const result = parser.run();
    expect(result).toEqual({
      type: 'FnCall',
      name: { type: 'Identifier', name: 'fn' },
      args: [
        { type: 'Identifier', name: 'x' },
        { type: 'Identifier', name: 'y' },
      ],
    });
  });

  it('should throw an error for unexpected tokens', () => {
    const tokens = [createToken(TokenKind.AND), createToken(TokenKind.EOF)];
    const parser = new Parser(tokens);
    expect(() => parser.run()).toThrow('Except token AND');
  });

  it('should throw an error for mismatched parentheses', () => {
    const tokens = [
      createToken(TokenKind.LEFT_PARENTHESIS),
      createToken(TokenKind.IDENTIFIER, 'x'),
      createToken(TokenKind.EOF),
    ];
    const parser = new Parser(tokens);
    expect(() => parser.run()).toThrow('Expcetion RIGHT_PARENTHESIS but find EOF');
  });
});