import { type BaseElementNode, type DirectiveNode, type SimpleExpressionNode } from "@vue/compiler-core";
import { NodeTypes } from '@vue/compiler-core';
import { useSFC, walkSFC } from "./utils";
import { rules, tokenizer } from "./permission-lexer";
import { Parser } from "./permission-parser";
import { objectGenerate } from "./ir";

const parseStaticPermission = (
  _ast: SimpleExpressionNode
) => {
  const vueAST = _ast.ast;
  if (!vueAST){
    return ;
  }
  let text = '';
  if(vueAST.type === 'StringLiteral'){
    text = vueAST.value;
  }
  if (vueAST.type === 'TemplateLiteral') {
    throw new Error('Not implment Template parse yet.');
  }
  const tokens = tokenizer(text, rules);
  const parser = new Parser(tokens);
  const ast = parser.run();
  const expr = objectGenerate(ast);
  if (!expr) {
    throw new Error('Unknown Error');
  }
  return expr;
}

export default (
  code: string, id:string
)=>{
  const sfcAST = useSFC({code,id});
  const elements:BaseElementNode[] = [];
  const template = sfcAST.template;
  if (!template?.ast) {
    return code;
  }
  walkSFC(template.ast, {
    enter: (node) => {
      if (node.type === NodeTypes.ELEMENT ) {
        const _node:BaseElementNode = node as BaseElementNode;
        elements.push(_node);
      }
    }
  })
  if (!elements.length) {
    return code;
  }
  const directives:DirectiveNode[] = [];
  for (const ele of elements) {
    const props = ele.props;
    const allDirectives = props.filter(p => p.type === NodeTypes.DIRECTIVE);
    if (!allDirectives.length){
      continue;
    }
    directives.push(...allDirectives.filter(d => d.name === 'permission'))
  }
  if (!directives.length) {
    return code;
  }
  directives.sort((a,b) => b.loc.start.offset - a.loc.start.offset)
  for (const directive of directives) {
    if (!directive.exp || !directive.exp.ast){
      continue;
    }
    if (directive.exp.type !== NodeTypes.SIMPLE_EXPRESSION){
      continue;
    }
    if (directive.exp.ast.type !== 'StringLiteral') {
      continue;
    }
    const permissionExprAstIR = parseStaticPermission(directive.exp);
    if (!permissionExprAstIR){
      continue;
    }
    const l = directive.exp.loc.start.offset;
    const r = directive.exp.loc.end.offset;
    code = `${code.slice(0,l-1)}"${JSON.stringify(permissionExprAstIR).replaceAll('"',"'")}"${code.slice(r+1)}`
  }
  return code;
}