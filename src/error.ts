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

export class DuplicateRoute extends Error {
  message: string;
  name = "DuplicateRouteError";

  public constructor(
    route: string,
  ) {
    super();
    this.message = `${route} is already used!`;
  }
}
