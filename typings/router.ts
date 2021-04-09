import type { Context, CreateFunc } from "./server.ts";

export type HTTPMethods =
  | "HEAD"
  | "OPTIONS"
  | "GET"
  | "PUT"
  | "PATCH"
  | "POST"
  | "DELETE";

export interface Entry<T extends Context = Context> {
  path: string;
  route: string;
  routeFunction: CreateFunc<T>;
  method: HTTPMethods;
}
