/**
 * Generate an ETag (SHA-256 hash) for character data
 * Excludes portrait field from hashing
 */
export async function generateETag(
  data: Record<string, unknown> | { portrait?: unknown }
): Promise<string> {
  // Create a copy without the portrait field
  const { portrait: _portrait, ...dataWithoutPortrait } = data;

  // Stringify the data in a consistent way (sorted keys)
  const jsonString = JSON.stringify(dataWithoutPortrait, Object.keys(dataWithoutPortrait).sort());

  // Convert string to UTF-8 bytes
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(jsonString);

  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBytes);

  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

  return hashHex;
}
