import type {
  HyperHandle,
  RenderFunction,
  Route,
  RouteLoadProps,
  RouteModule,
} from "../types.ts";
import type { Hyperserve } from "../mod.ts";
import * as fs from "@std/fs";
import * as path from "@std/path";
import { importModule, importRoute } from "../routes.ts";
import { serverFetch } from "../fetch.ts";

const htmlExtensions = new Set([".html", ".ssr"]);
const jsExtensions = new Set([".js", ".ts"]);

export const routeMethods = new Set<Route["method"]>([
  "DELETE",
  "GET",
  "PATCH",
  "POST",
  "PUT",
]);

// Only return body content for GET requests
const sendBody = (request: Request) =>
  request.method === "GET" &&
  request.headers.get("accept")?.includes("text/html");

/**
 * Middleware to load server routes
 */
export default async (server: Hyperserve) => {
  const routeDir = path.resolve(server.dir, "routes");
  if (fs.existsSync(routeDir) === false) {
    console.warn(`Missing routes directory: "${routeDir}"`);
    return;
  }

  const routes: Array<Route> = [];

  // Walk routes directory
  for await (
    const entry of fs.walk(routeDir, {
      exts: [...htmlExtensions, ...jsExtensions],
    })
  ) {
    const ext = path.extname(entry.path);
    const hash = await server.hash(entry.path);

    // Import route module
    let mod: RouteModule;
    let code = await Deno.readTextFile(entry.path);
    if (htmlExtensions.has(ext)) {
      [code, mod] = await importRoute(code);
    } else {
      const type = `text/${ext === ".js" ? "java" : "type"}script`;
      mod = (await importModule(code, type)) as RouteModule;
    }

    // Configure route pattern
    let pattern = "/" + path.relative(routeDir, entry.path);
    // Replace non-capturing groups
    pattern = pattern.replaceAll(/\([^\)]+?\)\/?/g, "");
    // Replace named parameters
    pattern = pattern.replaceAll(/\[([^\]]+?)\]/g, ":$1");
    // Remove URL
    pattern = path.dirname(pattern);
    if (pattern.at(-1) !== "/") {
      pattern += "/";
    }
    // Append filename if not index
    if (!/index\./.test(path.basename(entry.path))) {
      pattern += path.basename(entry.path, ext);
    }
    // Append module export
    if (mod.pattern) {
      if (/^\.\w+$/.test(mod.pattern)) {
        pattern += mod.pattern;
      } else {
        pattern = path.join(pattern, mod.pattern);
      }
    }

    // Add JavaScript module routes
    if (jsExtensions.has(ext)) {
      routeMethods.forEach((method) => {
        const handle = mod[method as keyof RouteModule] as HyperHandle;
        if (typeof handle !== "function") return;
        routes.push({
          method,
          pattern,
          hash,
          order: mod.order ?? undefined,
          render: (...args) => ({
            response: handle(...args),
          }),
        });
      });
    }

    // Add HTML template module route
    if (htmlExtensions.has(ext)) {
      const render: RenderFunction = async ({ request, match, platform }) => {
        // Setup context and props
        const url = new URL(request.url);
        const params = match?.pathname?.groups ?? {};
        const loadProps: RouteLoadProps = {
          ...platform,
          fetch: serverFetch(request, server.router, platform),
          params: structuredClone(params),
          request,
        };
        Object.freeze(loadProps);
        const loadResponse = mod.load ? await mod.load(loadProps) : {};
        if (loadResponse instanceof Response) {
          return {
            response: loadResponse.status === 404 ? undefined : loadResponse,
          };
        }
        const headers = new Headers();
        headers.set("content-type", "text/html; charset=utf-8");
        // if (!server.hypermore.hasTemplate(`tmp-${hash}`)) {
        //   server.hypermore.setTemplate(`tmp-${hash}`, code);
        // }
        // `<tmp-${hash} />`,
        const render = await server.hypermore.render(
          code,
          {
            ...platform.platformProps,
          },
          {
            globalProps: {
              url: url.href,
              deployHash: platform.deployHash,
            },
          },
        );
        return {
          response: new Response(render, { headers }),
        };
      };
      const route: Route = {
        hash,
        pattern,
        render,
        method: "GET",
      };
      if (pattern === "/404") {
        addNoMatch(server, route);
      } else if (pattern === "/500") {
        addError(server, route);
      } else {
        routes.push(route);
      }
    }
  }

  // Sort for router order
  routes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Add to router and manifest
  routes.forEach((route) => {
    server.manifest.routes.push(route);
    const input = new URLPattern({ pathname: route.pattern });
    const key = route.method.toLowerCase() as Lowercase<Route["method"]>;
    server.router[key](input, async (props) => {
      const render = await route.render(props);
      const { response } = await Promise.resolve(
        server.router.resolve(props.request, render.response),
      );
      return response;
    });
  });
};

const addError = (server: Hyperserve, route: Route) => {
  const handle: HyperHandle = async (props) => {
    const render = await route.render(props);
    return server.router.resolve(props.request, render.response);
  };
  server.router.onError = async (error, request, platform) => {
    console.error(error);
    const defaultResponse = new Response(null, { status: 500 });
    if (!sendBody(request)) {
      return defaultResponse;
    }
    const { response } = await server.router.resolve(
      request,
      handle({
        request,
        platform,
        stopPropagation: () => {},
        match: new URLPattern({ pathname: "*" }).exec(request.url)!,
      }),
    );
    if (!response) {
      return defaultResponse;
    }
    return new Response(await response.text(), {
      status: 500,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  };
};

const addNoMatch = (server: Hyperserve, route: Route) => {
  const handle: HyperHandle = async (props) => {
    const render = await route.render(props);
    return server.router.resolve(props.request, render.response);
  };
  server.router.onNoMatch = async (request, platform) => {
    const defaultResponse = new Response(null, { status: 404 });
    if (!sendBody(request)) {
      return defaultResponse;
    }
    const { response } = await server.router.resolve(
      request,
      handle({
        request,
        platform,
        stopPropagation: () => {},
        match: new URLPattern({ pathname: "*" }).exec(request.url)!,
      }),
    );
    if (!response) {
      return defaultResponse;
    }
    return new Response(await response.text(), {
      status: 404,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  };
};
