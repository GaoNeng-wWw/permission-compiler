import { describe, it, expect } from 'vitest';
import { tokenizer, rules, TokenKind, Token } from '../permission-lexer';

describe('tokenizer', () => {
  const createToken = (kind: TokenKind, char: string): Token => ({
    kind,
    char,
    humanKind: TokenKind[kind],
  });

  it('should tokenize a single identifier', () => {
    const code = 'Some';
    const tokens = tokenizer(code, rules);
    expect(tokens).toEqual([
      createToken(TokenKind.IDENTIFIER, 'Some'),
      createToken(TokenKind.EOF, '0'),
    ]);
  });

  it('should tokenize logical operators', () => {
    const code = 'And Or Not';
    const tokens = tokenizer(code, rules);
    expect(tokens).toEqual([
      createToken(TokenKind.AND, 'And'),
      createToken(TokenKind.OR, 'Or'),
      createToken(TokenKind.NOT, 'Not'),
      createToken(TokenKind.EOF, '0'),
    ]);
  });

  it('should tokenize parentheses', () => {
    const code = '(x)';
    const tokens = tokenizer(code, rules);
    expect(tokens).toEqual([
      createToken(TokenKind.LEFT_PARENTHESIS, '('),
      createToken(TokenKind.IDENTIFIER, 'x'),
      createToken(TokenKind.RIGHT_PARENTHESIS, ')'),
      createToken(TokenKind.EOF, '0'),
    ]);
  });

  it('should tokenize a complex expression', () => {
    const code = 'Some(x And y)';
    const tokens = tokenizer(code, rules);
    expect(tokens).toEqual([
      createToken(TokenKind.IDENTIFIER, 'Some'),
      createToken(TokenKind.LEFT_PARENTHESIS, '('),
      createToken(TokenKind.IDENTIFIER, 'x'),
      createToken(TokenKind.AND, 'And'),
      createToken(TokenKind.IDENTIFIER, 'y'),
      createToken(TokenKind.RIGHT_PARENTHESIS, ')'),
      createToken(TokenKind.EOF, '0'),
    ]);
  });

  it('should tokenize identifiers with underscores and numbers', () => {
    const code = 'var_1 var2';
    const tokens = tokenizer(code, rules);
    expect(tokens).toEqual([
      createToken(TokenKind.IDENTIFIER, 'var_1'),
      createToken(TokenKind.IDENTIFIER, 'var2'),
      createToken(TokenKind.EOF, '0'),
    ]);
  });

  it('should skip whitespace', () => {
    const code = '  x   y  ';
    const tokens = tokenizer(code, rules);
    expect(tokens).toEqual([
      createToken(TokenKind.IDENTIFIER, 'x'),
      createToken(TokenKind.IDENTIFIER, 'y'),
      createToken(TokenKind.EOF, '0'),
    ]);
  });

  it('should throw an error for invalid input', () => {
    const code = '@invalid';
    expect(() => tokenizer(code, rules)).toThrow('Bad Input @invalid');
  });
});