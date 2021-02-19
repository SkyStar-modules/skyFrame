import { HTTPMethods } from "./router.ts";
export interface ConOptions {
  cert?: string;
  name: string;
}

export interface Context {
  request: ReqContext;
  response: ResContext;
}

interface ReqContext {
  url: string;
  path: string;
  headers: Headers;
  method: HTTPMethods | string;

}
interface ResContext {
  headers: Headers;
  body: string | Uint8Array | Deno.Reader;
}