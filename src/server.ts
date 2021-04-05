import { serve, ServerRequest } from "../deps.ts";
import { Router } from "./router.ts";
import type { Context, Middleware } from "../typings/server.ts";
import type { Entry } from "../typings/router.ts";

export class Application extends Router {
  public port: number | undefined;
  #logFunc: Middleware[] = [];

  public constructor() {
    super("");
    return;
  }

  public use(middleware: Router | Middleware): void {
    if (typeof middleware === "function") {
      this.#logFunc.push(middleware);
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

    for await (const request of serve({ port: this.port })) {
      const [url, queryString] = request.url.split("?");
      const route: Entry | undefined = this.routesMap.get(url);

      if (route) {
        const ctx: Context = this.createContext(
          request,
          route.route,
          queryString,
        );

        if (this.#logFunc) for (const callfunc of this.#logFunc) callfunc(ctx);
        await route.routeFunction(ctx);

        request.respond({
          ...ctx.response,
        });
      } else if (route404) {
        const ctx: Context = this.createContext(
          request,
          route404.route,
          queryString,
        );

        if (this.#logFunc) for (const callfunc of this.#logFunc) callfunc(ctx);

        await route404.routeFunction(ctx);

        request.respond({
          ...ctx.response,
        });
      } else {
        const ctx: Context = this.createContext(request, "undefined");

        if (this.#logFunc) {
          for (const callfunc of this.#logFunc) {
            callfunc(ctx);
          }

          request.respond({
            ...ctx.response,
          });
        } else {
          request.respond({
            status: 404,
          });
        }
      }
    }
  }

  private createContext(
    req: ServerRequest,
    path: string,
    query?: string | undefined,
  ): Context {
    const remoteAdress = req.conn.remoteAddr as Deno.NetAddr;
    return {
      query: query ? this.createQuery(query) : query,
      request: {
        body: req.body,
        headers: req.headers,
        url: req.url,
        path: path,
        method: req.method,
        ip: remoteAdress.hostname,
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
