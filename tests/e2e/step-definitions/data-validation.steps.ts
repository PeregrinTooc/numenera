import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";

// Test fixtures for various import scenarios
const VALID_CHARACTER = {
  name: "Imported Hero",
  tier: 2,
  type: "Nano",
  descriptor: "Clever",
  focus: "Controls Gravity",
  currentXp: 5,
  totalXp: 5,
  shins: 30,
  armor: 1,
  effort: 2,
  maxCyphers: 3,
  stats: {
    might: { pool: 10, edge: 0, current: 10 },
    speed: { pool: 12, edge: 1, current: 12 },
    intellect: { pool: 16, edge: 2, current: 16 },
  },
  cyphers: [{ name: "Test Cypher", level: "1d6", effect: "Test effect" }],
  artifacts: [],
  oddities: ["Glowing orb"],
  abilities: [],
  equipment: [],
  attacks: [],
  specialAbilities: [],
  recoveryRolls: {
    action: false,
    tenMinutes: false,
    oneHour: false,
    tenHours: false,
    modifier: 0,
  },
  damageTrack: {
    impairment: "healthy",
  },
  textFields: {
    background: "Test background",
    notes: "Test notes",
  },
};

// ============================================================================
// WHEN STEPS
// ============================================================================

When(
  "I import a valid character file with matching schema version",
  async function (this: CustomWorld) {
    // Set up mock file importer to return the valid character
    await this.storageHelper.setMockFileImporter(VALID_CHARACTER);

    // Click the import button - this will use the mock importer
    const importButton = this.page.locator('[data-testid="import-button"]');
    await importButton.click();

    // Wait for the character name to update to the imported character
    const nameElement = this.page.locator('[data-testid="character-name"]');
    await nameElement.waitFor({ state: "visible" });

    // Reset the file importer to the real implementation for other tests
    await this.storageHelper.resetFileImporter();
  }
);

// ============================================================================
// THEN STEPS
// ============================================================================

Then("the character should be imported successfully", async function (this: CustomWorld) {
  // Verify the character name changed to the imported character
  const nameElement = this.page.locator('[data-testid="character-name"]');

  // Wait for the name to update (may need a moment for import to process)
  await expect(nameElement).toHaveText("Imported Hero", { timeout: 5000 });
});

Then("all character data should be correctly displayed", async function (this: CustomWorld) {
  // Verify key character data is displayed correctly
  const nameElement = this.page.locator('[data-testid="character-name"]');
  await expect(nameElement).toHaveText("Imported Hero");

  const tierElement = this.page.locator('[data-testid="character-tier"]');
  await expect(tierElement).toHaveText("2");

  const typeElement = this.page.locator('[data-testid="character-type-select"]');
  await expect(typeElement).toContainText("Nano");
});

Then(
  "the character name should still be {string}",
  async function (this: CustomWorld, expectedName: string) {
    const nameElement = this.page.locator('[data-testid="character-name"]');
    await expect(nameElement).toHaveText(expectedName);
  }
);

Then("the tier should still be {string}", async function (this: CustomWorld, expectedTier: string) {
  const tierElement = this.page.locator('[data-testid="character-tier"]');
  await expect(tierElement).toHaveText(expectedTier);
});
