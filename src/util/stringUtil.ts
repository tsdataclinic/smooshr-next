/**
 * Convert a display string to a valid identifier name for a variable.
 */
export function toVariableIdentifierName(displayName: string): string {
  return (
    displayName
      .trim()
      // Remove all non-alphanumeric characters except spaces
      .replace(/[^\w\s]/g, '')
      // Replace spaces to underscores
      .replace(/\s+/g, '_')
      // make first character lower case
      .replace(/^[A-Z]/, (match) => match.toLowerCase())
  );
}
