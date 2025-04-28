import type { RouteModule } from "./types.ts";
import type { Node } from "@dbushell/hyperless";
import { parseHTML } from "@dbushell/hypermore";

/**
 * Execute code and return module exports
 * @param code JavaScript
 * @returns Module exports
 */
export const importModule = async <T>(
  code: string,
  type = "text/typescript",
): Promise<T> => {
  const blob = new Blob([code], { type });
  const url = URL.createObjectURL(blob);
  const mod = await import(url);
  URL.revokeObjectURL(url);
  return mod as T;
};

/**
 * Import the module script from a route template
 * @param html Route template
 * @returns Route module
 */
export const importRoute = async (
  html: string,
): Promise<[string, RouteModule]> => {
  const root = parseHTML(html);
  let script: Node | undefined;
  // Find the first top-level <script context="module">
  for (const node of root.children) {
    if (node.tag !== "script") continue;
    if (node.attributes.get("context") !== "module") continue;
    script = node;
    break;
  }
  // Return default if not found
  if (script === undefined) {
    return [html, {}];
  }
  // Extract script
  script.detach();
  const code = script.at(0)!.raw;
  // Import module and remove invalid exports
  const mod = {
    ...(await importModule<RouteModule>(code)),
  };
  if (typeof mod.pattern !== "string") {
    delete mod.pattern;
  }
  if (typeof mod.load !== "function") {
    delete mod.load;
  }
  return [root.toString(), mod];
};
