import type { HyperHandle } from "jsr:@dbushell/hyperserve";

export const DELETE: HyperHandle = ({ request }) => {
  return Response.json({
    method: request.method.toUpperCase(),
  });
};
