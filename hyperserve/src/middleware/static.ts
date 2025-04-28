import type { Hyperserve } from "../mod.ts";
import * as fs from "@std/fs";
import * as path from "@std/path";
import { serveDir } from "@std/http/file-server";

/**
 * Middleware to serve static assets
 */
export default (server: Hyperserve): void => {
  if (server.options.static === undefined) return;
  const staticDir = path.resolve(server.dir, server.options.static);
  if (fs.existsSync(staticDir) === false) {
    console.warn(`Missing static directory: "${staticDir}"`);
    return;
  }
  server.router.get(new URLPattern({}), async ({ request }) => {
    const response = await serveDir(request, {
      fsRoot: staticDir,
      quiet: true,
    });
    if (response.ok || response.status === 304) {
      return response;
    }
  });
};
