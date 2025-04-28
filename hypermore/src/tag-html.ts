import type { Environment, HyperTag, Node } from "./types.ts";

const tagName = "ssr-html";

const match = (node: string | Node): boolean =>
  (typeof node === "string" ? node : node.tag) === tagName;

const validate = (node: Node): boolean => {
  if (node.size === 0) {
    console.warn(`<ssr-html> with no content`);
    return false;
  }
  return true;
};

const render = async (node: Node, env: Environment): Promise<void> => {
  // Disable auto escape and re-renable to previous state later
  const autoEscape = env.ctx.autoEscape;
  env.ctx.autoEscape = false;
  await env.ctx.renderChildren(node, env);
  env.ctx.autoEscape = autoEscape;
};

const Tag: HyperTag = {
  tagName,
  match,
  render,
  validate,
};

export default Tag;
