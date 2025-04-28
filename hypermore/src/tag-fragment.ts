import type { Environment, HyperTag, Node } from "./types.ts";

const tagName = "ssr-fragment";

const match = (node: string | Node): boolean =>
  (typeof node === "string" ? node : node.tag) === tagName;

const validate = (node: Node): boolean => {
  const slot = node.attributes.get("slot");
  const portal = node.attributes.get("portal");
  if (slot === undefined && portal === undefined) {
    console.warn(`<ssr-fragment> missing "slot" or "portal" property`);
    return false;
  }
  return true;
};

const render = async (node: Node, env: Environment): Promise<void> => {
  const portal = node.attributes.get("portal");
  if (portal === undefined) {
    console.warn(`<ssr-fragment> unknown`);
    return;
  }
  env.code += `const __TMP = __EXPORT;
__FRAGMENTS.add({portal: '${portal}', html: (() => {
let __EXPORT = '';\n`;
  await env.ctx.renderChildren(node, env);
  env.code += `return __EXPORT;
})()});
__EXPORT = __TMP;
`;
};

const Tag: HyperTag = {
  tagName,
  match,
  render,
  validate,
};

export default Tag;
