import type { RouterRoute } from "./server.ts";

export type HTTPMethods =
  | "HEAD"
  | "OPTIONS"
  | "GET"
  | "PUT"
  | "PATCH"
  | "POST"
  | "DELETE";

export interface Entry {
  route: string;
  routeFunction: RouterRoute;
  method: HTTPMethods;
}
