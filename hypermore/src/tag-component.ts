import type { Environment, HyperTag } from "./types.ts";
import { Node } from "./parse.ts";

/** Cache of cloned templates */
const components = new WeakSet<Node>();

const componentTypes = new Set(["ELEMENT", "VOID"]);

const match = (node: string | Node): boolean => {
  if (node instanceof Node) {
    if (componentTypes.has(node.type) === false) {
      return false;
    }
  }
  const tagName = typeof node === "string" ? node : node.tag;
  // Disallow reserved prefix
  if (tagName.startsWith("ssr-")) return false;
  // Match custom element naming pattern
  return /([a-z][\w]*-[\w]+)/.test(tagName);
};

// Already cloned, or template exists for tag name
const validate = (node: Node, env: Environment): boolean =>
  components.has(node) || env.ctx.hasTemplate(node.tag);

const render = async (node: Node, env: Environment): Promise<void> => {
  // Ignore custom elements with no template
  if (validate(node, env) === false) {
    await env.ctx.renderParent(node, env);
    return;
  }
  // Ignore elements within <ssr-html> block
  const parent = node.closest((n) => n.tag === "ssr-html");
  if (parent) {
    await env.ctx.renderParent(node, env);
    return;
  }

  // Clone the component
  const template = env.ctx.cloneTemplate(node.tag, env)!;
  template.type = "INVISIBLE";
  components.add(template);

  const slots = new Map<string, Node>();
  const targets = new Map<Node, string>();
  const fragments = new Set<Node>();
  const cleared = new Set<Node>();

  // Find all slots in component template
  template.traverse((n) => {
    if (n.tag !== "ssr-slot") return;
    const name = n.attributes.get("name");
    slots.set(name ?? "default", n);
  });

  // Avoid infinite loops
  const nested = new Set<Node>();
  template.traverse((n) => {
    if (n.tag === "ssr-if" || n.tag === "ssr-for") return false;
    if (n.tag === node.tag) nested.add(n);
  });
  if (nested.size) {
    nested.forEach((n) => n.detach());
    console.warn(`<${node.tag}> infinite nested loop`);
  }

  // Find fragments and assign their children to slot
  node.traverse((n) => {
    if (match(n)) return false;
    if (n.tag !== "ssr-fragment") return;
    fragments.add(n);
    const slot = n.attributes.get("slot")!;
    if (slot) n.children.forEach((c) => targets.set(c, slot));
  });

  // Assign top-level childen to default slot
  if (node.size && slots.has("default")) {
    node.children.forEach((n) => {
      if (n.tag === "ssr-fragment") return;
      targets.set(n, "default");
    });
  }

  // Assign target nodes to their slots
  for (const [target, name] of targets.entries()) {
    const slot = slots.get(name);
    if (slot === undefined) continue;
    // Clear fallback content
    if (cleared.has(slot) === false) {
      cleared.add(slot);
      slot.clear();
    }
    slot.append(target);
  }

  // Find component script
  let script: Node | undefined;
  for (const child of template.children) {
    if (child.tag !== "script") continue;
    if (child.attributes.get("context") !== "component") continue;
    script = child;
    break;
  }
  let code = "";
  if (script) {
    script.detach();
    code = script.at(0)!.raw;
  }

  const props = Object.fromEntries(node.attributes);

  await env.ctx.renderNode(template, env, props, code);
};

const Tag: HyperTag = {
  tagName: "ssr-component",
  match,
  render,
  validate,
};

export default Tag;
