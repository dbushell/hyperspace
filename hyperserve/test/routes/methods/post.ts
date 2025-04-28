import type { HyperHandle } from "jsr:@dbushell/hyperserve";

export const POST: HyperHandle = async ({ request }) => {
  return Response.json(await request.json());
};
