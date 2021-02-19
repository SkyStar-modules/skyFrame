import type { HTTPMethods, MapKey, Entry } from "../typings/router.ts";
import { IllegalMethodError } from "./error.ts";
import { stringToRegex } from "./utils.ts";
export class Router {
  #i = 0;
  public baseRoute: string;
  public allowedMethods: HTTPMethods[] = ["HEAD", "OPTIONS", "GET", "PUT", "PATCH", "POST", "DELETE"];
  public routesMap = new Map<string, MapKey>();

  constructor(route:string, methods?: HTTPMethods[]) {
    this.baseRoute = route;
    if (methods) this.allowedMethods = methods;
  }

  public head(route: string, cb:CallableFunction): void {
    this.addEntry(this.formatEntry(route, cb, "HEAD"));
    return;
  }

  public options(route: string, cb: CallableFunction): void {
    this.addEntry(this.formatEntry(route, cb, "OPTIONS"));
    return;
  }

  public get(route: string, cb: CallableFunction): void {
    this.addEntry(this.formatEntry(route, cb, "GET"));
  }

  public put(route: string, cb:CallableFunction): void {
    this.addEntry(this.formatEntry(route, cb, "PUT"));
    return;
  }

  public patch(route: string, cb: CallableFunction): void {
    this.addEntry(this.formatEntry(route, cb, "PATCH"));
    return;
  }

  public post(route: string, cb: CallableFunction): void {
    this.addEntry(this.formatEntry(route, cb, "POST"));
  }
  
  public delete(route: string, cb: CallableFunction): void {
    this.addEntry(this.formatEntry(route, cb, "DELETE"));
  }

  private addEntry(entry: Entry): void {
    if (!this.allowedMethods.includes(entry.method)) throw new IllegalMethodError(this.allowedMethods, entry.method);
    const key: MapKey = {
      route: entry.route,
      id: this.#i++,
      method: entry.method,
      cb: entry.cb
    }
    this.routesMap.set(stringToRegex(entry.route), key);
    return;
  }

  private formatEntry(route: string, cb: CallableFunction, method: HTTPMethods): Entry {
    const formattedOBJ: Entry = {
      route: route,
      cb: cb,
      method: method
    }
    return formattedOBJ;
  }
}