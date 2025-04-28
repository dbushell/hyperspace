import { assertEquals } from "jsr:@std/assert";
import { hypermore } from "./mod.ts";

Deno.test("misc", async (test) => {
  await test.step("inline svg", async () => {
    const html = `<svg viewbox="0 0 100 200" width="100" height="200">
  <circle cx="10" cy="10" r="10" fill="red"/>
</svg>`;
    const output = await hypermore.render(html);
    assertEquals(output, html);
  });
  await test.step("inline style", async () => {
    const html = `<style>
:root {
  background: red;
}
</style>`;
    const output = await hypermore.render(html);
    assertEquals(output, html);
  });
  await test.step("inline script", async () => {
    const html = `<script type="text/javascript">
alert('Fail!');
\${test} \`
Deno.exit(1);
</script>`;
    const output = await hypermore.render(html);
    assertEquals(output, html);
  });
  await test.step("opaque tag attributes", async () => {
    const html =
      `<script data-test="{{'Pass!'}}" data-test2="1{{2}}3"></script>`;
    const output = await hypermore.render(html);
    assertEquals(
      output,
      `<script data-test="Pass!" data-test2="123"></script>`,
    );
  });
  await test.step("html comment", async () => {
    const html = `<!-- comment \`test\` -->`;
    const output = await hypermore.render(html);
    assertEquals(output, html);
  });
  await test.step("escape grave text", async () => {
    const html = `{{html}}`;
    const output = await hypermore.render(html, {
      html: "console.log(`1`,`2`,${a});",
    });
    assertEquals(output, "console.log(`1`,`2`,${a});");
  });
  await test.step("escape grave script", async () => {
    const html = `<ssr-html>{{html}}</ssr-html>`;
    const output = await hypermore.render(html, {
      html: "<script>console.log(`1`,`2`,${a});</script>",
    });
    assertEquals(output, "<script>console.log(`1`,`2`,${a});</script>");
  });
  await test.step("escape grave prop", async () => {
    const html = `<my-html html="{{html}}" />`;
    const output = await hypermore.render(html, {
      html: "<script>console.log(`1`,`2`,${a});</script>",
    });
    assertEquals(output, "<script>console.log(`1`,`2`,${a});</script>");
  });
  await test.step("text node", async () => {
    const html = "test `test ${test} {{'te`st'}}";
    const output = await hypermore.render(html);
    assertEquals(output, "test `test ${test} te`st");
  });
  await test.step("code element", async () => {
    const html = "<code>`test` ${code} {{code}}</code>";
    const output = await hypermore.render(html);
    assertEquals(output, html);
  });
  await test.step("text variable escape", async () => {
    const html = "{{!ignore}} {{! console.error('Fail!); }}";
    const output = await hypermore.render(html);
    assertEquals(output, html.replaceAll("{{!", "{{"));
  });
  await test.step("function expression", async () => {
    const html = "{{[1,2,3].find(n => n === 3)}}";
    const output = await hypermore.render(html);
    assertEquals(output, "3");
  });
  await test.step("function props", async () => {
    const html = `<my-prop number="{{[1,2,3].find(n =&gt; n === 3)}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>3</p>`);
  });
  await test.step("custom element + template", async () => {
    const html =
      `<custom-element><template shadowrootmode="{{shadowrootmode}}"><slot></slot></template>{{p1}}</custom-element><template>{{p2}}</template>`;
    const output = await hypermore.render(html, {
      shadowrootmode: "open",
      p1: 1,
      p2: 2,
    });
    assertEquals(
      output,
      `<custom-element><template shadowrootmode="open"><slot></slot></template>1</custom-element><template>2</template>`,
    );
  });
});
