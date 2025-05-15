import { describe, it, expect } from 'vitest';
import { objectGenerate } from '../ir';
import { TokenKind } from '../permission-lexer';
import { BinaryExpr, FnCall, Identifier, PrefixExpr } from '../permission-parser';

describe('objectGenerate', () => {
  it('should generate a HAS object for an Identifier node', () => {
    const node: Identifier = { type: 'Identifier', name: 'read' };
    const result = objectGenerate(node);
    expect(result).toEqual({ type: 'HAS', val: 'read' });
  });

  it('should generate an AND object for a BinaryExpr node with AND operator', () => {
    const node: BinaryExpr = {
      type: 'BinaryExpr',
      lhs: { type: 'Identifier', name: 'read' },
      rhs: { type: 'Identifier', name: 'write' },
      operator: {
        kind: TokenKind.AND,
        humanKind: 'AND',
        char: '&&'
      },
    };
    const result = objectGenerate(node);
    expect(result).toEqual({
      type: 'AND',
      lhs: { type: 'HAS', val: 'read' },
      rhs: { type: 'HAS', val: 'write' },
    });
  });

  it('should generate an OR object for a BinaryExpr node with OR operator', () => {
    const node: BinaryExpr = {
      type: 'BinaryExpr',
      lhs: { type: 'Identifier', name: 'read' },
      rhs: { type: 'Identifier', name: 'write' },
      operator: {
        kind: TokenKind.OR,
        humanKind: 'OR',
        char: '||'
      },
    };
    const result = objectGenerate(node);
    expect(result).toEqual({
      type: 'OR',
      lhs: { type: 'HAS', val: 'read' },
      rhs: { type: 'HAS', val: 'write' },
    });
  });

  it('should generate a NOT object for a PrefixExpr node', () => {
    const node: PrefixExpr = {
      type: 'PrefixExpr',
      operator: { kind: TokenKind.NOT, humanKind: 'NOT', char: '!'},
      expr: { type: 'Identifier', name: 'read' },
    };
    const result = objectGenerate(node);
    expect(result).toEqual({
      type: 'NOT',
      expr: { type: 'HAS', val: 'read' },
    });
  });

  it('should generate a HAS object for a FnCall node with "has" function', () => {
    const node: FnCall = {
      type: 'FnCall',
      name: { type: 'Identifier', name: 'has' },
      args: [{ type: 'Identifier', name: 'read' }],
    };
    const result = objectGenerate(node);
    expect(result).toEqual({
      type: 'HAS',
      val: 'read',
    });
  });

  it('should throw an error for a FnCall node with an unknown function', () => {
    const node: FnCall = {
      type: 'FnCall',
      name: { type: 'Identifier', name: 'unknown' },
      args: [],
    };
    expect(() => objectGenerate(node)).toThrow('unknown not implment yet');
  });

  it('should throw an error for a FnCall node with invalid arguments', () => {
    const node: FnCall = {
      type: 'FnCall',
      name: { type: 'Identifier', name: 'has' },
      args: [{ type: 'FnCall', name: { type: 'Identifier', name: 'nested' }, args: [] }],
    };
    expect(() => objectGenerate(node)).toThrow(
      'Argument only can be identifier, binary express or prefix express'
    );
  });

  it('should return null for an unsupported node type', () => {
    const node = { type: 'UnsupportedNode' } as any;
    const result = objectGenerate(node);
    expect(result).toBeNull();
  });
});
it('should generate an EVERY object for a FnCall node with "every" function', () => {
  const node: FnCall = {
    type: 'FnCall',
    name: { type: 'Identifier', name: 'every' },
    args: [
      { type: 'Identifier', name: 'read' },
      { type: 'Identifier', name: 'write' },
    ],
  };
  const result = objectGenerate(node);
  expect(result).toEqual({
    type: 'EVERY',
    val: ['read', 'write'],
  });
});

it('should generate a SOME object for a FnCall node with "some" function', () => {
  const node: FnCall = {
    type: 'FnCall',
    name: { type: 'Identifier', name: 'some' },
    args: [
      { type: 'Identifier', name: 'read' },
      { type: 'Identifier', name: 'write' },
    ],
  };
  const result = objectGenerate(node);
  expect(result).toEqual({
    type: 'SOME',
    val: ['read', 'write'],
  });
});

it('should throw an error for a PrefixExpr node with an unsupported operator', () => {
  const node: PrefixExpr = {
    type: 'PrefixExpr',
    operator: { kind: TokenKind.AND, humanKind: 'AND', char: '&&' },
    expr: { type: 'Identifier', name: 'read' },
  };
  expect(() => objectGenerate(node)).toThrow('Unknown AND');
});

it('should throw an error for a BinaryExpr node with an unsupported operator', () => {
  const node: BinaryExpr = {
    type: 'BinaryExpr',
    lhs: { type: 'Identifier', name: 'read' },
    rhs: { type: 'Identifier', name: 'write' },
    operator: {
      kind: TokenKind.NOT,
      humanKind: 'NOT',
      char: '!',
    },
  };
  expect(() => objectGenerate(node)).toThrow(
    'Operator only support && or ||, or you can use keywords `and` or `or`.'
  );
});

it('should throw an error for a FnCall node with a partially matching function name', () => {
  const node: FnCall = {
    type: 'FnCall',
    name: { type: 'Identifier', name: 'eve' },
    args: [],
  };
  expect(() => objectGenerate(node)).toThrow('eve not found, did you want use every?');
});

it('should throw an error for a FnCall node with "has" function and multiple arguments', () => {
  const node: FnCall = {
    type: 'FnCall',
    name: { type: 'Identifier', name: 'has' },
    args: [
      { type: 'Identifier', name: 'read' },
      { type: 'Identifier', name: 'write' },
    ],
  };
  expect(() => objectGenerate(node)).toThrow('Except 1 argument but recvice 2');
});