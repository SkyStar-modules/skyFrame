import { parry, serve } from "../deps.ts";
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
      this.#generalFunctions.push(parry(middleware));
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
      let ctx = {
        response: {
          body: undefined,
          status: undefined,
          headers: new Headers(),
        },
      } as Context;

      if (hasGeneralFunctions) {
        for (const generalFunc of this.#generalFunctions) {
          ctx = await generalFunc(ctx);
        }
      }
      // Execute unique route function
      if (route) ctx = await route.routeFunction(ctx, req, route, queryString);

      // Check if status should be 404
      if (!ctx.response.body && !ctx.response.status) ctx.response.status = 404;

      // Respond to request
      req.respond({
        body: ctx.response.body,
        headers: new Headers(ctx.response.headers),
        status: ctx.response.status,
      });
    }
  }
}
