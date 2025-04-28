import type { HyperHandle } from "jsr:@dbushell/hyperserve";

export const PUT: HyperHandle = ({ request }) => {
  return Response.json({
    method: request.method.toUpperCase(),
  });
};
