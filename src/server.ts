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

    for await (const request of serve({ port: port })) {
      // URL splitting
      const urlSpliced: string[] = request.url.split("?");
      const url: string = urlSpliced[0];
      const queryString: string | undefined = urlSpliced[1];

      // Get possible callable function
      const route: Entry | undefined = this.routesMap.get(url) ?? route404;

      // Create context
      const ctx = this.createContext(
        request,
        route?.route ?? "undefined",
        queryString,
      );

      // Execute all callable function
      if (hasGeneralFunctions) {
        for (const callFunc of this.#generalFunctions) callFunc(ctx);
      }

      // Execute unique route function
      if (route) await route.routeFunction(ctx);

      request.respond({
        body: ctx.response.body,
        headers: ctx.response.headers,
        status: ctx.response.status,
      });
    }
  }

  private createContext(
    req: ServerRequest,
    path: string,
    query?: string | undefined,
  ): Context {
    return {
      query: !query ? query : this.createQuery(query),
      request: {
        body: req.body,
        headers: req.headers,
        url: req.url,
        path: path,
        method: req.method,
        ip: (req.conn.remoteAddr as Deno.NetAddr).hostname,
      },
      response: {
        headers: new Headers(),
        body: "",
        status: 200,
      },
    } as Context;
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
