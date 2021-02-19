import { ConOptions, Context } from "../typings/index.ts";
import { MapKey } from "../typings/router.ts";
import { serve, ServerRequest } from "../deps.ts";
import { Router } from "./router.ts";
import * as utils from "./utils.ts";

export class Application extends Router {
  #cert: string|undefined;
  public name: string|undefined;
  public port: number|undefined;
  public appRoutes: string[] = [];
  public favico: Uint8Array|undefined
  public constructor(options?: ConOptions) {
    super("");
    this.#cert = options?.cert;
    this.name = options?.name
    return;
  }

  public use(router: Router): void {
    for (const routes of router.routesMap.values()) {
      this.routesMap.set(routes.regex, routes);
    }
    return;
  }
  public favicon(path: string): void {
    this.favico = Deno.readFileSync(path);
    return;
  }
  public async listen(port: number): Promise<void> {
    this.port = port;
    if (!this.port) throw "port is undefined";
    const server = serve({port: this.port});
    for await (const req of server) {
      if (req.url === "/favicon.ico") req.respond({body: this.favico, status: 200});
      const router: MapKey|undefined = this.routesMap.get(utils.stringToRegex(req.url));
      if (router) {
        const context = await this.createContext(req, router.route);
        router.cb(context);
        req.respond({
          body: context.response.body
        });
      } else {
        req.respond({
          status: 404
        });
      }
    }
    return;
  }

  private async createContext(req: ServerRequest, route: string) {
    const prom: Promise<Context> = new Promise<Context>((resolve) => resolve({
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
    }));
    return await prom;
  }
}