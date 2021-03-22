import type { HTTPMethods, MapKey } from "../typings/router.ts";
import { IllegalMethodError } from "./error.ts";

export class Router {
  private baseRoute: string;
  public allowedMethods: HTTPMethods[] = [
    "HEAD",
    "OPTIONS",
    "GET",
    "PUT",
    "PATCH",
    "POST",
    "DELETE",
  ];
  public routesMap = new Map<string, MapKey>();

  constructor(route: string, methods?: HTTPMethods[]) {
    this.baseRoute = route;
    if (methods) this.allowedMethods = methods;
    return;
  }

  public head(route: string, cb: CallableFunction): void {
    return this.addEntry(route, cb, "HEAD");
  }

  public options(route: string, cb: CallableFunction): void {
    return this.addEntry(route, cb, "OPTIONS");
  }

  public get(route: string, cb: CallableFunction): void {
    return this.addEntry(route, cb, "GET");
  }

  public put(route: string, cb: CallableFunction): void {
    return this.addEntry(route, cb, "PUT");
  }

  public patch(route: string, cb: CallableFunction): void {
    return this.addEntry(route, cb, "PATCH");
  }

  public post(route: string, cb: CallableFunction): void {
    return this.addEntry(route, cb, "POST");
  }

  public delete(route: string, cb: CallableFunction): void {
    return this.addEntry(route, cb, "DELETE");
  }

  private addEntry(
    route: string,
    cb: CallableFunction,
    method: HTTPMethods,
  ): void {
    if (!this.allowedMethods.includes(method)) {
      throw new IllegalMethodError(this.allowedMethods, method);
    }
    const key: MapKey = {
      route:
        (this.baseRoute.endsWith("/")
          ? this.baseRoute + route
          : this.baseRoute + "/" + route),
      method: method,
      cb: cb,
    };
    this.routesMap.set(key.route, key);
    return;
  }
}
