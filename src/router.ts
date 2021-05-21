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
  public _routesOBJ: Record<string, Record<string, Entry<any>>> = {
    HEAD: {},
    OPTIONS: {},
    GET: {},
    PUT: {},
    PATCH: {},
    POST: {},
    DELETE: {},
  };

  constructor(route: string, methods?: HTTPMethods[]) {
    this.#baseRoute = route;
    if (methods) this.allowedMethods = methods;
    return;
  }

  public head<T extends Context = Context>(
    route: string,
    middlewareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middlewareFunction, "HEAD");
  }

  public options<T extends Context = Context>(
    route: string,
    middlewareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middlewareFunction, "OPTIONS");
  }

  public get<T extends Context = Context>(
    route: string,
    middlewareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middlewareFunction, "GET");
  }

  public put<T extends Context = Context>(
    route: string,
    middlewareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middlewareFunction, "PUT");
  }

  public patch<T extends Context = Context>(
    route: string,
    middlewareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middlewareFunction, "PATCH");
  }

  public post<T extends Context = Context>(
    route: string,
    middlewareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middlewareFunction, "POST");
  }

  public delete<T extends Context = Context>(
    route: string,
    middlewareFunction: Middleware<T>,
  ): void {
    return this.addEntry<T>(route, middlewareFunction, "DELETE");
  }

  private addEntry<T extends Context>(
    route: string,
    middlewareFunction: Middleware<T>,
    method: HTTPMethods,
  ): void {
    if (!this.allowedMethods.includes(method)) {
      throw new IllegalMethodError(this.allowedMethods, method);
    }

    const key: Entry<T> = {
      path: this.#baseRoute + route,
      route: encodeURI(this.#baseRoute + route),
      method: method,
      middlewareFunction: middlewareFunction,
    };

    if (this._routesOBJ[method][key.route]) throw new DuplicateRoute(key.path);
    this._routesOBJ[method][key.route] = key;
    return;
  }
}
