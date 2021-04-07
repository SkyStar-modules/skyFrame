import { serve, ServerRequest } from "../deps.ts";
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
      for (const [route, routeData] of middleware.routesMap) {
        this.routesMap.set(route, routeData);
      }
    }
    return;
  }

  public async listen(port: number): Promise<void> {
    this.port = port;
    const route404: Entry | undefined = this.routesMap.get("*");
    const hasGeneralFunctions: boolean = this.#generalFunctions.length > 0;

    for await (const req of serve({ port: port })) {
      // URL splitting
      const URLS: string[] = req.url.split("?");
      const queryString: string | undefined = URLS[1];

      // Get possible callable function
      const route: Entry | undefined = this.routesMap.get(URLS[0]) ?? route404;

      // Create context
      const ctx: Context = {
        query: !queryString ? queryString : this.createQuery(queryString),
        request: {
          body: req.body,
          headers: req.headers,
          url: req.url,
          path: route?.route ?? "undefined",
          method: req.method,
          ip: (req.conn.remoteAddr as Deno.NetAddr).hostname,
        },
        response: {
          headers: new Headers(),
          body: "",
          status: 200,
        },
      } as Context;

      // Execute all callable function
      if (hasGeneralFunctions) {
        for (const callFunc of this.#generalFunctions) callFunc(ctx);
      }

      // Execute unique route function
      if (route) await route.routeFunction(ctx);

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
    for (const entry of querystring) {
      const [key, value] = entry.split("=");
      obj[key] = value;
    }

    return obj;
  }
}
