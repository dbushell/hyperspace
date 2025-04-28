import type { Environment, HyperTag } from "./types.ts";
import { Node } from "./parse.ts";

const tagName = "ssr-element";

const match = (node: string | Node): boolean =>
  (typeof node === "string" ? node : node.tag) === tagName;

const validate = (node: Node): boolean => {
  if (node.attributes.has("tag") === false) {
    console.warn(`<ssr-element> missing "tag" property`);
    return false;
  }
  return true;
};

const render = async (node: Node, env: Environment): Promise<void> => {
  // Create new node from tag attribute
  const tag = node.attributes.get("tag")!;
  const raw = node.raw.replace("<ssr-element", `<${tag}`);
  const newNode = new Node(null, "ELEMENT", raw, tag, node.attributes);
  newNode.attributes.delete("tag");
  // Move children to new node
  for (const child of [...node.children]) {
    newNode.append(child);
  }
  await env.ctx.renderNode(newNode, env);
};

const Tag: HyperTag = {
  tagName,
  match,
  render,
  validate,
};

export default Tag;
