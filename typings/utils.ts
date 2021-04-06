export interface SendOptions {
  file: string;
  directory: string;
  cache?: boolean | number;
}

export interface CacheKey {
  file: Uint8Array;
  mimetype: string;
}
