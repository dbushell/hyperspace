import { normalizeWords } from "../src/normalize.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("paragraph", () => {
  const html = `"Ceci n’est pas uñe\npàrâgrǽphę (I've ﬄ) 🫠 CECI."`;
  const words = normalizeWords(html, true);
  assertEquals(words.join(" "), "ceci nest pas une paragraephe ive ffl");
});
