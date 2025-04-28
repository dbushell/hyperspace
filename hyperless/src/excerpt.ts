import { stripTags } from "./striptags.ts";

/**
 * Generate a text excerpt from HTML content.
 *
 * Output is context aware trimmed to the nearest sentence, or word, to fit the maximum length as close as possible.
 *
 * @param html           Original HTML content
 * @param maxLength      Desired excerpt length
 * @param trunateSuffix  Text appended to excerpt
 * @param endChars       End of sentence characters
 * @returns Text excerpt
 */
export const excerpt = (
  html: string,
  maxLength = 300,
  trunateSuffix = "[…]",
  endChars = [".", "!", "?"],
): string => {
  // Remove HTML
  const text = stripTags(html);
  // Output is too short
  if (text.length < maxLength) {
    return text;
  }
  // Look for end of sentence near to desired length
  const offsets = endChars
    .map((char) => text.substring(0, maxLength).lastIndexOf(char))
    .sort((a, b) => a - b);
  if (offsets.at(-1)) {
    const excerpt = text.substring(0, offsets.at(-1)! + 1);
    // Ensure excerpt is not too short
    if (maxLength - excerpt.length < maxLength * 0.2) {
      return (excerpt + " " + trunateSuffix).trim();
    }
  }
  // Fallback to using words
  let excerpt = "";
  const words = text.split(/\s+/);
  while (words.length) {
    // Concatenate words until maximum length is reached
    const word = words.shift()!;
    if (excerpt.length + word.length > maxLength) {
      break;
    }
    excerpt += word + " ";
  }
  return (excerpt + trunateSuffix).trim();
};
