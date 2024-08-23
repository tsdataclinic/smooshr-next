/**
 * This function takes an API response and throws an error if it has one,
 * otherwise it returns the data itself. This lets us use API functions with
 * react-query more cleanly.React-query automatically wraps the returned data
 * in a { data } object. If we didn't call this function we'd end up with a
 * doubly-nested { data: { data } } object.
 */
export async function processAPIData<Data = unknown, TError = unknown>(
  apiResponse:
    | { data: Data; error: undefined }
    | { data: undefined; error: TError }
    | Promise<
        { data: Data; error: undefined } | { data: undefined; error: TError }
      >,
): Promise<Data> {
  const { data, error } = await apiResponse;
  if (error === undefined) {
    return data as Data;
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(String(error));
}
