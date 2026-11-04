/**
 * Recursively sorts object keys so that two objects with the same content
 * but different key order serialise identically. JSON.stringify's own
 * replacer-array form is a recursive key *filter*, not a sort, so it can't
 * be used for this (it silently drops any nested key absent from the
 * top-level list).
 */
function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeysDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Excludes portrait field from hashing
 */
export async function generateETag(
  data: Record<string, unknown> | { portrait?: unknown }
): Promise<string> {
  const { portrait: _portrait, ...dataWithoutPortrait } = data;

  const jsonString = JSON.stringify(sortKeysDeep(dataWithoutPortrait));

  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(jsonString);

  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBytes);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

  return hashHex;
}
