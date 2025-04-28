import { assertEquals } from "jsr:@std/assert";
import { globalProps, hypermore, warn } from "./mod.ts";

hypermore.setTemplate("s-1", `<div class="s1"><ssr-slot /></div>`);
hypermore.setTemplate("s-2", `<div class="s2"><ssr-slot /></div>`);
hypermore.setTemplate(
  "s-3",
  `<s-2><div class="s3"><ssr-slot /></div></s-2>`,
);
hypermore.setTemplate(
  "s-4",
  `<s-1><s-2><div class="s4"><ssr-slot name="main" /></div></s-2></s-1>`,
);
hypermore.setTemplate("loop-slot", `<ssr-slot /><loop-slot />`);
hypermore.setTemplate("void-slot", `<main><ssr-slot /></main>`);
hypermore.setTemplate(
  "fallback-slot",
  `<main><ssr-slot>Fallack!</slot></main>`,
);
hypermore.setTemplate(
  "named-slot",
  `<main><ssr-slot name="start">Unused!</slot><ssr-slot> Center! </slot><ssr-slot name="end" /></main>`,
);
hypermore.setTemplate(
  "my-button",
  `<button type="{{type}}"><span>{{label}}</span></button>`,
);

Deno.test("components", async (test) => {
  warn.capture();
  await test.step("basic import", async () => {
    const html = `<div><my-basic /></div>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div><main>Pass!</main></div>`);
  });
  await test.step("unknown import", async () => {
    const html = `<div><my-unknown>{{$global.number}}</my-unknown></div>`;
    const output = await hypermore.render(html);
    assertEquals(
      output,
      `<div><my-unknown>${globalProps.number}</my-unknown></div>`,
    );
  });
  await test.step("infinite loop", async () => {
    const html =
      `<loop-slot>1<loop-slot>2<loop-slot>3</loop-slot></loop-slot></loop-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, `123`);
    assertEquals(warn.stack.pop(), ["<loop-slot> infinite nested loop"]);
  });
  warn.release();
  await test.step("nested slot (1)", async () => {
    const html = `<s-3>Pass!</s-3>`;
    const output = await hypermore.render(html);
    assertEquals(
      output,
      `<div class="s2"><div class="s3">Pass!</div></div>`,
    );
  });
  await test.step("nested slot (2)", async () => {
    const html = `<s-1 pass="Pass!"><s-3>{{pass}}</s-3></s-1>`;
    const output = await hypermore.render(html);
    assertEquals(
      output,
      `<div class="s1"><div class="s2"><div class="s3">Pass!</div></div></div>`,
    );
  });
  await test.step("nested slot (3)", async () => {
    const html = `<s-4><ssr-fragment slot="main">Pass!</ssr-fragment></s-4>`;
    const output = await hypermore.render(html);
    assertEquals(
      output,
      `<div class="s1"><div class="s2"><div class="s4">Pass!</div></div></div>`,
    );
  });
  await test.step("void slot", async () => {
    const html = `<div><void-slot>Pass!</void-slot></div>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div><main>Pass!</main></div>`);
  });
  await test.step("fallback slot (empty)", async () => {
    const html = `<div><fallback-slot /></div>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div><main>Fallack!</main></div>`);
  });
  await test.step("fallback slot (populated)", async () => {
    const html = `<div><fallback-slot>Populated!</fallback-slot></div>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<div><main>Populated!</main></div>`);
  });
  await test.step("named slot (1)", async () => {
    const html =
      `<named-slot><ssr-fragment slot="start">Start!</fragment></named-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<main>Start! Center! </main>`);
  });
  await test.step("named slot (2)", async () => {
    const html =
      `<named-slot><ssr-fragment slot="start">Start!</fragment><ssr-fragment slot="end">End!</fragment></named-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<main>Start! Center! End!</main>`);
  });
  await test.step("named slot + unused", async () => {
    const html =
      `<named-slot><ssr-fragment slot="end">End!</fragment></named-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<main>Unused! Center! End!</main>`);
  });
  await test.step("named slot + default", async () => {
    const html =
      `<named-slot><ssr-fragment slot="start">Start!</fragment> Middle! <ssr-fragment slot="end">End!</fragment></named-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<main>Start! Middle! End!</main>`);
  });
  await test.step("named slot + props", async () => {
    const html =
      `<named-slot start="Start!" end="End!"><ssr-fragment slot="start">{{start}}</fragment><ssr-fragment slot="end">{{end}}</fragment></named-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<main>Start! Center! End!</main>`);
  });
});
