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
  method: HTTPMethods;

}
interface ResContext {
  body: any;
}