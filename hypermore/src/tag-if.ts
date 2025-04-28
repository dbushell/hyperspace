import type { Environment, HyperTag } from "./types.ts";
import { addVars } from "./environment.ts";
import { Node } from "./parse.ts";

const tagName = "ssr-if";

const match = (node: string | Node): boolean =>
  (typeof node === "string" ? node : node.tag) === tagName;

const validate = (node: Node): boolean => {
  if (node.size === 0) {
    console.warn(`<ssr-if> with no statement`);
    return false;
  }
  if (node.attributes.has("condition") === false) {
    console.warn(`<ssr-if> missing "condition" property`);
    return false;
  }
  return true;
};

const render = async (node: Node, env: Environment): Promise<void> => {
  // First <ssr-if> condition
  const expression = node.attributes.get("condition")!;

  // List of conditions to check in order
  const conditions = [{ expression, statement: new Node(null, "INVISIBLE") }];

  // Iterate over <ssr-if> child nodes
  // <ssr-else> and <ssr-elseif> are added as new conditions
  // All other nodes are appended to the last condition
  for (const child of [...node.children]) {
    if (child.tag === "ssr-else") {
      conditions.push({
        expression: "true",
        statement: new Node(null, "INVISIBLE"),
      });
      continue;
    }
    if (child.tag === "ssr-elseif") {
      let expression = child.attributes.get("condition");
      if (expression === undefined) {
        console.warn(`<ssr-elseif> with invalid condition`);
        expression = "false";
      }
      conditions.push({
        expression,
        statement: new Node(null, "INVISIBLE"),
      });
      continue;
    }
    // Append to last condition
    conditions.at(-1)?.statement.append(child);
  }

  // Add callbacks to render statements
  for (let i = 0; i < conditions.length; i++) {
    const { expression, statement } = conditions[i];
    env.code += `const __S${i} = () => {\n`;
    await env.ctx.renderChildren(statement, env);
    env.code += `}\n`;
    addVars({ [`__C${i}`]: `{{${expression}}}` }, [], env, true);
  }

  for (let i = 0; i < conditions.length; i++) {
    // Alternate conditions
    if (i === 0) {
      env.code += `if (__C${i}) {\n`;
    } else if (i < conditions.length - 1) {
      env.code += `} else if (__C${i}) {\n`;
    } else {
      env.code += `} else {\n`;
    }
    env.code += `__S${i}();\n`;
  }
  // Close final statement
  env.code += "}\n";
};

const Tag: HyperTag = {
  tagName,
  match,
  render,
  validate,
};

export default Tag;
