import { assert, assertEquals } from "jsr:@std/assert";
import { globalProps, hypermore } from "./mod.ts";

Deno.test("props", async (test) => {
  await test.step("interpolation", async () => {
    const html = `<p>{{$global.number}}</p>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>${globalProps.number}</p>`);
  });
  await test.step("escape apostrophe (global)", async () => {
    const html = `<p>{{$global.escapeApostrophe}}</p>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>${globalProps.escapeApostropheEncoded}</p>`);
  });
  await test.step("encode entities (global)", async () => {
    const html = `<p>{{$global.entities}}</p>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>${globalProps.encodedEntities}</p>`);
  });
  await test.step("escape apostrophe (prop)", async () => {
    const html = `<my-prop number="{{$global.escapeApostrophe}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>${globalProps.escapeApostropheEncoded}</p>`);
  });
  await test.step("encode entities (prop)", async () => {
    const html = `<my-prop number="{{$global.entities}}" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>${globalProps.encodedEntities}</p>`);
  });
  await test.step("type preservation", async () => {
    const html = `<p>{{typeof $global.number}}</p>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>number</p>`);
  });
  await test.step("expression", async () => {
    const html = `<p>{{$global.array.join('')}}</p>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>123abc</p>`);
  });
  await test.step("missing error", async () => {
    const html = `<p>{{ missing.join('') }}</p>`;
    try {
      await hypermore.render(html);
    } catch (err) {
      assert(err instanceof Error);
      assertEquals(err.message.includes(`"missing is not defined"`), true);
      assertEquals(err.message.includes(`{{ missing.join('') }}`), true);
    }
  });
  await test.step("component missing prop", async () => {
    const html = `<my-prop />`;
    try {
      await hypermore.render(html);
    } catch (err) {
      assert(err instanceof Error);
      assertEquals(err.message.includes(`expression: "{{prop}}"`), true);
      assertEquals(err.message.includes(`element: <my-prop>`), true);
    }
  });
  await test.step("global as local prop", async () => {
    const html = `<p>{{number}}</p>`;
    const output = await hypermore.render(html);
    assertEquals(output, `<p>${globalProps.number}</p>`);
  });
  await test.step("override global", async () => {
    const html = `<p>{{number}}</p>`;
    const output = await hypermore.render(html, { number: 777 });
    assertEquals(output, `<p>777</p>`);
  });
  await test.step("override global attribute", async () => {
    const html = `{{number}} <my-prop number="777" />`;
    const output = await hypermore.render(html);
    assertEquals(output, `42 <p>777</p>`);
  });
  await test.step("local prop reset", async () => {
    const html = `{{number}} <my-prop number="777" /> {{number}}`;
    const output = await hypermore.render(html, {
      number: 42,
    });
    assertEquals(output, `42 <p>777</p> 42`);
  });
  await test.step("$local prop reset", async () => {
    const html =
      `{{$local.number}} <my-prop number="777" other="42" /> {{$local.number}}`;
    const output = await hypermore.render(html, {
      number: 42,
    });
    assertEquals(output, `42 <p>777</p> 42`);
  });
  await test.step("camel case conversion", async () => {
    const html =
      `<single-slot camel-case="Pass!">{{ camelCase }}</single-slot>`;
    const output = await hypermore.render(html);
    assertEquals(output, `Pass!`);
  });
  // warn.capture();
  // await test.step("reserved prop name", async () => {
  //   const html = `<single-slot>{{ $global }}</single-slot>`;
  //   const output = await hypermore.render(html, {
  //     "$global": "test",
  //   });
  //   console.log(output);
  //   assertEquals(output, `[object Object]`);
  //   assertEquals(warn.stack.pop(), ['invalid prop "$global" is reserved']);
  // });
  // warn.release();
  await test.step("props propagation", async () => {
    const output = await hypermore.render(
      `<single-slot><h1>{{heading}}</h1></single-slot>`,
      {
        heading: "Pass!",
      },
    );
    assertEquals(output, `<h1>Pass!</h1>`);
  });
  await test.step("props propagation", async () => {
    hypermore.setTemplate("my-h2", `<h2>{{heading}}</h2>`);
    const output = await hypermore.render(
      `<single-slot><h1>{{heading}}</h1><my-h2 /></single-slot>`,
      {
        heading: "Pass!",
      },
    );
    assertEquals(output, `<h1>Pass!</h1><h2>Pass!</h2>`);
  });
  await test.step("duplicate props name", async () => {
    hypermore.setTemplate("my-h3", `<h3 id="{{id}}">{{id}}</h3>`);
    const output = await hypermore.render(`<my-h3 id="{{id}}">`, {
      id: "Pass!",
    });
    assertEquals(output, `<h3 id="Pass!">Pass!</h3>`);
  });
});
