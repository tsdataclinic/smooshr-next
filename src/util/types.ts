import { useUncontrolled } from '@mantine/hooks';

/**
 * Extract the element type of an array
 */
export type ArrayElementType<T> = T extends ReadonlyArray<infer U> ? U : never;

/**
 * Get the props to use for an uncontrolled input for a custom form
 * component in Mantine forms.
 */
export type UncontrolledInputProps<T> = Parameters<
  typeof useUncontrolled<T>
>[0];
