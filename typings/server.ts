import { HTTPMethods } from "./router.ts";
export interface ConOptions {
  cert?: string;
  keyFile?: string;
  name: string;
}

export interface Context extends Record<string, unknown> {
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
