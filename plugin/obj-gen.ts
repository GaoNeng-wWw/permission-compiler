import { BinaryExpr, Expr, FnCall, Identifier, Node, PrefixExpr } from "./permission-parser";
import { And, Every, Has, Not, Or, PermissionExpr, Some } from '../src/directive/v-permission';
import { TokenKind } from "./permission-lexer";

const builtInFnName = ['has','some','every'];
const startWithSearch = (name: string) => {
  return builtInFnName.filter(item => item.startsWith(name.toLowerCase()))
}
const isPrefix = (node:Node) => node.type === 'PrefixExpr';
const isIdentifier = (node:Node) => node.type === 'Identifier';
const isFunctionCall = (node:Node) => node.type === 'FnCall';
const isBinaryExpr = (node:Node) => node.type === 'BinaryExpr';
const unwrapIdentifier = (node:Identifier) => node.name;
const isBuiltInFn = (name: string) => builtInFnName.includes(name.toLocaleLowerCase());

export const functionCallGen = (expr: FnCall) => {
  const {name,args} = expr;
  if (!isIdentifier(name)) {
    throw new Error(`Expect Identifier but found ${name.type ? name.type : typeof(name)}`);
  }
  const rawFnName = unwrapIdentifier(name);
  if (!isBuiltInFn(rawFnName)){
    const fuzzItem = startWithSearch(rawFnName)[0];
    if (fuzzItem) {
      throw new Error(`${rawFnName} not found, did you want use ${fuzzItem}?`);
    }
    throw new Error(`${rawFnName} not implment yet`);
  }
  if (rawFnName.toLowerCase() === 'has' && args.length > 1){
    throw new Error(`Except 1 argument but recvice ${args.length}`);
  }
  if (args.some(arg=>arg.type === 'FnCall')) {
    throw new Error(`Argument only can be identifier, binary express or prefix express`);
  }
  const fnName = rawFnName.toUpperCase() as 'HAS' | 'EVERY' | 'SOME';
  const argValue = args.filter((arg) => arg.type === 'Identifier')
  .map((id) => id.name);
  if (fnName === 'HAS'){
    return {
      type: 'HAS',
      val: argValue[0]
    } as Has;
  }
  return {
    type: fnName,
    val: argValue
  } as Some | Every;
}
export const prefixGen = (expr: PrefixExpr) => {
  if (expr.operator.kind !== TokenKind.NOT) {
    throw new Error(`Unknown ${TokenKind[expr.operator.kind]}`);
  }
  return {
    type: 'NOT',
    expr: objectGenerate(expr.expr)
  } as Not
}
export const binaryExprGen = (expr: BinaryExpr) => {
  const {lhs,rhs,operator} = expr;
  if (operator.kind !== TokenKind.AND && operator.kind !== TokenKind.OR) {
    throw new Error('Operator only support && or ||, or you can use keywords `and` or `or`.');
  }
  return {
    lhs: objectGenerate(lhs),
    rhs: objectGenerate(rhs),
    type: TokenKind[operator.kind]
  } as And | Or
}
export const identifierGen = (expr: Identifier) => {
  return {
    type: 'HAS',
    val: expr.name
  } as Has
};
export const objectGenerate = (node: Node):PermissionExpr|null => {
  if (isIdentifier(node)) {
    return identifierGen(node);
  }
  if (isBinaryExpr(node)){
    return binaryExprGen(node);
  }
  if (isFunctionCall(node)){
    return functionCallGen(node);
  }
  if (isPrefix(node)) {
    return prefixGen(node);
  }
  return null;
}