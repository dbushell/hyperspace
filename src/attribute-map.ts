import { escape, unescape } from "./utils.ts";

/**
 * HTML attributes map
 * Keys are case-insensitive
 * HTML entities are automatically encoded
 */
export class AttributeMap extends Map<string, string> {
  constructor(
    iterable?: Iterable<readonly [string, string]> | null | undefined,
  ) {
    super(
      iterable instanceof AttributeMap
        ? Array.from(iterable, ([k, v]) => [k, escape(v)])
        : iterable,
    );
  }
  override [Symbol.iterator](): MapIterator<[string, string]> {
    return this.entries();
  }
  override set(key: string, value: string): this {
    value = escape(unescape(value));
    return super.set(key.toLowerCase(), value);
  }
  override get(key: string, decode = true): string | undefined {
    const value = super.get(key.toLowerCase());
    if (value === undefined) return value;
    return decode ? unescape(value) : value;
  }
  override has(key: string): boolean {
    return super.has(key.toLowerCase());
  }
  override delete(key: string): boolean {
    return super.delete(key.toLowerCase());
  }
  override entries(decode = true): MapIterator<[string, string]> {
    const entries = super.entries();
    return (function* () {
      for (const [k, v] of entries) yield [k, decode ? unescape(v) : v];
      return undefined;
    })();
  }
  override values(decode = true): MapIterator<string> {
    const values = super.values();
    return (function* () {
      for (const v of values) yield decode ? unescape(v) : v;
      return undefined;
    })();
  }
  override forEach(
    callbackfn: (value: string, key: string, map: Map<string, string>) => void,
    thisArg?: unknown,
  ): void {
    super.forEach((value, key, map) =>
      callbackfn.call(thisArg, unescape(value), key, map)
    );
  }
  override toString(): string {
    const entries = Array.from(super.entries());
    const attr = entries.map(([k, v]) =>
      v === "" ? k : v.indexOf('"') === -1 ? `${k}="${v}"` : `${k}='${v}'`
    );
    return attr.join(" ");
  }
}
