import type { Context } from "../typings/server.ts";
import type { Options } from "../typings/utils.ts";

const cache = new Map<string, Uint8Array>();

export async function send(ctx: Context, obj: Options): Promise<void> {
  const location = (obj.directory + obj.file).replace(/\/\/|\\\\/g, "/");
  const cachedFile = cache.get(location);
  if (cachedFile) ctx.response.body = cachedFile;
  else {
    const data = await Deno.readFile(location);
    ctx.response.body = data;
    cache.set(location, data);
  }
  return;
}

export function sendSync(ctx: Context, obj: Options): void {
  const location = (obj.directory + obj.file).replace(/\/\/|\\\\/g, "/");
  const cachedFile = cache.get(location);
  if (cachedFile) ctx.response.body = cachedFile;
  else {
    const data = Deno.readFileSync(location);
    ctx.response.body = data;
    cache.set(location, data);
  }
  return;
}
