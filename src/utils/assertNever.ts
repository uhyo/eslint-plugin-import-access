export function assertNever(value: never): never {
  throw new Error(`Assertion Failure: '${value}' is not never`);
}
