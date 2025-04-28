import type { HyperManifest, HyperOptions, HyperPlatform } from "./types.ts";
import { Hypermore } from "@dbushell/hypermore";
import { Router } from "@ssr/velocirouter";
import * as path from "@std/path";
import Cookies from "./cookies.ts";
import { encodeHash } from "./utils.ts";
import * as middleware from "./middleware/mod.ts";

export class Hyperserve {
  #initialized = false;
  #dir: string;
  #hypermore!: Hypermore;
  #manifest!: HyperManifest;
  #options: HyperOptions;
  #router!: Router<HyperPlatform>;
  #server!: Deno.HttpServer;

  constructor(dir?: string, options: HyperOptions = {}) {
    // Ensure absolute path
    this.#dir = path.resolve(dir ?? Deno.cwd(), "./");
    // Setup options
    const defaultOptions: HyperOptions = {
      origin: Deno.env.has("ORIGIN")
        ? new URL(Deno.env.get("ORIGIN")!)
        : undefined,
      static: "static",
      unhandledRejection: (error: PromiseRejectionEvent) => {
        error.preventDefault();
        console.error(error.reason);
      },
      rejectionHandled: (error: PromiseRejectionEvent) => {
        error.preventDefault();
        console.error(error.reason);
      },
    };
    this.#options = {
      ...defaultOptions,
      ...(options ?? {}),
    };
  }

  get dev(): boolean {
    return this.options.dev ?? false;
  }

  get dir(): string {
    return this.#dir;
  }

  get deployHash(): string {
    return this.manifest.deployHash;
  }

  get initialized(): boolean {
    return this.#initialized;
  }

  get manifest(): HyperManifest {
    return this.#manifest;
  }

  get options(): HyperOptions {
    return this.#options;
  }

  get origin(): URL | undefined {
    return this.options.origin;
  }

  get hypermore(): Hypermore {
    if (!this.initialized) throw new Error("Not initalized");
    return this.#hypermore;
  }

  get router(): Router<HyperPlatform> {
    if (!this.initialized) throw new Error("Not initialized");
    return this.#router;
  }

  get server(): Deno.HttpServer {
    if (!this.initialized) throw new Error("Not initialized");
    return this.#server;
  }

  /** Hash a value with the deploy hash */
  hash(value: string, salt = ""): Promise<string> {
    return encodeHash(value + salt + this.deployHash);
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    this.#initialized = true;

    if (this.dev) {
      performance.mark("init-start");
    }

    globalThis.addEventListener(
      "unhandledrejection",
      this.options.unhandledRejection!,
    );
    globalThis.addEventListener(
      "rejectionhandled",
      this.options.rejectionHandled!,
    );

    const deployHash = await encodeHash(
      // Use build environment variable
      Deno.env.get("DEPLOY_HASH") ??
        // Use unique startup date
        Date.now().toString(),
    );

    // Create manifest
    this.#manifest = {
      deployHash,
      routes: [],
    };

    // Setup preprocessor
    this.#hypermore = new Hypermore();

    // Setup route
    this.#router = new Router<HyperPlatform>({
      onError: (error: unknown) => {
        console.error(error);
        return new Response(null, { status: 500 });
      },
    });

    // Setup middleware
    const builtin = [
      middleware.templates,
      middleware.proxy,
      middleware.static,
      middleware.routes,
      middleware.redirect,
      middleware.policy,
    ];
    for (const callback of builtin) {
      await Promise.resolve(callback(this));
    }

    if (this.dev) {
      for (const route of this.manifest.routes) {
        console.log(`🪄 ${route.method} → ${route.pattern}`);
      }
    }

    // Setup server
    this.#server = Deno.serve(
      this.options.serve ?? {},
      async (request, info) => {
        if (this.dev) {
          performance.mark("request-start");
        }
        const cookies = new Cookies(request.headers);
        const platform: HyperPlatform = {
          info,
          cookies,
          deployHash: this.deployHash,
          platformProps: {},
        };
        Object.freeze(platform);
        const response = await this.router.handle(request, platform);
        cookies.headers(response);
        if (this.dev && request.url.endsWith("/")) {
          performance.mark("request-end");
          const time = performance.measure(
            "request",
            "request-start",
            "request-end",
          );
          console.log(`🛸 ${time.duration.toFixed(2)}ms (${request.url})`);
        }
        return response;
      },
    );

    // Cleanup server
    this.server.finished.then(() => {
      globalThis.removeEventListener(
        "unhandledrejection",
        this.options.unhandledRejection!,
      );
      globalThis.removeEventListener(
        "rejectionhandled",
        this.options.rejectionHandled!,
      );
    });

    if (this.dev) {
      performance.mark("init-end");
      const time = performance.measure("init", "init-start", "init-end");
      console.log(
        `🛸 Hyperserve ${time.duration.toFixed(2)}ms (${this.deployHash})`,
      );
      if (this.origin) console.log(this.origin.href);
    }
  }
}
