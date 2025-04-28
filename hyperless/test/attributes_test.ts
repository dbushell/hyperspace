import { AttributeMap } from "../src/attribute-map.ts";
import { parseAttributes } from "../src/attribute-parser.ts";
import { anyTag } from "../src/regexp.ts";
import { assertEquals, assertObjectMatch } from "jsr:@std/assert";

/** Get unparsed attributes from the first HTML tag */
const getTagAttributes = (html: string): string => {
  const tagMatch = html.trim().match(new RegExp(anyTag.source, "s"));
  return tagMatch?.[2] ?? "";
};

Deno.test("single (pair)", () => {
  const html = '<div data-test="test123">';
  const expected = {
    "data-test": "test123",
  };
  const attr = parseAttributes(getTagAttributes(html));
  const actual = Object.fromEntries(attr.entries());
  assertObjectMatch(actual, expected);
});

Deno.test("single (self-closing)", () => {
  const html = '<div data-test="test123" />';
  const expected = {
    "data-test": "test123",
  };
  const attr = parseAttributes(getTagAttributes(html));
  const actual = Object.fromEntries(attr.entries());
  assertObjectMatch(actual, expected);
});

Deno.test("single (boolean self-closing)", () => {
  const html = "<div data-test/>";
  const expected = {
    "data-test": "",
  };
  const attr = parseAttributes(getTagAttributes(html));
  const actual = Object.fromEntries(attr.entries());
  assertObjectMatch(actual, expected);
});

Deno.test("single (boolean)", () => {
  const html = "<div data-test/>";
  const expected = {
    "data-test": "",
  };
  const attr = parseAttributes(getTagAttributes(html));
  const actual = Object.fromEntries(attr.entries());
  assertObjectMatch(actual, expected);
});

Deno.test("single (unquoted)", () => {
  const html = "<div data-test=test/>";
  const expected = {
    "data-test": "test",
  };
  const attr = parseAttributes(getTagAttributes(html));
  const actual = Object.fromEntries(attr.entries());
  assertObjectMatch(actual, expected);
});

Deno.test("duplicate", () => {
  const html = '<div a="a" b="b" a="A" c="c" A="AA"c>';
  const expected = {
    a: "AA",
    b: "b",
    c: "",
  };
  const attr = parseAttributes(getTagAttributes(html));
  const actual = Object.fromEntries(attr.entries());
  assertObjectMatch(actual, expected);
});

Deno.test("multiple (whitespace)", () => {
  const html = `\u0009 <div a1="1"a2="2"
    a3="3"\u0009a4="4"a5\u0009a6\u0009=
    \u0009"6"a7\u0009=7\u0009
    a8/> `;
  const expected = {
    a1: "1",
    a2: "2",
    a3: "3",
    a4: "4",
    a5: "",
    a6: "6",
    a7: "7",
    a8: "",
  };
  const attr = parseAttributes(getTagAttributes(html));
  const actual = Object.fromEntries(attr.entries());
  assertObjectMatch(actual, expected);
});

Deno.test("mixed", () => {
  const html =
    '<div data-test="test123"a="\'b\'"c boolean data-2="2" data:3="3" _4=""s1=\'x="1"\'s2="x=\'\u20012\'" data5\u0009data_six=\' 6 \'>';
  const expected = {
    "data-test": "test123",
    a: "'b'",
    c: "",
    boolean: "",
    "data-2": "2",
    "data:3": "3",
    _4: "",
    s1: 'x="1"',
    s2: "x='\u20012'",
    data5: "",
    data_six: " 6 ",
  };
  const attr = parseAttributes(getTagAttributes(html));
  const actual = Object.fromEntries(attr.entries());
  assertObjectMatch(actual, expected);
});

Deno.test("entities", () => {
  const encoded = `&amp;&lt;&gt;&quot;&#39;`;
  const decoded = `&<>"'`;
  const entries: { [key: string]: string } = {
    prop: decoded,
  };
  let attr = parseAttributes(`prop="${encoded}"`);
  attr = new AttributeMap(attr);
  assertEquals(attr.get("prop"), decoded);
  assertEquals(attr.get("prop", false), encoded);
  assertEquals(attr.toString(), `prop="${encoded}"`);
  assertObjectMatch(entries, Object.fromEntries(attr.entries()));
  assertEquals(Array.from(attr.values()).join(""), decoded);
  assertEquals(Array.from(attr.values(false)).join(""), encoded);
  for (const [k, v] of attr) {
    assertEquals(v, entries[k]);
  }
  attr.forEach((v, k) => {
    assertEquals(entries[k], v);
  });
});
