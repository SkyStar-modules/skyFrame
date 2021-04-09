import type { Entry, HTTPMethods } from "./router.ts";
import type { ServerRequest } from "../deps.ts";

export interface ConnectionOptions {
  cert?: string;
  keyFile?: string;
  name: string;
}

export interface Context {
  readonly request: {
    body: string | Uint8Array | Deno.Reader;
    url: string;
    path: string;
    headers: Headers;
    method: HTTPMethods | string;
    ip: string;
  };
  response: {
    body: string | Uint8Array | Deno.Reader | undefined;
    headers: Headers;
    status: number | undefined;
  };
}
export interface CreateFunc<T extends Context = Context> {
  (
    context: T,
    req: ServerRequest,
    route: Entry<T>,
    query: string,
  ): Promise<T> | T;
}
export interface Middleware<T extends Context = Context> {
  (context: T): Promise<T> | T;
}
