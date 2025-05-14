import { ExpressionNode, Node, NodeTypes, ParentNode, RootNode, TemplateChildNode } from "@vue/compiler-core";
import { parse } from "@vue/compiler-sfc";

type SFCOpts = {
  code: string;
  id: string;
}
export const useSFC = (
  opts: SFCOpts
) => {
  const {descriptor,errors} = parse(opts.code, {filename: opts.id, });
  return {errors,...descriptor};
}

type WalkSFCHook = {
  enter?: (node: Node) => void;
  leave?: (node: Node) => void;
}

const walkChildren = (
  children: TemplateChildNode[],
  hook: WalkSFCHook
) => {
  children.forEach((child) => {
    hook.enter?.(child);
    walkSFC(child, hook);
    hook.leave?.(child);
  })
}

export const walkSFC = (
  node: RootNode | TemplateChildNode,
  hook: WalkSFCHook
) => {
  hook.enter?.(node);
  switch (node.type) {
    case NodeTypes.COMMENT:
      break;
    case NodeTypes.IF:
      node.branches.forEach((branch) => {
        walkSFC(branch, hook);
      })
      break;
    case NodeTypes.IF_BRANCH:
    case NodeTypes.FOR:
    case NodeTypes.ELEMENT:
    case NodeTypes.ROOT:
      node.children.forEach((child) => {
        walkSFC(child, hook);
      })
      break;
  }
  hook.leave?.(node);
}