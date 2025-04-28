/** Returns true if name is valid variable */
export const isVariable = (name: string): boolean => {
  return /^[a-zA-Z_$]\w*$/.test(name);
};

/** Return custom element name from path */
export const componentName = (path: string | URL): string => {
  let name = path.toString();
  name = name.split("/").at(-1) ?? name;
  name = name.split(".", 1)[0];
  name = name.replace(/[^\w:-]/g, "");
  return toKebabCase(name);
};

/** Escape characters for Javascript string template */
export const escapeChars = (str: string, chars = ["`", "${"]): string => {
  str = str.replace(/\\/g, "\\\\");
  for (const c of chars) str = str.replaceAll(c, "\\" + c);
  return str;
};

/** Replacement character for text nodes */
export const spaceChar = (str: string, inline = false) => {
  return inline ? " " : str.indexOf("\n") > -1 ? "\n" : " ";
};

/**
 * @std/text - https://jsr.io/@std/text
 * Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
 */
const CAPITALIZED_WORD_REGEXP = /\p{Lu}\p{Ll}+/u;
const ACRONYM_REGEXP = /\p{Lu}+(?=(\p{Lu}\p{Ll})|\P{L}|\b)/u;
const LOWERCASED_WORD_REGEXP = /(\p{Ll}+)/u;
const ANY_LETTERS = /\p{L}+/u;
const DIGITS_REGEXP = /\p{N}+/u;

const WORD_OR_NUMBER_REGEXP = new RegExp(
  `${CAPITALIZED_WORD_REGEXP.source}|${ACRONYM_REGEXP.source}|${LOWERCASED_WORD_REGEXP.source}|${ANY_LETTERS.source}|${DIGITS_REGEXP.source}`,
  "gu",
);

export function splitToWords(input: string) {
  return input.match(WORD_OR_NUMBER_REGEXP) ?? [];
}

export function capitalizeWord(word: string): string {
  return word
    ? word?.[0]?.toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
    : word;
}

export function toKebabCase(input: string): string {
  input = input.trim();
  return splitToWords(input).join("-").toLocaleLowerCase();
}

export function toCamelCase(input: string): string {
  input = input.trim();
  const [first = "", ...rest] = splitToWords(input);
  return [first.toLocaleLowerCase(), ...rest.map(capitalizeWord)].join("");
}
