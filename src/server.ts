import { serve, ServerRequest } from "../deps.ts";
import { Router } from "./router.ts";
import { Context, Middleware } from "../typings/server.ts";
import { Entry } from "../typings/router.ts";

export class Application extends Router {
  public port: number | undefined;
  #logFunc: Middleware | undefined;

  public constructor() {
    super("");
    return;
  }

  public logger(logFunction: Middleware): void {
    this.#logFunc = logFunction;
    return;
  }

  public use(router: Router): void {
    for (const [route, routeData] of router.routesMap.entries()) {
      this.routesMap.set(route, routeData);
    }
    return;
  }

  public async listen(port: number): Promise<void> {
    this.port = port;
    const route404: Entry | undefined = this.routesMap.get("*");

    for await (const request of serve({ port: this.port })) {
      const route: Entry | undefined = this.routesMap.get(
        request.url.split("?")[0],
      );
      if (route) {
        const ctx: Context = this.createContext(request, route.route);
        if (this.#logFunc) await this.#logFunc(Object.freeze({ ...ctx }));
        await route.routeFunction(ctx);

        await request.respond({
          ...ctx.response,
        });
      } else if (route404) {
        const ctx: Context = this.createContext(request, route404.route);
        if (this.#logFunc) await this.#logFunc(Object.freeze({ ...ctx }));
        await route404.routeFunction(ctx);

        await request.respond({
          ...ctx.response,
        });
      } else {
        const ctx: Context = this.createContext(request, "undefined");
        if (this.#logFunc) await this.#logFunc(Object.freeze({ ...ctx }));
        await request.respond({
          status: 404,
        });
      }
    }
  }

  private createContext(req: ServerRequest, path: string) {
    const remoteAdress = req.conn.remoteAddr as Deno.NetAddr;
    return {
      query: (req.url.includes("?") ? this.createQuery(req, path) : null),
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

  private createQuery(
    req: ServerRequest,
    path: string,
  ): Record<string, string> {
    const obj: Record<string, string> = {};
    const querystring = req.url.replace(`${path}?`, "").split("&");

    for (const entry of querystring.values()) {
      const [key, value] = entry.split("=");
      obj[key] = value;
    }

    return obj;
  }
}
