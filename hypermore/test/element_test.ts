import { assertEquals } from "jsr:@std/assert";
import { hypermore, warn } from "./mod.ts";

Deno.test("<ssr-element> tag", async (test) => {
  warn.capture();
  await test.step("missing tag", async () => {
    const html = `<ssr-element>Fail!</ssr-element>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ['<ssr-element> missing "tag" property']);
  });
  warn.release();
  await test.step("open and close tags", async () => {
    const html = `<ssr-element tag="h1">Pass!</ssr-element>`;
    const output = await hypermore.render(html);
    assertEquals(output, "<h1>Pass!</h1>");
  });
  await test.step("additional attributes", async () => {
    const html =
      `<ssr-element tag="h1" id="pass" data-test c=1 c=2>Pass!</ssr-element>`;
    const output = await hypermore.render(html);
    assertEquals(output, '<h1 id="pass" data-test c="2">Pass!</h1>');
  });
  await test.step("attribute expression", async () => {
    const html = `<ssr-element tag="{{tag}}" id="{{tag}}">Pass!</ssr-element>`;
    const output = await hypermore.render(html, { tag: "h1" });
    assertEquals(output, '<h1 id="h1">Pass!</h1>');
  });
  await test.step("inherited attribute", async () => {
    const html =
      `<single-slot tag="h1"><ssr-element tag="{{tag}}" id="{{tag}}">Pass!</ssr-element></single-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, '<h1 id="h1">Pass!</h1>');
  });
  await test.step("non-inherited attribute", async () => {
    const html =
      `<single-slot tag="h3"><single-slot not-tag="h1"><ssr-element tag="{{$local.tag ?? 'h2'}}" id="{{$local.tag ?? 'h2'}}">Pass!</ssr-element></single-slot></single-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, '<h2 id="h2">Pass!</h2>');
  });
});
