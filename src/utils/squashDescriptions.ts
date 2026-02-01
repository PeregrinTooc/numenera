/**
 * Combines multiple change descriptions into a single squashed description
 * - Removes duplicates while preserving order
 * - Filters out empty strings
 * - Limits output to top 3 descriptions
 * - Formats as comma-separated string
 *
 * @param descriptions - Array of change descriptions to squash
 * @returns Formatted string with up to 3 unique descriptions
 */
export function squashDescriptions(descriptions: string[]): string {
  // Filter out empty strings and trim whitespace
  const cleaned = descriptions.map((desc) => desc.trim()).filter((desc) => desc.length > 0);

  // Remove duplicates while preserving order
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const desc of cleaned) {
    if (!seen.has(desc)) {
      seen.add(desc);
      unique.push(desc);
    }
  }

  // Limit to top 3
  const limited = unique.slice(0, 3);

  // Join with comma-space separator
  return limited.join(", ");
}
