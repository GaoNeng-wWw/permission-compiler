import {type Directive} from 'vue';
import { useAccount } from '../mock-store';
import {rules, tokenizer} from '../../plugin/permission-lexer';
import {Parser} from '../../plugin/permission-parser';
import { objectGenerate } from '../../plugin/ir';

const judge = (expr: PermissionExpr, userPermission: string[]):boolean => {
  if (expr.type === 'HAS') {
    return userPermission.includes(expr.val);
  }
  if (expr.type == 'SOME') {
    return userPermission.some(p => expr.val.includes(p));
  }
  if (expr.type === 'EVERY') {
    return userPermission.every(p => expr.val.includes(p));
  }
  if (expr.type === 'AND'){
    return judge(expr.lhs, userPermission) && judge(expr.rhs, userPermission);
  }
  if (expr.type === 'OR') {
    return judge(expr.lhs, userPermission) || judge(expr.rhs, userPermission);
  }
  if (expr.type === 'NOT'){
    return !judge(expr.expr, userPermission);
  }
  return false;
}

export type PermissionExpr = Has | Some | Every | And | Or | Not;

export type Has = {
  val: string;
  type: 'HAS';
};
export type Some = {
  val: string[];
  type: 'SOME';
};
export type Every = {
  val: string[];
  type: 'EVERY';
};
export type And = {
  lhs: PermissionExpr;
  type: 'AND'
  rhs: PermissionExpr;
};
export type Or = {
  lhs: PermissionExpr;
  type: 'OR',
  rhs: PermissionExpr;
}
export type Not = {
  type: 'NOT';
  expr: PermissionExpr;
}


const isValid = (value: string | PermissionExpr) => {
  const { permissions } = useAccount();
  if (typeof value === 'string') {
    const tokens = tokenizer(value, rules);
    const parser = new Parser(tokens);
    const ast = parser.run();
    const expr = objectGenerate(ast);
    if (!expr){
      throw new Error('Unknown error');
    }
    console.log(expr);
    return judge(expr, permissions.value);
  } else {
    return judge(value, permissions.value)
  }
}

export default {
  created: (el: Element, binding)=>{
    if (!isValid(binding.value)){
      el.innerHTML = '<!-- -->'
    }
  },
} as Directive<Element, string | PermissionExpr>;
