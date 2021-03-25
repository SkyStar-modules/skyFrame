import { Middleware, Context } from "./server.ts";

export type HTTPMethods =
  | "HEAD"
  | "OPTIONS"
  | "GET"
  | "PUT"
  | "PATCH"
  | "POST"
  | "DELETE";

export interface Entry<T extends Context = Context> {
  route: string;
  routeFunction: Middleware<T>;
  method: HTTPMethods;
}
