import { ConOptions, Context } from "../typings/server.ts";
import { MapKey } from "../typings/router.ts";
import { serve, ServerRequest } from "../deps.ts";
import { Router } from "./router.ts";

export class Application extends Router {
  public port: number | undefined;

  public constructor() {
    super("");
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
    for await (const request of serve({ port: this.port })) {
      const route: MapKey | undefined = this.routesMap.get(request.url);
      if (route) {
        const ctx: Context = this.createContext(request, route.route);
        route.cb(ctx);
        request.respond({
          ...ctx.response,
        });
      }
    }
  }

  private createContext(req: ServerRequest, path: string) {
    const remoteAdress = req.conn.remoteAddr as Deno.NetAddr;
    return {
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
}
