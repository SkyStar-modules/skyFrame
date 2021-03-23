import type { Context } from "../typings/server.ts";
import type { Options } from "../typings/utils.ts";

const cache = new Map<string, Uint8Array>();

export async function send(ctx: Context, options: Options): Promise<void> {
  const fileLocation = (options.directory + options.file).replace(
    /\/\/|\\\\/g,
    "/",
  );
  const cachedFile = cache.get(fileLocation);
  if (cachedFile) ctx.response.body = cachedFile;
  else {
    const data: Uint8Array = await Deno.readFile(fileLocation);
    ctx.response.body = data;
    cache.set(fileLocation, data);
  }
  return;
}
