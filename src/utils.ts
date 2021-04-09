import { MEDIA_TYPES } from "./media_types.ts";
import type { ServerRequest } from "../deps.ts";
import type { Context, CreateFunc, Middleware } from "../typings/server.ts";
import type { Entry } from "../typings/router.ts";
import type { CacheKey, SendOptions } from "../typings/utils.ts";

const cache = new Map<string, CacheKey>();

export async function send<T extends Context = Context>(
  ctx: T,
  options: SendOptions,
): Promise<void> {
  const fileLocation = (options.directory + options.file).replace(
    /\/\/|\\\\/g,
    "/",
  );

  // Get mime type
  const temp = fileLocation.split(".");
  const mime: string = MEDIA_TYPES[temp[temp.length - 1]] ?? "text/plain";

  if (options.cache) {
    // Check for possible cache
    const cacheOBJ = cache.get(fileLocation);

    if (!cacheOBJ) {
      // Get file
      const dataPromise: Promise<Uint8Array> = Deno.readFile(fileLocation);

      // Check cache size
      const maxCacheSize = typeof options.cache === "number"
        ? options.cache
        : 50;

      if (cache.size >= maxCacheSize) cache.clear();

      // Set response body/header
      ctx.response.headers.set("content-type", mime);
      const data = await dataPromise;
      ctx.response.body = data;

      // Add file to cache
      cache.set(fileLocation, { file: data, mimetype: mime });
    } else {
      // Set response body/header
      ctx.response.headers.set("content-type", cacheOBJ.mimetype);
      ctx.response.body = cacheOBJ.file;
    }
  } else {
    // Get file
    const dataPromise: Promise<Uint8Array> = Deno.readFile(fileLocation);

    // Set response body/header
    const data = await dataPromise;
    ctx.response.headers.set("content-type", mime);
    ctx.response.body = data;
  }
  return;
}

export function createQuery(query: string): Record<string, string> {
  const obj: Record<string, string> = {};
  if (query.includes("%")) query = decodeURI(query);
  const querystring = query.split("&");
  for (const kvString of querystring) {
    const kv = kvString.split("=");
    obj[kv[0]] = kv[1];
  }
  return obj;
}

export function createFunction<T extends Context = Context>(
  func: Middleware<T>,
): CreateFunc<T> {
  const middlewareFunction = async function (
    context: T,
    req: ServerRequest,
    route: Entry<T>,
    queryString: string,
  ) {
    if (!context.request) {
      context = {
        query: !queryString ? queryString : createQuery(queryString),
        request: {
          body: req.body,
          headers: req.headers,
          url: req.url,
          path: route?.path ?? "undefined",
          method: req.method,
          ip: (req.conn.remoteAddr as Deno.NetAddr).hostname,
        },
        response: {
          headers: new Headers(),
          body: undefined,
          status: undefined,
        },
      } as unknown as T;
    }
    return await func(context);
  };
  return middlewareFunction;
}
