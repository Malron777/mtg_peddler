/**
 * Utility function to filter out undefined values from an object.
 * This is used in update queries to ensure only provided fields are updated.
 */
export function filterUndefined<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  const filtered: Partial<T> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      filtered[key as keyof T] = value;
    }
  }

  return filtered;
}
