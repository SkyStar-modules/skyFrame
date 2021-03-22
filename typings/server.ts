import { HTTPMethods } from "./router.ts";
export interface ConOptions {
  cert?: string;
  keyFile?: string;
  name: string;
}

export interface Context extends Record<string, unknown> {
  request: ReqContext;
  response: ResContext;
}

interface ReqContext {
  body: string | Uint8Array | Deno.Reader;
  url: string;
  path: string;
  headers: Headers;
  method: HTTPMethods | string;
}
interface ResContext {
  body: string | Uint8Array | Deno.Reader;
  headers: Headers;
  status: number;
}
