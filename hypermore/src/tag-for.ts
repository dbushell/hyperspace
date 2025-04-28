import type { Environment, HyperTag, Node } from "./types.ts";
import { addVars } from "./environment.ts";
import { isVariable } from "./utils.ts";

const tagName = "ssr-for";

const match = (node: string | Node): boolean =>
  (typeof node === "string" ? node : node.tag) === tagName;

const validate = (node: Node): boolean => {
  if (node.size === 0) {
    console.warn(`<ssr-for> with no statement`);
    return false;
  }
  if (node.attributes.has("of") === false) {
    console.warn(`<ssr-for> missing "of" property`);
    return false;
  }
  const itemProp = node.attributes.get("item");
  if (itemProp === undefined || isVariable(itemProp) === false) {
    console.warn(`<ssr-for> invalid "item" property`);
    return false;
  }
  const indexProp = node.attributes.get("index");
  if (indexProp && isVariable(indexProp) === false) {
    console.warn(`<ssr-for> invalid "index" property`);
    return false;
  }
  return true;
};

const render = async (node: Node, env: Environment): Promise<void> => {
  const item = node.attributes.get("item")!;
  const index = node.attributes.get("index");
  const expression = node.attributes.get("of")!;
  // Stack items prop
  const forProps = { __ITEMS: `{{${expression}}}` };
  addVars(forProps, env.localProps, env);
  env.localProps.push(forProps);
  env.code +=
    `for (const [__INDEX, __ITEM] of [...__FOR_ITEMS(__ITEMS)].entries()) {\n`;
  // Stack item prop
  const itemProps = { [item]: "{{__ITEM}}" };
  if (index) itemProps[index] = "{{__INDEX}}";
  const updatedProps = addVars(itemProps, env.localProps, env);
  env.localProps.push(itemProps);
  // Render children
  env.uuid = "__INDEX";
  for (const child of node.children) {
    await env.ctx.renderNode(child, env);
  }
  env.uuid = undefined;
  env.code += `}\n`;
  // Reset props stack
  addVars(updatedProps, env.localProps, env);
  env.localProps.pop();
  env.localProps.pop();
};

const Tag: HyperTag = {
  tagName,
  match,
  render,
  validate,
};

export default Tag;
