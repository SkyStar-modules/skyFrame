import { ServerRequest } from "../deps.ts";
import { Context } from "../typings/index.ts";

export function createContext(request: ServerRequest) {
  const obj: Context = {
    request: {
      body: request.body,
      headers: request.headers,
      url: request.url,
      method: request.method,
      ip: request.conn.remoteAddr,
    },
    response: {
      headers: new Headers(),
      body: "",
      status: 200,
    },
  };
  return obj;
}
