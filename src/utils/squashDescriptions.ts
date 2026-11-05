export function squashDescriptions(descriptions: string[]): string {
  const cleaned = descriptions.map((d) => d.trim()).filter((d) => d.length > 0);

  if (cleaned.length === 0) {
    return "";
  }

  if (cleaned.length === 1) {
    return cleaned[0];
  }

  const uniqueDescriptions = Array.from(new Set(cleaned));

  // Always show max 3 descriptions, no "and X more"
  const toShow = uniqueDescriptions.slice(0, 3);
  return toShow.join(", ");
}
