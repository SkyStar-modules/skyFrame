import { serve } from "../deps.ts";
import { Router } from "./router.ts";
import type { Context, Middleware } from "../typings/server.ts";
import type { Entry } from "../typings/router.ts";

export class Application extends Router {
  public port: number | undefined;
  #generalFunctions: Middleware[] = [];

  public constructor() {
    super("");
    return;
  }

  public use(middleware: Router | Middleware): void {
    if (typeof middleware === "function") {
      this.#generalFunctions.push(middleware);
    } else {
      for (const [route, routeData] of Object.entries(middleware.routesOBJ)) {
        this.routesOBJ[route] = routeData;
      }
    }
    return;
  }

  public async listen(port: number): Promise<void> {
    this.port = port;
    const route404: Entry | undefined = this.routesOBJ["*"];
    const hasGeneralFunctions: boolean = this.#generalFunctions.length > 0;
    const server = serve({ port: port });

    for await (const req of server) {
      // URL splitting
      const URLS: string[] = req.url.split("?");
      const queryString: string | undefined = URLS[1];

      // Get possible callable function
      const route: Entry | undefined = this.routesOBJ[URLS[0]] ?? route404;

      // Create context
      const ctx: Context = {
        query: !queryString ? queryString : this.createQuery(queryString),
        request: {
          body: req.body,
          headers: req.headers,
          url: req.url,
          path: route?.path ?? "undefined",
          method: req.method,
          ip: (req.conn.remoteAddr as Deno.NetAddr).hostname,
        },
        response: {
          headers: new Headers(),
          body: undefined,
          status: undefined,
        },
      } as Context;

      // Execute all callable function
      if (hasGeneralFunctions) {
        await Promise.all(
          this.#generalFunctions.map((func) => func(ctx as Readonly<Context>)),
        );
      }

      // // Execute unique route function
      if (route) await route.middlewareFunction(ctx);

      // Check if status should be 404
      if (!ctx.response.body && !ctx.response.status) ctx.response.status = 404;

      // Respond to request
      req.respond({
        body: ctx.response.body,
        headers: ctx.response.headers,
        status: ctx.response.status,
      });
    }
  }

  private createQuery(query: string): Record<string, string> {
    const obj: Record<string, string> = {};
    if (query.includes("%")) query = decodeURI(query);
    const querystring = query.split("&");
    for (const kvString of querystring) {
      const kv = kvString.split("=");
      obj[kv[0]] = kv[1];
    }

    return obj;
  }
}
