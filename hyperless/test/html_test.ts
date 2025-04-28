import { Node } from "../mod.ts";
import { parseHTML } from "../src/html-parser.ts";
import { assert, assertEquals } from "jsr:@std/assert";

Deno.test("paragraph", () => {
  const html = "<p>Paragraph</p>";
  const root = parseHTML(html);
  const p = root.at(0)!;
  assertEquals(p.tag, "p");
  assertEquals(p.size, 1);
  assertEquals(p.at(0)!.type, "TEXT");
  assertEquals(p.at(0)!.raw, "Paragraph");
});

Deno.test("case-insensitive", () => {
  const html = "<ArTiClE>Paragraph</aRtIcLe>";
  const root = parseHTML(html);
  assertEquals(root.at(0)!.tag, "article");
});

Deno.test("custom elements", () => {
  const html = `<my-element>
  <my-one>1</my-one>
  <my-two>2</my-two>
  <my-three>3</my-three>
</my-element>`.replace(/\s+/g, "");
  const root = parseHTML(html);
  assertEquals(root.at(0)!.tag, "my-element");
  assertEquals(root.at(0)!.at(1)!.tag, "my-two");
  assertEquals(root.at(0)!.at(1)!.type, "ELEMENT");
  assertEquals(root.at(0)!.size, 3);
});

Deno.test("paragraph inline", () => {
  const html = "<p>This is <strong>inline</strong></p>";
  const root = parseHTML(html);
  const p = root.at(0)!;
  const strong = p.at(1)!;
  assertEquals(p.size, 2);
  assertEquals(p.at(0)!.type, "TEXT");
  assertEquals(strong.tag, "strong");
  assertEquals(strong.at(0)!.raw, "inline");
});

Deno.test("fake out tag", () => {
  const html = "<p>Less than < fake tag</p>";
  const root = parseHTML(html);
  const p = root.at(0)!;
  assertEquals(p.size, 2);
});

Deno.test("void element", () => {
  const html = "<p>1</p><img><p>2</p>";
  const root = parseHTML(html);
  assertEquals(root.size, 3);
  assertEquals(root.at(1)!.type, "VOID");
});

Deno.test("self-closing", () => {
  const html = "<div />";
  const root = parseHTML(html);
  assertEquals(root.size, 1);
  assertEquals(root.at(0)!.type, "VOID");
});

Deno.test("stray node", () => {
  const html = "<p>1</p></p><p>2</p>";
  const root = parseHTML(html);
  assertEquals(root.size, 3);
  assertEquals(root.at(1)!.type, "STRAY");
});

Deno.test("leftover text", () => {
  const html = "<p>Paragraph</p>Leftover";
  const root = parseHTML(html);
  assertEquals(root.at(1)!.type, "TEXT");
  assertEquals(root.at(1)!.raw, "Leftover");
});

Deno.test("unclosed <li>", () => {
  const html = `
<ul>
  <li>1<b>b</b>
  <li>2</li>
  <li>3
    <ol>
      <li>4<i>i</i>
      <li>5
    </ol>
</ul>`.replace(/\s+/g, "");
  const root = parseHTML(html);
  assertEquals(root.at(0)!.size, 3);
  assertEquals(
    root.toString(),
    `
<ul>
  <li>1<b>b</b></li>
  <li>2</li>
  <li>3
    <ol>
      <li>4<i>i</i></li>
      <li>5</li>
    </ol>
  </li>
</ul>`.replace(/\s+/g, ""),
  );
});

Deno.test("unclosed <p> (1)", () => {
  const html = `<p>1 <my-element /><div />2`;
  const root = parseHTML(html);
  assertEquals(root.toString(), "<p>1 <my-element/></p><div/>2");
});

Deno.test("unclosed <p> (2)", () => {
  const html = `
<p>Hello, World!
<div>
  <p>Closed</p>
  <p>Unclosed<br><b>bold</b>
  <p>Unclosed
</div>
<p>EOF<hr>
`.replace(/\s+/g, "");
  const root = parseHTML(html);
  assertEquals(root.size, 4);
  assertEquals(
    root.toString(),
    `
<p>Hello, World!</p>
<div>
  <p>Closed</p>
  <p>Unclosed<br/><b>bold</b></p>
  <p>Unclosed</p>
</div>
<p>EOF</p>
<hr/>
`.replace(/\s+/g, ""),
  );
});

Deno.test("comments", () => {
  const html = `
<!--
  COMMENT 1 -->
<div>
  <p><!-- COMMENT 2 --></p>
</div>`;
  const root = parseHTML(html);
  assertEquals(root.at(1)!.type, "COMMENT");
  assertEquals(root.at(3)!.at(1)!.at(0)!.type, "COMMENT");
});

Deno.test("opaque state (svg)", () => {
  const svg = `<svg>
  <path />
  <rect />
  <circle />
</svg>`;
  const html = `<svg />${svg}<p>After</p>`;
  const root = parseHTML(html);
  assertEquals(root.size, 3);
  assertEquals(root.at(1)!.type, "OPAQUE");
  assertEquals(root.at(1)!.size, 1);
  assertEquals(root.at(1)!.at(0)!.type, "TEXT");
  assertEquals(root.at(1)!.toString(), svg);
});

Deno.test("script fake tag", () => {
  const html =
    `<script>/* This is a fake </script> tag */</script><p>after</p>`;
  const root = parseHTML(html);
  assertEquals(root.at(1)!.raw, " tag */");
});

Deno.test("attributes", () => {
  const html =
    '<div data-test="test123"a="\'b\'"c boolean data-2="2" data:3="3" _4=""s1=\'x="1"\'s2="x=\'\u20012\'" data5\u0009data_six=\' 6 \'>test</div>';
  const root = parseHTML(html);
  assertEquals(root.at(0)!.at(0)!.raw, "test");
  assertEquals(root.at(0)!.attributes.size, 11);
});

Deno.test("render", () => {
  const html = `
<p>Paragraph
  <b>bold</b>
  <!-- comment --></p>
</p>
<small>&copy;</small>
`;
  const render = `
<p>Paragraph
  <b>bold</b>
  </p>

<small>&copy;</small>
`;
  const root = parseHTML(html);
  assertEquals(root.toString(), render);
});

Deno.test("detach", () => {
  const html = "<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>";
  const root = parseHTML(html);
  const c0 = root.at(0)!;
  const c1 = root.at(1)!;
  const c2 = root.at(2)!;
  const c3 = root.at(3)!;
  const c4 = root.at(4)!;
  assertEquals(root.size, 5);
  c0.detach();
  assertEquals(root.size, 4);
  assert(root.head === c1);
  assert(root.tail === c4);
  c3.detach();
  assertEquals(root.size, 3);
  assert(root.head === c1);
  assert(root.tail === c4);
  c4.detach();
  assert(root.tail === c2);
  c1.detach();
  assert(root.head === c2);
  assertEquals(root.size, 1);
});

Deno.test("Node.replaceWith", () => {
  const html = "<p>1</p><p>2</p><p>3</p>";
  const root = parseHTML(html);
  const A = parseHTML("<p>A</p>");
  const B = parseHTML("<p>B</p>");
  const C = parseHTML("<p>C</p>");
  root.at(0)!.replace(A);
  root.at(1)!.replace(B);
  root.at(2)!.replace(C);
  assertEquals(root.toString(), "<p>A</p><p>B</p><p>C</p>");
  assert(root.head === A);
  assert(root.tail === C);
});

Deno.test("Node.indexOf", () => {
  const html = "<p>1</p><p>2</p><p>3</p><p>4</p><p>5</p>";
  const root = parseHTML(html);
  const c0 = root.at(0)!;
  const c2 = root.at(2)!;
  const c4 = root.at(4)!;
  assertEquals(root.indexOf(c0), 0);
  assertEquals(root.indexOf(c2), 2);
  assertEquals(root.indexOf(c4), 4);
  assertEquals(c0.indexOf(c4), -1);
});

Deno.test("Node.insertAt", () => {
  const root = new Node();
  const n1 = parseHTML("<p>1</p>");
  const n2 = parseHTML("<p>2</p>");
  const n3 = parseHTML("<p>3</p>");
  root.insertAt(n3, 0);
  root.insertAt(n2, 0);
  root.insertAt(n1, 0);
  assertEquals(root.toString(), "<p>1</p><p>2</p><p>3</p>");
});

Deno.test("Node.after", () => {
  const root = new Node();
  const n1 = parseHTML("<p>1</p>");
  const n2 = parseHTML("<p>2</p>");
  const n3 = parseHTML("<p>3</p>");
  root.append(n1, n2, n3);
  assertEquals(root.toString(), "<p>1</p><p>2</p><p>3</p>");
  n2.after(n1); // 2 1 3
  n1.after(n3);
  n2.after(n3); // 2 3 1
  n1.after(n2); // 3 1 2
  n2.after(n1); // 3 2 1
  assertEquals(root.toString(), "<p>3</p><p>2</p><p>1</p>");
});

Deno.test("Node.before", () => {
  const root = new Node();
  const n1 = parseHTML("<p>1</p>");
  const n2 = parseHTML("<p>2</p>");
  const n3 = parseHTML("<p>3</p>");
  root.append(n1, n2, n3);
  assertEquals(root.toString(), "<p>1</p><p>2</p><p>3</p>");
  n3.before(n1); // 2 1 3
  n2.before(n3); // 3 2 1
  assertEquals(root.toString(), "<p>3</p><p>2</p><p>1</p>");
});
