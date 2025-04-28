/**
 * ASCII whitespace as defined by the HTML spec
 * {@link https://infra.spec.whatwg.org/#ascii-whitespace}
 */
export const ASCII_WHITESPACE = new Set([
  "\t", // U+0009 TAB
  "\n", // U+000A LF (Line Feed)
  "\f", // U+000C FF (Form Feed)
  "\r", // U+000D CR (Carriage Return)
  " ", // U+0020 SPACE
]);

/**
 * C0 - U+0000 - U+001F (inclusive)
 * {@link https://infra.spec.whatwg.org/#c0-control}
 */
export const C0: Set<string> = new Set();
for (let i = 0; i <= 0x1f; i++) {
  C0.add(String.fromCharCode(i));
}

/**
 * Control characters: C0 + U+007F - U+009F (inclusive)
 * {@link https://infra.spec.whatwg.org/#control}
 */
export const CONTROLS = new Set(C0);
for (let i = 0x7f; i <= 0x9f; i++) {
  CONTROLS.add(String.fromCharCode(i));
}

/**
 * Attribute names must exclude these characters
 * {@link https://html.spec.whatwg.org/multipage/syntax.html#attributes-2}
 */
export const INVALID_ATTRIBUTE_NAME = new Set(CONTROLS);
[
  '"', // U+0022 Quotation Mark
  "'", // U+0027 Apostrophe
  "=", // U+003D Equals Sign
  ">", // U+003C Less-Than Sign
  "<", // U+003E Greater-Than Sign
  "/", // U+002F Solidus
].forEach((char) => INVALID_ATTRIBUTE_NAME.add(char));

/**
 * Unquoted attribute values must exclude these characters
 * {@link https://html.spec.whatwg.org/multipage/syntax.html#attributes-2}
 */
export const INVALID_ATTRIBUTE_VALUE = new Set(INVALID_ATTRIBUTE_NAME);
[
  "`", // U+0060 Grave Accent
].forEach((char) => INVALID_ATTRIBUTE_VALUE.add(char));
