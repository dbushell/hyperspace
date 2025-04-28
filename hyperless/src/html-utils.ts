import { Node } from "./html-node.ts";
import { inlineTags } from "./html-tags.ts";

/**
 * Merge adjacent text and inline Nodes into single text Node
 * @param node HTML Node
 */
export const mergeInlineNodes = (node: Node): void => {
  for (const child of [...node.children]) {
    if (child.type === "OPAQUE") {
      continue;
    }
    // Recursively merge sub-tree first
    mergeInlineNodes(child);
    // Merge this text node into the previous text node
    if (child.type === "TEXT" && child.previous?.type === "TEXT") {
      child.previous.raw += child.toString();
      child.detach();
      continue;
    }
    if (inlineTags.has(child.tag)) {
      // Merge this inline node into previous text node
      if (child.previous?.type === "TEXT") {
        child.previous.raw += child.toString();
        child.detach();
        continue;
      }
      // Convert this inline node to text node
      child.replace(new Node(null, "TEXT", child.toString()));
      continue;
    }
  }
};
