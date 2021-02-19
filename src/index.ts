import { ConOptions, Context } from "../typings/index.ts";
import { MapKey } from "../typings/router.ts";
import { serve, ServerRequest } from "../deps.ts";
import { Router } from "./router.ts";
export class Application extends Router {
  private cert: string|undefined;
  public name: string|undefined;
  public port: number|undefined;
  public appRoutes: string[] = [];

  public constructor(options?: ConOptions) {
    super("/");
    this.cert = options?.cert;
    this.name = options?.name
    return;
  }

  public use(Router: Router): void {
    for (const routes of Router.routesMap.values()) {
      this.routesMap.set(Router.baseRoute + routes.route, routes);
    }
    return;
  }

  public async listen(port: number): Promise<void> {
    this.port = port;
    if (!this.port) throw "port is undefined";
    const server = serve({port: this.port});
    for await (const req of server) {
      console.log(req.url);
      const router: MapKey|undefined = this.routesMap.get(req.url);
      if (router) {
        const context = this.createContext(req, router.route);
        console.log(context.response.body);
        router.cb(context);
        console.log(context);
        req.respond({
          body: context.response.body,
          headers: (context.response.headers) ? context.response.headers : undefined
        });
      }
    }
    return;
  }

  private createContext(req: ServerRequest, route: string) {
    const obj = {
      response: {
        body: "",
        headers: new Headers()
      },
      request: {
        url: req.url,
        path: route,
        headers: req.headers,
        method: req.method
      }
    }
    return obj;
  }
}