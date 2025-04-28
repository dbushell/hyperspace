import { assertEquals } from "jsr:@std/assert";
import { Hypermore } from "../mod.ts";

export const hypermore = new Hypermore({
  globalProps: {
    heading: "Pass",
  },
});

Deno.test("concurrency", async () => {
  const promises: Array<Promise<unknown>> = [];
  for (let i = 0; i < 100; i++) {
    const expected = `<h1>Pass ${i}</h1>`;
    promises.push(
      hypermore
        .render("<h1>{{heading}} {{i}}</h1>", {
          i,
        })
        .then((actual) => {
          assertEquals(actual, expected);
        }),
    );
  }
  await Promise.all(promises);
});
