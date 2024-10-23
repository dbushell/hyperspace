const entities = new Map([
  ["&", "&amp;"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ['"', "&quot;"],
  ["'", "&#39;"],
]);

const encodes = new Map(Array.from(entities, ([k, v]) => [v, k]));

const entityKeys = new RegExp([...entities.keys()].join("|"), "g");

const encodedKeys = new RegExp([...encodes.keys()].join("|"), "g");

/** Escape HTML entities */
export const escape = (str: string): string =>
  str.replaceAll(entityKeys, (k) => entities.get(k)!);

/** Unescape HTML entities */
export const unescape = (str: string): string =>
  str.replaceAll(encodedKeys, (k) => encodes.get(k)!);
