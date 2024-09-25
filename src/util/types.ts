/**
 * Extract the element type of an array
 */
export type ArrayElementType<T> = T extends ReadonlyArray<infer U> ? U : never;
