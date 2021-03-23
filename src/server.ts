import { Context } from "../typings/server.ts";
import { MapKey } from "../typings/router.ts";
import { serve, ServerRequest } from "../deps.ts";
import { Router } from "./router.ts";

export class Application extends Router {
  public port: number | undefined;
  public logFunc: CallableFunction | undefined;

  public constructor() {
    super("");
    return;
  }

  public logger(cb: CallableFunction): void {
    this.logFunc = cb;
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
    const route404: MapKey | undefined = this.routesMap.get("*");

    for await (const request of serve({ port: this.port })) {
      const route: MapKey | undefined = this.routesMap.get(
        request.url.split("?")[0],
      );
      if (route) {
        const ctx: Context = this.createContext(request, route.route);
        if (this.logFunc) await this.logFunc(ctx);
        await route.cb(ctx);

        await request.respond({
          ...ctx.response,
        });
      } else if (route404) {
        const ctx: Context = this.createContext(request, route404.route);
        if (this.logFunc) await this.logFunc(ctx);
        await route404.cb(ctx);

        await request.respond({
          ...ctx.response,
        });
      } else {
        const ctx: Context = this.createContext(request, "undefined");
        if (this.logFunc) await this.logFunc(ctx);
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
  ): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    const querystring = req.url.replaceAll(`${path}?`, "").split("&");
    const length = querystring.length;

    for (let i = 0; i < length; i++) {
      const [key, value] = querystring[i].split("=");
      obj[key] = value;
    }

    return obj;
  }
}
