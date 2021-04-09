import { DuplicateRoute, IllegalMethodError } from "./error.ts";
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
    routeFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, routeFunction, "HEAD");
  }

  public options<T extends Context = Context>(
    route: string,
    routeFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, routeFunction, "OPTIONS");
  }

  public get<T extends Context = Context>(
    route: string,
    routeFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, routeFunction, "GET");
  }

  public put<T extends Context = Context>(
    route: string,
    routeFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, routeFunction, "PUT");
  }

  public patch<T extends Context = Context>(
    route: string,
    routeFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, routeFunction, "PATCH");
  }

  public post<T extends Context = Context>(
    route: string,
    routeFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, routeFunction, "POST");
  }

  public delete<T extends Context = Context>(
    route: string,
    routeFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, routeFunction, "DELETE");
  }

  private addEntry<T extends Context>(
    route: string,
    routeFunction: Middleware<T>,
    method: HTTPMethods,
  ): void {
    if (!this.allowedMethods.includes(method)) {
      throw new IllegalMethodError(this.allowedMethods, method);
    }

    const key: Entry<T> = {
      path: this.#baseRoute + route,
      route: encodeURI(this.#baseRoute + route),
      method: method,
      routeFunction: routeFunction,
    };

    if (this.routesOBJ[key.route]) throw new DuplicateRoute(key.path);
    this.routesOBJ[key.route] = key;
    return;
  }
}
