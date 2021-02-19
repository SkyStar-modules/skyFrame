export type HTTPMethods =
  | "HEAD"
  | "OPTIONS"
  | "GET"
  | "PUT"
  | "PATCH"
  | "POST"
  | "DELETE";

export interface MapKey {
  route: string;
  id: number;
  cb: CallableFunction;
  method: HTTPMethods;
}

export interface Entry {
  route: string;
  cb: CallableFunction;
  method: HTTPMethods;
}