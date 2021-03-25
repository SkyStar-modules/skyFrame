export interface SendOptions {
  file: string;
  directory: string;
}

export interface CacheKey {
  file: Uint8Array;
  mimetype: string | undefined;
}
