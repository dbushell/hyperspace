import { assertEquals } from "jsr:@std/assert";
import { hypermore } from "./mod.ts";

hypermore.setTemplate(
  "my-time",
  `<script context="component">
const newDate = new Date(date);
const year = newDate.getFullYear().toString();
const month = newDate.toLocaleString('en-GB', {month: 'long'});
const day = newDate.toLocaleString('en-GB', {weekday: 'long'});

date = \`\${year}, \${month}, \${day}\`;
</script>
{{date}}
`,
);
hypermore.setTemplate(
  "my-default",
  `<script context="component">
const heading = 'Heading';
const description = 'Description';
</script>
{{heading}} {{description}} {{end}}
`,
);

Deno.test("<script> tag", async (test) => {
  await test.step("local props script", async () => {
    const date = "2024-10-08T12:01:23.728Z";
    const html = `<my-time date="${date}" />`;
    const output = await hypermore.render(html);
    assertEquals(output.trim(), `2024, October, Tuesday`);
  });
  await test.step("default props script", async () => {
    const html = `<my-default end="End" />`;
    const output = await hypermore.render(html);
    assertEquals(output.trim(), `Heading Description End`);
  });
});
