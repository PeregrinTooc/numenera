export function sanitizeForTestId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}
