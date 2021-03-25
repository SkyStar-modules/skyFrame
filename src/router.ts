import { IllegalMethodError } from "./error.ts";
import { Entry, HTTPMethods } from "../typings/router.ts";
import { Middleware } from "../typings/server.ts";

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
  public routesMap: Map<string, Entry> = new Map<string, Entry>();

  constructor(route: string, methods?: HTTPMethods[]) {
    this.#baseRoute = route;
    if (methods) this.allowedMethods = methods;
    return;
  }

  public head(route: string, routeFunction: Middleware): void {
    return this.addEntry(route, routeFunction, "HEAD");
  }

  public options(route: string, routeFunction: Middleware): void {
    return this.addEntry(route, routeFunction, "OPTIONS");
  }

  public get(route: string, routeFunction: Middleware): void {
    return this.addEntry(route, routeFunction, "GET");
  }

  public put(route: string, routeFunction: Middleware): void {
    return this.addEntry(route, routeFunction, "PUT");
  }

  public patch(route: string, routeFunction: Middleware): void {
    return this.addEntry(route, routeFunction, "PATCH");
  }

  public post(route: string, routeFunction: Middleware): void {
    return this.addEntry(route, routeFunction, "POST");
  }

  public delete(route: string, routeFunction: Middleware): void {
    return this.addEntry(route, routeFunction, "DELETE");
  }

  private addEntry(
    route: string,
    routeFunction: Middleware,
    method: HTTPMethods,
  ): void {
    if (!this.allowedMethods.includes(method)) {
      throw new IllegalMethodError(this.allowedMethods, method);
    }
    const key: Entry = {
      route: this.#baseRoute + route,
      method: method,
      routeFunction: routeFunction,
    };
    this.routesMap.set(key.route, key);
    return;
  }
}
