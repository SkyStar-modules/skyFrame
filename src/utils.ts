import { MEDIA_TYPES } from "./media_types.ts";
import type { Context } from "../typings/server.ts";
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
