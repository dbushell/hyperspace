/** Characters to remove entirely */
const blanks = new RegExp(
  "[" + ("’'"
    .split("")
    .map((c) => `\\u{${c.charCodeAt(0).toString(16)}}`)
    .join("")) +
    "]",
  "gu",
);

/** Characters to replace with single space */
const spaces = new RegExp(
  "[" + ('-–—_“”"!?¿¡…,.'
    .split("")
    .map((c) => `\\u{${c.charCodeAt(0).toString(16)}}`)
    .join("")) +
    "]",
  "gu",
);

/** Ligatures to expand into double letters */
const ligatureMap = new Map([
  ["ꜳ", "aa"],
  ["æ", "ae"],
  ["ǽ", "ae"],
  ["ꜵ", "ao"],
  ["ꜷ", "au"],
  ["ꜹ", "av"],
  ["ꜻ", "av"],
  ["ꜽ", "ay"],
  ["ȸ", "db"],
  ["ǳ", "dz"],
  ["ǆ", "dz"],
  ["ﬀ", "ff"],
  ["ﬃ", "ffi"],
  ["ﬄ", "ffl"],
  ["ﬁ", "fi"],
  ["ﬂ", "fl"],
  ["ƕ", "hv"],
  ["ĳ", "ij"],
  ["ǉ", "lj"],
  ["ʪ", "ls"],
  ["ʫ", "lz"],
  ["ǌ", "nj"],
  ["œ", "oe"],
  ["ꝏ", "oo"],
  ["ﬆ", "st"],
  ["ﬅ", "st"],
  ["ꜩ", "tz"],
  ["ꝡ", "vy"],
  ["ẞ", "ss"],
  ["ß", "ss"],
]);

const ligatures = new RegExp([...ligatureMap.keys()].join("|"), "g");

/**
 * Normalize a sentence into searchable keywords.
 *
 * Words are converted to lowercase ASCII with all punctuation removed.
 *
 * @param input
 * @returns Array of normalized words
 */
export const normalizeWords = (input: string, unique = false): string[] => {
  const words = input
    // Cleanup
    .toLowerCase()
    .replaceAll(blanks, "")
    .replaceAll(spaces, " ")
    .replace(ligatures, (m) => ligatureMap.get(m) ?? "")
    // Normalize unicode
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    // Remove empty and non-words
    .split(/\b/)
    .map((w) => w.trim())
    .filter((w) => /\w+/.test(w));
  if (unique) {
    return [...new Set(words)];
  }
  return words;
};
