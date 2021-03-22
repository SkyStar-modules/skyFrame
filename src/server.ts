import { ConOptions, Context } from "../typings/server.ts";
import { MapKey } from "../typings/router.ts";
import { serve, ServerRequest } from "../deps.ts";
import { Router } from "./router.ts";

export class Application extends Router {
  public port: number | undefined;
  public logFunc: CallableFunction | undefined;
  #settings: Record<string, string | number> = {
    
  };

  public constructor() {
    super("");
    return;
  }

  public logger(cb: CallableFunction) {
    this.logFunc = cb;
  }

  public use(router: Router): void {
    for (const [route, routeData] of router.routesMap.entries()) {
      this.routesMap.set(route, routeData);
    }
    return;
  }
  public async listen(port: number): Promise<void> {
    this.port = port;
    for await (const request of serve({ port: this.port })) {
      const route: MapKey | undefined = this.routesMap.get(request.url.split("?")[0]);
      if (route) {
        const ctx: Context = this.createContext(request, route.route);
        route.cb(ctx);
        request.respond({
          ...ctx.response,
        });
      } else if (this.routesMap.has("*")) {
        const route404: MapKey = this.routesMap.get("*");
        const ctx: Context = this.createContext(request, route404.route);
        route404.cb(ctx);
        request.respond({
          ...ctx.response,
        });
        
      } else {
        request.respond({
          status: 404
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

  private createQuery(req: ServerRequest, path: string): Record<string, unknown> {
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
