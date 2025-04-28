import type { Environment, HyperTag } from "./types.ts";
import { Node } from "./parse.ts";

const tagName = "ssr-portal";

const match = (node: string | Node): boolean =>
  (typeof node === "string" ? node : node.tag) === tagName;

const validate = (node: Node, env: Environment): boolean => {
  const name = node.attributes.get("name");
  if (name === undefined) {
    console.warn(`<ssr-portal> missing "name" property`);
    return false;
  }
  // Fragments may appear before or after this portal in the node tree
  // A temporary comment is replaced later with extracted fragments
  // Random UUID is used to avoid authored comment conflicts
  const comment = `<!--${crypto.randomUUID()}-->`;
  node.append(new Node(node, "COMMENT", comment));
  env.portals.set(name, comment);
  return true;
};

const render = async (node: Node, env: Environment): Promise<void> => {
  await env.ctx.renderChildren(node, env);
};

const Tag: HyperTag = {
  tagName,
  match,
  render,
  validate,
};

export default Tag;
