import { assertEquals } from "jsr:@std/assert";
import { hypermore, warn } from "./mod.ts";

Deno.test("<ssr-for> tag", async (test) => {
  warn.capture();
  await test.step("void statement", async () => {
    const html = `<ssr-for />`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ["<ssr-for> with no statement"]);
  });
  await test.step("empty statement", async () => {
    const html = `<ssr-for></for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ["<ssr-for> with no statement"]);
  });
  await test.step('missing "of" property', async () => {
    const html = `<ssr-for>Fail!</for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ['<ssr-for> missing "of" property']);
  });
  await test.step('missing "item" property', async () => {
    const html = `<ssr-for of="5">Fail!</for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ['<ssr-for> invalid "item" property']);
  });
  await test.step('invalid "item" property', async () => {
    const html = `<ssr-for item="!!" of="5">Fail!</for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ['<ssr-for> invalid "item" property']);
  });
  await test.step('invalid "index" property', async () => {
    const html = `<ssr-for index="!!" item="item" of="5">Fail!</for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ['<ssr-for> invalid "index" property']);
  });
  await test.step("number range", async () => {
    const html = `<ssr-for item="n" of="3">{{n + 1}}</for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "123");
  });
  await test.step("characters", async () => {
    const html = `<ssr-for item="n" of="'abc'">{{n}}</for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "abc");
  });
  await test.step("array", async () => {
    const html = `<ssr-for item="n" of="[1,2,3,'a','b','c']">{{n}}</for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "123abc");
  });
  await test.step("array (global prop)", async () => {
    const html = `<ssr-for item="n" of="$global.array">{{n}}</for>`;
    const output = await hypermore.render(html);
    assertEquals(output, "123abc");
  });
  await test.step("props reset", async () => {
    const html = `<ssr-for index="i" item="n" of="3">{{n}}</for>{{i}}{{n}}`;
    const output = await hypermore.render(html, {
      i: "A",
      n: "B",
    });
    assertEquals(output, "012AB");
  });
  warn.release();
});
