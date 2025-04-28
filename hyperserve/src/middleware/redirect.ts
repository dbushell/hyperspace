import type { Hyperserve } from "../mod.ts";
import { requestMap } from "./shared.ts";

const ignore = new Set(["/", "/404", "/500"]);

/**
 * Middleware to handle auto redirects
 */
export default (server: Hyperserve): void => {
  // Possible routes for auto redirects
  const redirects = new Set<string>();
  for (const route of server.manifest.routes) {
    if (route.method !== "GET") continue;
    if (ignore.has(route.pattern)) continue;
    /** @todo better way to determine redirect routes */
    if (!/\.[\w]+$|\*/.test(route.pattern)) {
      redirects.add(route.pattern);
    }
  }
  for (const pattern of redirects) {
    let alt = pattern;
    if (pattern.at(-1) === "/") {
      alt = pattern.slice(0, -1);
    } else {
      alt += "/";
    }
    // Check for conflicts e.g. /about/index.html & /about.html
    if (redirects.has(alt)) {
      if (server.dev) {
        console.log(`⚠️ Possible conflict: ${alt} + ${pattern}`);
      }
      continue;
    }
    if (server.dev) {
      console.log(`🪄 308 ${alt} → ${pattern}`);
    }
    const input = new URLPattern({ pathname: alt });
    server.router.get(input, ({ request, response }) => {
      if (requestMap.get(request)?.ignore) return response;
      const url = new URL(request.url);
      if (url.pathname.at(-1) === "/") {
        url.pathname = url.pathname.slice(0, -1);
      } else {
        url.pathname += "/";
      }
      return new Response(null, {
        status: 308,
        headers: {
          location: url.href,
        },
      });
    });
  }
};
