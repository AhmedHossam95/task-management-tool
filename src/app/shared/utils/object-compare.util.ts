/**
 * Deep comparison utility for detecting data changes
 * Uses JSON serialization for comprehensive equality checks
 *
 * Limitations:
 * - Functions are not comparable
 * - Undefined values are lost in JSON
 * - Date objects are converted to strings
 * - Property order matters
 *
 * Usage: isDeepEqual(oldData, newData) === true means data hasn't changed
 */

/**
 * Compare two values deeply using JSON serialization
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns True if values are deeply equal, false otherwise
 */
export function isDeepEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    // Fallback to reference equality if JSON serialization fails
    return a === b;
  }
}
