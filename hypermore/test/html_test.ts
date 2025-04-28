import { assertEquals } from "jsr:@std/assert";
import { globalProps, hypermore, warn } from "./mod.ts";

Deno.test("<ssr-html> tag", async (test) => {
  await test.step("unescaped variable", async () => {
    const html = `<ssr-html>{{$global.entities}}</ssr-html>`;
    const output = await hypermore.render(html);
    assertEquals(output, globalProps.entities);
  });
  await test.step("unrendered component", async () => {
    const html = `<ssr-html><my-prop prop="test"/></ssr-html>`;
    const output = await hypermore.render(html);
    assertEquals(output, '<my-prop prop="test"/>');
  });
  await test.step("unrendered <ssr-if>", async () => {
    const html =
      `<ssr-html><ssr-if condition="true">{{$global.entities}}</ssr-if></ssr-html>`;
    const output = await hypermore.render(html);
    assertEquals(
      output,
      `<ssr-if condition="true">${globalProps.entities}</ssr-if>`,
    );
  });
  await test.step("unrendered <ssr-fragment>", async () => {
    const html =
      `<ssr-html><ssr-fragment portal="head">{{$global.entities}}</ssr-fragment></ssr-html>`;
    const output = await hypermore.render(html);
    assertEquals(
      output,
      `<ssr-fragment portal="head">${globalProps.entities}</ssr-fragment>`,
    );
  });
  warn.capture();
  await test.step("empty html", async () => {
    const html = `<ssr-html />`;
    const output = await hypermore.render(html);
    assertEquals(output, "");
    assertEquals(warn.stack.pop(), ["<ssr-html> with no content"]);
  });
  warn.release();
});
