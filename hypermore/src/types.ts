import type { Node } from "./parse.ts";
import type { Hypermore } from "./mod.ts";

export type { Hypermore, Node };

/** Props value */
export type JSONValue =
  | boolean
  | number
  | null
  | string
  | JSONArray
  | JSONObject;

/** Props array */
export type JSONArray = Array<JSONValue>;

/** Props object */
export interface JSONObject {
  [key: string]: JSONValue;
}

/** Hypermore class configuration */
export type Options = {
  autoEscape?: boolean;
  globalProps?: JSONObject;
  templates?: Map<string, string>;
};

/** Hypermore enviroment object */
export type Environment = {
  /** Current instance */
  ctx: Hypermore;
  /** Current local props */
  localProps: Array<JSONObject>;
  /** Reference to current node rendering */
  node: Node | undefined;
  /** Discovered portal names and comment placeholders */
  portals: Map<string, string>;
  /** Cache name and IDs to render and store */
  caches: Map<string, string>;
  /** Compiled code to evaluate */
  code: string;
  /** Loop index */
  uuid?: string;
};

/** Hypermore HTML tag extension */
export type HyperTag = {
  /** Custom tag name */
  tagName: string;
  /** Node tag matches the custom tag name */
  match: (node: string | Node) => boolean;
  /** Node is a valid instance of the custom tag */
  validate: (node: Node, env: Environment) => boolean;
  /** Node to HTML string */
  render: (node: Node, env: Environment) => Promise<void>;
};
