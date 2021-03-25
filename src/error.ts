import type { HTTPMethods } from "../typings/router.ts";

export class IllegalMethodError extends Error {
  message: string;
  name = "IllegalMethodError";

  public constructor(
    allowed: HTTPMethods[],
    method: HTTPMethods,
  ) {
    super();
    this.message = `${allowed} does not include ${method}`;
  }
}
