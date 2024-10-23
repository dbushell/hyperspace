import { Node } from "./html-node.ts";
import { parseHTML } from "./html-parser.ts";
import { inlineTags } from "./html-tags.ts";

/** Elements to wrap in quotation marks */
const quoteTags = new Set(["blockquote", "q"]);

/** Bespoke list of elements to remove with their content */
const removeTags = new Set([
  "audio",
  "canvas",
  "figure",
  "form",
  "iframe",
  "object",
  "picture",
  "pre",
  "script",
  "style",
  "svg",
  "template",
  "textarea",
  "table",
  "video",
]);

/**
 * Remove HTML and return text content with a few niceties.
 *
 * Text in `<blockquote>` and `<q>` are wrapped in quotation marks.
 *
 * @param html  Original HTML content (or parsed Node)
 * @param style Starting quotation style
 * @returns Text with HTML removed
 */
export const stripTags = (
  node: string | Node,
  style = 0,
  trim = true,
): string => {
  // Parse HTML and loop back
  if (typeof node === "string") {
    return stripTags(parseHTML(node), style, trim);
  }
  // Return text
  if (node.type === "TEXT") {
    return node.raw;
  }
  // Empty these tags
  if (removeTags.has(node.tag)) {
    return " ";
  }
  // Wrap quote in alternating typographic style
  if (quoteTags.has(node.tag)) {
    const empty = new Node(null, "ROOT");
    empty.append(...node.children);
    const quotes = style % 2 ? "‘’" : "“”";
    return quotes[0] + stripTags(empty, style + 1, true) + quotes[1];
  }
  // Render children
  let out = "";
  for (const child of node.children) {
    out += stripTags(child, style, false);
  }
  // Ensure space between blocks
  if (inlineTags.has(node.tag) === false) out += " ";
  // Remove excess whitespace
  if (trim) return out.replace(/\s+/g, " ").trim();
  return out;
};
