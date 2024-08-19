/**
 * This function takes an API response and throws an error if it has one,
 * otherwise it returns the data itself. This lets us use API functions with
 * react-query more cleanly.
 */
export function getData<Data = unknown, TError = unknown>(
  apiResponse:
    | { data: Data; error: undefined }
    | { data: undefined; error: TError },
): Data {
  const { data, error } = apiResponse;
  if (error === undefined) {
    return data as Data;
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(String(error));
}

/**
 * This function takes an API function and returns a new function that
 * throws an error if it has one, otherwise it returns the data itself.
 * This lets us use API functions with react-query more cleanly.
 */
export function apiWrapper<Data = unknown, TError = unknown>(
  apiFn: () => Promise<
    { data: Data; error: undefined } | { data: undefined; error: TError }
  >,
): () => Promise<Data> {
  return async () => getData(await apiFn()) as Data;
}
