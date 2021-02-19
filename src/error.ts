import * as RouterTypes from "../typings/router.ts"

export class IllegalMethodError extends Error {
  message: string;
  name = "IllegalMethodError";

  public constructor(allowed:RouterTypes.HTTPMethods[], method: RouterTypes.HTTPMethods) {
    super();
    this.message = `only ${allowed} does not include ${method}`;
  }
}