/**
 * Offers `content` to the user as a file download through a temporary
 * object-URL link. Works in every browser (the File System Access API is not
 * needed), including WebKit.
 */
export function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Revoke on the next tick, not synchronously - Firefox needs the object
  // URL to still be valid when it starts the download after click().
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
