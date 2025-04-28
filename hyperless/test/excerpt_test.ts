import { excerpt } from "../src/excerpt.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("short", () => {
  const html = "<p>Ceci n’est pas une paragraphe.</p>";
  const expected = "Ceci n’est pas une paragraphe.";
  const text = excerpt(html);
  assertEquals(text, expected);
});

Deno.test("default", () => {
  const html =
    `<p>Back in March I shared my <a href="https://example.com">spring self-hosted update</a>. I had a new <a href="https://example.com" rel="noopener noreferrer" target="_blank">ZimaBlade</a> to play with. I bought a cheap GeForce GT 710 just to try the PCIe. It worked. That graphics card is terrible (more on that later). The ZimaBlade is also, frankly, terrible. The CPU thermal throttles itself to death. It gets <em>dangerously</em> hot. Add it to the list of crowdfunding campaigns I regret.</p><p>So I still use my <strong>Raspberry Pi</strong> and <strong>Mac Mini</strong> as home servers. Until now!</p>`;
  const expected =
    `Back in March I shared my spring self-hosted update. I had a new ZimaBlade to play with. I bought a cheap GeForce GT 710 just to try the PCIe. It worked. That graphics card is terrible (more on that later). The ZimaBlade is also, frankly, terrible. The CPU thermal throttles itself to death. […]`;
  const text = excerpt(html);
  assertEquals(text, expected);
});

Deno.test("max length", () => {
  const html =
    `<p>Back in March I shared my <a href="https://example.com">spring self-hosted update</a>. I had a new <a href="https://example.com" rel="noopener noreferrer" target="_blank">ZimaBlade</a> to play with. I bought a cheap GeForce GT 710 just to try the PCIe. It worked. That graphics card is terrible (more on that later). The ZimaBlade is also, frankly, terrible. The CPU thermal throttles itself to death. It gets <em>dangerously</em> hot. Add it to the list of crowdfunding campaigns I regret.</p><p>So I still use my <strong>Raspberry Pi</strong> and <strong>Mac Mini</strong> as home servers. Until now!</p>`;
  const expected =
    `Back in March I shared my spring self-hosted update. I had a new ZimaBlade to play with. […]`;
  const text = excerpt(html, 100);
  assertEquals(text, expected);
});

Deno.test("truncate", () => {
  const html =
    `<p>Back in March I shared my <a href="https://example.com">spring self-hosted update</a>. I had a new <a href="https://example.com" rel="noopener noreferrer" target="_blank">ZimaBlade</a> to play with. I bought a cheap GeForce GT 710 just to try the PCIe. It worked. That graphics card is terrible (more on that later). The ZimaBlade is also, frankly, terrible. The CPU thermal throttles itself to death. It gets <em>dangerously</em> hot. Add it to the list of crowdfunding campaigns I regret.</p><p>So I still use my <strong>Raspberry Pi</strong> and <strong>Mac Mini</strong> as home servers. Until now!</p>`;
  const expected =
    `Back in March I shared my spring self-hosted update. I had a new ZimaBlade to […]`;
  const text = excerpt(html, 80);
  assertEquals(text, expected);
});

Deno.test("exclamation mark end", () => {
  const html =
    `<p>Back in March I shared my <a href="https://example.com">spring self-hosted update</a>. I had a new <a href="https://example.com" rel="noopener noreferrer" target="_blank">ZimaBlade</a> to play with! I bought a cheap GeForce GT 710 just to try the PCIe.</p>`;
  const expected =
    `Back in March I shared my spring self-hosted update. I had a new ZimaBlade to play with! …`;
  const text = excerpt(html, 100, "…");
  assertEquals(text, expected);
});

Deno.test("question mark end", () => {
  const html =
    `<p>Back in March I shared my <a href="https://example.com">spring self-hosted update</a>. I had a new <a href="https://example.com" rel="noopener noreferrer" target="_blank">ZimaBlade</a> to play with? I bought a cheap GeForce GT 710 just to try the PCIe.</p>`;
  const expected =
    `Back in March I shared my spring self-hosted update. I had a new ZimaBlade to play with?`;
  const text = excerpt(html, 100, "");
  assertEquals(text, expected);
});
