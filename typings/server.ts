import { HTTPMethods } from "./router.ts";

export interface ConnectionOptions {
  cert?: string;
  keyFile?: string;
  name: string;
}

export interface Context {
  query: Record<string, string> | null;
  request: {
    body: string | Uint8Array | Deno.Reader;
    url: string;
    path: string;
    headers: Headers;
    method: HTTPMethods | string;
    ip: string;
  };
  response: {
    body: string | Uint8Array | Deno.Reader;
    headers: Headers;
    status: number;
  };
}

export interface Middleware<
  T extends Context = Context,
> extends CallableFunction {
  (context: T): Promise<void> | void;
}
