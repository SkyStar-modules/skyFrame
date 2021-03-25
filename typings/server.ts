import type { HTTPMethods } from "./router.ts";

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

interface AsyncCallableRoute {
  (context: Context): Promise<void>;
}

interface CallableRoute {
  (context: Context): void;
}

export type RouterRoute = AsyncCallableRoute | CallableRoute;
