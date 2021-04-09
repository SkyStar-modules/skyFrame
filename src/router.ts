import { DuplicateRoute, IllegalMethodError } from "./error.ts";
import { createFunction } from "./utils.ts";
import type { Entry, HTTPMethods } from "../typings/router.ts";
import type { Context, Middleware } from "../typings/server.ts";

export class Router {
  #baseRoute: string;
  public classtype = "ROUTER";
  public allowedMethods: HTTPMethods[] = [
    "HEAD",
    "OPTIONS",
    "GET",
    "PUT",
    "PATCH",
    "POST",
    "DELETE",
  ];
  // deno-lint-ignore no-explicit-any
  public routesOBJ: Record<string, Entry<any>> = {};

  constructor(route: string, methods?: HTTPMethods[]) {
    this.#baseRoute = route;
    if (methods) this.allowedMethods = methods;
    return;
  }

  public head<T extends Context = Context>(
    route: string,
    middleWareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middleWareFunction, "HEAD");
  }

  public options<T extends Context = Context>(
    route: string,
    middleWareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middleWareFunction, "OPTIONS");
  }

  public get<T extends Context = Context>(
    route: string,
    middleWareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middleWareFunction, "GET");
  }

  public put<T extends Context = Context>(
    route: string,
    middleWareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middleWareFunction, "PUT");
  }

  public patch<T extends Context = Context>(
    route: string,
    middleWareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middleWareFunction, "PATCH");
  }

  public post<T extends Context = Context>(
    route: string,
    middleWareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middleWareFunction, "POST");
  }

  public delete<T extends Context = Context>(
    route: string,
    middleWareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middleWareFunction, "DELETE");
  }

  private addEntry<T extends Context>(
    route: string,
    middleWareFunction: Middleware<T>,
    method: HTTPMethods,
  ): void {
    if (!this.allowedMethods.includes(method)) {
      throw new IllegalMethodError(this.allowedMethods, method);
    }

    const key: Entry<T> = {
      path: this.#baseRoute + route,
      route: encodeURI(this.#baseRoute + route),
      method: method,
      routeFunction: createFunction(middleWareFunction),
    };

    if (this.routesOBJ[key.route]) throw new DuplicateRoute(key.path);
    this.routesOBJ[key.route] = key;
    return;
  }
}
