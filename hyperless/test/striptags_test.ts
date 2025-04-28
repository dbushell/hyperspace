import { stripTags } from "../src/striptags.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("demo", () => {
  const html = "<p>Ceci n’est pas une paragraphe.</p>";
  const expected = "Ceci n’est pas une paragraphe.";
  const text = stripTags(html);
  assertEquals(text, expected);
});

Deno.test("basic", () => {
  const html =
    `<p><em>This</em> is <abbr="Hypertext Markup Language">HTML</abbr>.</p>
<p>End of content.</p>`;
  const expected = "This is HTML. End of content.";
  const text = stripTags(html);
  assertEquals(text, expected);
});

Deno.test("quotes", () => {
  const html = `<blockquote>
  <p><em>This</em> is <abbr="Hypertext Markup Language">HTML</abbr>.</p>
</blockquote>`;
  const expected = "“This is HTML.”";
  const text = stripTags(html);
  assertEquals(text, expected);
});

Deno.test("nested quotes", () => {
  const html = `<blockquote>
  <p>Blockquote with <q>inline quote</q> text.</p>
</blockquote>`;
  const expected = "“Blockquote with ‘inline quote’ text.”";
  const text = stripTags(html);
  assertEquals(text, expected);
});
