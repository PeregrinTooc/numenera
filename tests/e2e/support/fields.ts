import { Page } from "@playwright/test";

// ============================================================================
// FIELD CONFIGURATION - Central mapping of field names to test IDs
// ============================================================================

export const FIELD_TEST_IDS: Record<string, string> = {
  // Basic Info fields
  "character name": "character-name",
  "character name value": "character-name",
  tier: "character-tier",
  "tier value": "character-tier",
  descriptor: "character-descriptor",
  "descriptor value": "character-descriptor",
  focus: "character-focus",
  "focus value": "character-focus",

  // Stat Pool fields
  "Might Pool": "stat-might-pool",
  "Might Edge": "stat-might-edge",
  "Might Current": "stat-might-current",
  "Speed Pool": "stat-speed-pool",
  "Speed Edge": "stat-speed-edge",
  "Speed Current": "stat-speed-current",
  "Intellect Pool": "stat-intellect-pool",
  "Intellect Edge": "stat-intellect-edge",
  "Intellect Current": "stat-intellect-current",

  // Resource trackers (badges)
  "Current XP badge": "xp-badge-current",
  "Total XP badge": "xp-badge-total",
  "Shins badge": "shins-badge",
  "Armor badge": "armor-badge",
  "Max Cyphers badge": "max-cyphers-badge",
  "Effort badge": "effort-badge",

  // Resource trackers (legacy - for backward compatibility)
  "Current XP": "xp-badge-current",
  "Total XP": "xp-badge-total",
  Shins: "shins-badge",
  Armor: "armor-badge",
  "Max Cyphers": "max-cyphers-badge",
  Effort: "effort-badge",

  // Text fields
  background: "character-background",
  notes: "character-notes",
  type: "character-type-select",
};

export function getTestId(fieldName: string): string {
  const testId = FIELD_TEST_IDS[fieldName];
  if (!testId) {
    throw new Error(`Unknown field name: "${fieldName}". Add it to FIELD_TEST_IDS mapping.`);
  }
  return testId;
}

export class FieldsDsl {
  constructor(private page: Page) {}

  async click(fieldName: string): Promise<void> {
    await this.page.locator(`[data-testid="${getTestId(fieldName)}"]`).click();
  }

  async tap(fieldName: string): Promise<void> {
    await this.page.locator(`[data-testid="${getTestId(fieldName)}"]`).tap();
  }

  async hover(fieldName: string): Promise<void> {
    await this.page.locator(`[data-testid="${getTestId(fieldName)}"]`).hover();
  }
}
