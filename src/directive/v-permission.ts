import {watch, type Directive} from 'vue';
import { useAccount } from '../mock-store';

const judge = (expr: PermissionExpr, userPermission: string[]):boolean => {
  if (expr.type === 'Has') {
    return userPermission.includes(expr.val);
  }
  if (expr.type == 'Some') {
    return userPermission.some(p => expr.val.includes(p));
  }
  if (expr.type === 'Every') {
    return userPermission.every(p => expr.val.includes(p));
  }
  if (expr.type === 'AND'){
    return judge(expr.lhs, userPermission) && judge(expr.rhs, userPermission);
  }
  if (expr.type === 'OR') {
    return judge(expr.lhs, userPermission) || judge(expr.rhs, userPermission);
  }
  if (expr.type === 'Not'){
    return judge(expr.expr, userPermission);
  }
  return false;
}

export type PermissionExpr = Has | Some | Every | And | Or | Not;

export type Has = {
  val: string;
  type: 'Has';
};
export type Some = {
  val: string[];
  type: 'Some';
};
export type Every = {
  val: string[];
  type: 'Every';
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
  type: 'Not';
  expr: PermissionExpr;
}


const isValid = (value: string | PermissionExpr) => {
  const { permissions } = useAccount();
  if (typeof value === 'string') {
    return permissions.value.includes(value);
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
