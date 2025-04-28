import type { Environment, JSONObject, JSONValue } from "./types.ts";
import { escapeChars } from "./utils.ts";

export const envHeader = `
let __EXPORT = "";
const __LOCALS = new Map();
const __PORTALS = new Map();
const __FRAGMENTS = new Set();
const __ENTITIES = new Map([
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
]);
const __ENTITY_KEYS = new RegExp([...__ENTITIES.keys()].join("|"), "g");
const __ESC = (value, escape) => {
  if (escape === false) return value;
  return String(value).replaceAll(__ENTITY_KEYS, (k) => __ENTITIES.get(k));
};
const __ATTRIBUTES = (attr) => {
  const newAttr = [];
  attr.forEach((v, k) => {
    if (v === undefined || v === null) return;
    if (v === "") {
      newAttr.push(k);
    } else {
      v = __ESC(v, true);
      newAttr.push(v.indexOf('"') === -1 ? \`\${k}="\${v}"\` : \`\${k}='\${v}'\`);
    }
  });
  return newAttr.length ? " " + newAttr.join(" ") : "";
};
const __FOR_ITEMS = (items) => {
  // Convert string to numeric value
  if (typeof items === "string") {
    const parseItems = Number.parseInt(items);
    if (isNaN(parseItems) === false) {
      items = parseItems;
    }
  }
  // Convert number to array, e.g. "5" iterates [0,1,2,3,4]
  if (typeof items === "number") {
    return [...Array(items).keys()];
  }
  // Ensure items is iterable
  if (typeof items[Symbol.iterator] !== "function") {
    console.warn('<ssr-for> invalid "of" property (not iterable)');
    return [];
  }
  return items;
};
`;

export const envFooter = `
const __FRAGMENT_VALUES = [...__FRAGMENTS.values()];
for (const [name, comment] of __PORTALS) {
  __EXPORT = __EXPORT.replace(comment, () => {
    return __FRAGMENT_VALUES
      .map(({ html, portal }) => (portal === name ? html : ""))
      .join("");
  });
}
return __EXPORT;
`;

/** Execute code and return final string */
export const renderEnv = (env: Environment): Promise<string> => {
  const module = Function(`'use strict'; return async function() {
    try {
      ${env.code}
    } catch (err) {
      throw new Error(\`"\${err.message}"\`);
    }
  }`)();
  return module();
};

/** Parse text and replace `{{expression}}` with code */
export const parseVars = (text: string, escape = true): string => {
  let out = "";
  while (text.length) {
    // Search for next expression
    const next = text.indexOf("{{");
    // Append remaining text if not found
    if (next === -1) {
      out += text;
      break;
    }
    // Append and remove text before expression
    out += text.substring(0, next);
    text = text.substring(next);
    // Validate expression
    const match = text.match(/^{{([^{].*?)}}/s);
    if (match === null) {
      // Skip and continue searching
      out += "{";
      text = text.substring(1);
    } else {
      if (match[1].at(0) === "!") {
        // Ignore match if escape character was found
        out += "{{" + match[0].substring(3);
      } else {
        // Replace match with render function
        out += `\`+__ESC(${match[1]}, ${escape})+\``;
      }
      text = text.substring(match[0].length);
    }
  }
  return out;
};

/** Encode value for JavaScript string template */
export const encodeVars = (value: JSONValue, parse = false): string => {
  if (value === null) return "null";
  if (Array.isArray(value)) {
    return `[${value.map((v) => encodeVars(v, parse)).join(",")}]`;
  }
  switch (typeof value) {
    case "boolean":
    case "number":
      return `${value}`;
    case "string":
      value = `\`${escapeChars(value)}\``;
      if (parse) {
        value = parseVars(value, false);
        // Remove empty string at start and end of value
        if (value.startsWith("``+")) value = value.substring(3);
        if (value.endsWith("+``")) value = value.substring(0, value.length - 3);
      }
      return value;
    case "object": {
      return `{${
        Object.entries(value)
          .map(([k, v]) => `'${k}':${encodeVars(v, parse)}`)
          .join(",")
      }}`;
    }
  }
};

/** Add local props to JavaScript block */
export const addVars = (
  props: JSONObject,
  prevProps: Array<JSONObject> = [],
  env: Environment,
  parse = true,
): JSONObject => {
  let code = "";
  let codeHead = "";
  const updated: JSONObject = {};
  const isLocal = Object.hasOwn(props, "$local");
  const isGlobal = Object.hasOwn(props, "$global");
  for (const [key, value] of Object.entries(props)) {
    // Check stack for previous definition
    for (let i = prevProps.length - 1; i > -1; i--) {
      if (Object.keys(prevProps[i]).includes(key)) {
        if (Object.hasOwn(updated, key) === false) {
          updated[key] = prevProps[i][key];
          break;
        }
      }
    }
    if (key === "$localId") continue;

    // Encode and render output
    const valueEncode = encodeVars(value, parse);

    const prefix = Object.hasOwn(updated, key) ? "" : "let ";
    if (key === "$local") {
      if (typeof value === "object") {
        codeHead += `__LOCALS.set(\`${props.$localId}\`, ${valueEncode});\n`;
        codeHead += `${prefix}${key} = __LOCALS.get(\`${props.$localId}\`);\n`;
      } else {
        codeHead += `${prefix}${key} = __LOCALS.get(${valueEncode});\n`;
      }
    } else if (key === "$global") {
      codeHead += `${prefix}${key} = ${valueEncode};\n`;
    } else {
      if (isLocal) {
        code += `${prefix}${key} = $local['${key}'];\n`;
      } else if (isGlobal) {
        code += `${prefix}${key} = $global['${key}'];\n`;
      } else {
        code += `${prefix}${key} = ${valueEncode};\n`;
      }
    }
  }
  env.code += codeHead + code;
  return updated;
};
