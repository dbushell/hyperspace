import type { HyperHandle } from "jsr:@dbushell/hyperserve";

export const PATCH: HyperHandle = ({ request }) => {
  return Response.json({
    method: request.method.toUpperCase(),
  });
};
