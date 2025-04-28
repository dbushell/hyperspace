import type { Environment, HyperTag } from "./types.ts";
import type { Hypermore } from "./mod.ts";
import { Node } from "./parse.ts";
import { escapeChars } from "./utils.ts";

const tagName = "ssr-cache";

const cacheMap = new WeakMap<Hypermore, Map<string, string>>();

/** Return map linked to context (create new if needed) */
export const getCacheMap = (ctx: Hypermore): Map<string, string> => {
  if (cacheMap.has(ctx)) return cacheMap.get(ctx)!;
  const map = new Map<string, string>();
  cacheMap.set(ctx, map);
  return map;
};

const match = (node: string | Node): boolean =>
  (typeof node === "string" ? node : node.tag) === tagName;

const validate = (node: Node, env: Environment): boolean => {
  const name = node.attributes.get("name");
  if (name === undefined) {
    console.warn(`<ssr-cache> missing "name" property`);
    return false;
  }
  const map = getCacheMap(env.ctx);
  if (map.has(name) === false && node.size === 0) {
    console.warn(`<ssr-cache> with no content`);
    return false;
  }
  return true;
};

const render = async (node: Node, env: Environment): Promise<void> => {
  const name = node.attributes.get("name")!;
  // Return cached HTML
  const map = getCacheMap(env.ctx);
  if (map.has(name)) {
    env.code += `__EXPORT += \`${escapeChars(map.get(name)!)}\`;\n`;
    return;
  }
  // Flag element to be cached after final render
  const id = crypto.randomUUID();
  env.caches.set(name, id);
  node.insertAt(new Node(null, "COMMENT", `<!--[${id}]-->`), 0);
  node.append(new Node(null, "COMMENT", `<!--[${id}]-->`));
  await env.ctx.renderChildren(node, env);
};

const Tag: HyperTag = {
  tagName,
  match,
  render,
  validate,
};

export default Tag;
