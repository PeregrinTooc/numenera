// Test helper utilities for generating test IDs and test-related functions

/**
 * Sanitizes a string to be used as a test ID by converting to lowercase
 * and replacing spaces with hyphens.
 * @param name - The string to sanitize
 * @returns The sanitized string suitable for use as a test ID
 */
export function sanitizeForTestId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}
