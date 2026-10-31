export function getFieldSelector(fieldName: string): string {
  const fieldMap: Record<string, string> = {
    name: '[data-testid="character-name"]',
    tier: '[data-testid="character-tier"]',
    descriptor: '[data-testid="character-descriptor"]',
    focus: '[data-testid="character-focus"]',
  };
  return fieldMap[fieldName.toLowerCase()] || "";
}
