import { assertEquals } from "jsr:@std/assert";
import { hypermore, warn } from "./mod.ts";

Deno.test("<ssr-if> tag", async (test) => {
  warn.capture();
  await test.step("void statement", async () => {
    const html = `<ssr-if />`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ["<ssr-if> with no statement"]);
  });
  await test.step("empty statement", async () => {
    const html = `<ssr-if></if>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ["<ssr-if> with no statement"]);
  });
  await test.step("missing condition", async () => {
    const html = `<ssr-if>Fail!</if>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ['<ssr-if> missing "condition" property']);
  });
  await test.step("true condition", async () => {
    const html = `<ssr-if condition="$global.number === 42">Pass!</if>`;
    const output = await hypermore.render(html);
    assertEquals(output, "Pass!");
  });
  await test.step("false condition", async () => {
    const html = `<ssr-if condition="$global.number === 22">Fail!</if>`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
  });
  await test.step("<ssr-else> condition", async () => {
    const html = `
<ssr-if condition="$global.number === 22">
  Fail!
<ssr-else>
  Pass!
</if>`;
    const output = await hypermore.render(html);
    assertEquals(output.trim(), "Pass!");
  });
  await test.step("<ssr-elseif> condition", async () => {
    const html = `
<ssr-if condition="$global.number === 22">
  Fail 1
<ssr-elseif condition="$global.number === 32">
  Fail 2
<ssr-elseif condition="$global.number === 42">
  Pass!
<ssr-else>
  Fail 3
</if>`;
    const output = await hypermore.render(html);
    assertEquals(output.trim(), "Pass!");
  });
  await test.step("<ssr-elseif> <ssr-else> condition", async () => {
    const html = `
<ssr-if condition="$global.number === 22">
  Fail 1
<ssr-elseif condition="$global.number === 32">
  Fail 2
<ssr-else>
  Pass!
</if>`;
    const output = await hypermore.render(html);
    assertEquals(output.trim(), "Pass!");
  });
  warn.release();
});
