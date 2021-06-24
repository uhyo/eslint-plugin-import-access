export function concatArrays<Elm>(
  ...arrs: readonly (readonly Elm[] | undefined)[]
): Elm[] | undefined {
  let result: Elm[] | undefined;
  for (const arr of arrs) {
    if (arr?.length) {
      result ||= [];
      result = result.concat(arr);
    }
  }
  return result;
}
