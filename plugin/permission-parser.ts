import { toKeyAlias } from '@babel/types';
import {Token, TokenKind} from './permission-lexer';

export const enum BP {
  DEFAULT_BP,
  COMMA,
  LOGICAL,
  UNARY,
  CALL,
  PRIMARY
}

export type Node = Expr;
export type Expr = FnCall | BinaryExpr | Identifier | PrefixExpr;
export interface PrefixExpr {
  type: 'PrefixExpr',
  operator: Token;
  expr: Expr;
}
export interface FnCall {
  type: 'FnCall',
  name: Node;
  args: Expr[];
}
export interface BinaryExpr {
  type: 'BinaryExpr',
  operator: Token;
  lhs:Expr;
  rhs: Expr;
}
export interface Identifier {
  type: 'Identifier',
  name: string;
}
export class Parser {
  constructor(
    private tokens: Token[]=[],
    private pos=0,
    private nudMap = new Map<TokenKind, NudHandle>(),
    private ledMap = new Map<TokenKind, LedHandle>(),
    private bpMap=new Map<TokenKind, BP>()
  ){
    this.setup();
  }

  run(){
    return this.parseExpr.bind(this)(BP.DEFAULT_BP);
  }

  parseExpr(bp:BP){
    const token = this.peek();
    const tokenKind = token.kind;
    const nud = this.nudMap.get(tokenKind);
    if (!nud) {
      throw new Error(`Except token ${TokenKind[token.kind]}`);
    }
    let lhs = nud();
    while (
      this.bpMap.get(this.peek().kind) !== undefined && 
      this.bpMap.get(this.peek().kind)! > bp
    ) {
      const cur = this.peek();
      const tk = cur.kind;
      const led = this.ledMap.get(tk);
      if(!led){
        throw new Error(`Except for token ${cur.humanKind}`);
      }
      lhs = led(lhs, bp);
    }
    return lhs;
  }
  parsePrefix(){
    const operator = this.next();
    const expr = this.parseExpr(BP.UNARY);
    return {
      type:  'PrefixExpr',
      operator,
      expr
    } as PrefixExpr
  }
  parseBinary(lhs: Expr){
    const operator = this.next();
    const rhs = this.parseExpr(BP.LOGICAL);
    return {
      type: 'BinaryExpr',
      lhs,
      rhs,
      operator,
    } as BinaryExpr;
  }
  parsePrimary(){
    const name = this.next().char;
    return {
      type: 'Identifier',
      name,
    } as Identifier;
  }
  parseGroup(){
    this.expect(TokenKind.LEFT_PARENTHESIS);
    const expr = this.parseExpr(BP.DEFAULT_BP);
    this.expect(TokenKind.RIGHT_PARENTHESIS);
    return expr;
  }
  parseCall(
    lhs: Expr
  ){
    this.next();
    const args:Expr[] = [];
    while (this.hasToken() && this.peek().kind !== TokenKind.RIGHT_PARENTHESIS) {
      const expr = this.parseExpr(BP.LOGICAL);
      args.push(expr);
      const nxt = this.peek();
      if (nxt.kind !== TokenKind.EOF && nxt.kind !== TokenKind.RIGHT_PARENTHESIS) {
        this.expect(TokenKind.COMMA);
      }
    }
    this.expect(TokenKind.RIGHT_PARENTHESIS);
    return {
      type: 'FnCall',
      name: lhs,
      args,
    } as FnCall;
  }
  expect(kind: TokenKind, err?: string) {
    const token = this.peek();
    if (token.kind !== kind) {
      if (err) {
        throw new Error(err);
      }
      throw new Error(`Expcetion ${TokenKind[kind]} but find ${TokenKind[token.kind]}`);
    }
    return this.next();
  }
  hasToken(){
    return this.pos < this.tokens.length && this.tokens[this.pos].kind !== TokenKind.EOF;
  }
  peek(){
    return this.tokens[this.pos];
  }
  next(){
    const token = this.peek();
    this.pos+=1;
    return token;
  }
  nud(kind: TokenKind, f: NudHandle){
    this.bpMap.set(kind, BP.PRIMARY);
    this.nudMap.set(kind, f);
  }
  led(bp: BP, kind: TokenKind, f: LedHandle) {
    this.bpMap.set(kind, bp);
    this.ledMap.set(kind, f);
  }
  setup(){
    this.led(BP.LOGICAL,    TokenKind.AND,              this.parseBinary.bind(this) );
    this.led(BP.LOGICAL,    TokenKind.OR,               this.parseBinary.bind(this) );
    this.led(BP.CALL,       TokenKind.LEFT_PARENTHESIS, this.parseCall.bind(this)   );

    this.nud(TokenKind.NOT,              this.parsePrefix.bind(this) );
    this.nud(TokenKind.IDENTIFIER,       this.parsePrimary.bind(this) );
    this.nud(TokenKind.LEFT_PARENTHESIS, this.parseGroup.bind(this)  );
  }
}

type LedHandle = (lhs: Expr, bp:BP) => Node;
type NudHandle = () => Node;
