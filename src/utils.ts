import { MEDIA_TYPES } from "./media_types.ts";
import { Context } from "../typings/server.ts";
import { CacheKey, SendOptions } from "../typings/utils.ts";

const cache = new Map<string, CacheKey>();

export async function send(ctx: Context, options: SendOptions): Promise<void> {
  const fileLocation = (options.directory + options.file).replace(
    /\/\/|\\\\/g,
    "/",
  );

  const cacheOBJ = cache.get(fileLocation);
  if (!cacheOBJ) {
    const temp = fileLocation.split(".");
    const dataPromise: Promise<Uint8Array> = Deno.readFile(fileLocation);
    let mime: string | undefined = MEDIA_TYPES[temp[temp.length - 1]];
    const data = await dataPromise;

    if (!mime) mime = "text/plain";

    ctx.response.headers.set("content-type", mime);
    ctx.response.body = data;
    cache.set(fileLocation, { file: data, mimetype: mime });
  } else {
    if (cacheOBJ.mimetype) {
      ctx.response.headers.set("content-type", cacheOBJ.mimetype);
    }
    ctx.response.body = cacheOBJ.file;
  }
  return;
}
