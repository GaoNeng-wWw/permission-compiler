import type { BaseElementNode, DirectiveNode, SimpleExpressionNode } from "@vue/compiler-core";
import { NodeTypes } from '@vue/compiler-core';
import { useSFC, walkSFC } from "./utils";
import { rules, tokenizer } from "./permission-lexer";
import { Parser } from "./permission-parser";

const parseStaticPermission = (
  _ast: SimpleExpressionNode
) => {
  const ast = _ast.ast;
  if (!ast){
    return ;
  }
  let text = '';
  if(ast.type === 'StringLiteral'){
    text = ast.value;
  }
  if (ast.type === 'TemplateLiteral') {
    throw new Error('Not implment Template parse yet.');
  }
  const tokens = tokenizer('Has(hello)', rules);
  const parser = new Parser(tokens);
  console.log(parser.run())
  return;
}

export default (
  code: string, id:string
)=>{
  if (!id.endsWith('.vue')){
    return code;
  }
  const {script:scriptOption,template, scriptSetup} = useSFC({code,id});
  const elements:BaseElementNode[] = [];
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
  for (const directive of directives) {
    if (!directive.exp){
      continue;
    }
    if (directive.exp.type !== NodeTypes.SIMPLE_EXPRESSION){
      continue;
    }
    parseStaticPermission(directive.exp);
  }
  return code;
}