import { assertEquals } from "jsr:@std/assert";
import { hypermore } from "./mod.ts";

Deno.test("attributes", async (test) => {
  await test.step("undefined expression", async () => {
    const html = `<div hidden="{{undefined}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div/>`);
  });
  await test.step("null expression", async () => {
    const html = `<div hidden="{{null}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div/>`);
  });
  await test.step("false expression", async () => {
    const html = `<div hidden="{{false}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div hidden="false"/>`);
  });
  await test.step("false string", async () => {
    const html = `<div hidden="false" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div hidden="false"/>`);
  });
  await test.step("true expression", async () => {
    const html = `<div hidden="{{true}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div hidden="true"/>`);
  });
  await test.step("true string", async () => {
    const html = `<div hidden="true" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div hidden="true"/>`);
  });
  await test.step("no attributes", async () => {
    const html = `<div />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div/>`);
  });
  await test.step("empty string", async () => {
    const html = `<div hidden="" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div hidden/>`);
  });
  await test.step("random expressions", async () => {
    const html = `<div a="{{'1'}}" b="{{1+1}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div a="1" b="2"/>`);
  });
  await test.step("grave attribute", async () => {
    const html = `<div hidden="\`" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div hidden="\`"/>`);
  });
  await test.step("escaped attribute", async () => {
    const html = `<div a="&lt;" b="{{'&gt;'}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div a="&lt;" b="&gt;"/>`);
  });
  await test.step("undefined attribute", async () => {
    const html = `<div hidden="{{hidden}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div/>`);
  });
  await test.step("for loop attributes", async () => {
    const html =
      `<ssr-for item="i" of="3"><div id="{{i}}" undefined="{{nothing}}"/></ssr-for>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div id="0"/><div id="1"/><div id="2"/>`);
  });
});
