import type { HyperHandle } from "jsr:@dbushell/hyperserve";

export const GET: HyperHandle = ({ request }) => {
  return Response.json({
    url: request.url,
    "x-forwarded-host": request.headers.get("x-forwarded-host"),
    "x-forwarded-proto": request.headers.get("x-forwarded-proto"),
  });
};
