import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { TestStorageHelper } from "../support/testStorageHelper.js";

// ============================================================================
// GIVEN STEPS - Setup character state with specific resource values
// ============================================================================

/**
 * Unified Given step for setting up character with specific resource tracker value
 * Replaces 5 duplicate Given steps (XP, Shins, Armor, Max Cyphers, Effort)
 */
Given(
  "the character has {string} set to {int}",
  async function (this: CustomWorld, resourceName: string, value: number) {
    const resourceMap: Record<string, string> = {
      XP: "xp",
      shins: "shins",
      armor: "armor",
      "max cyphers": "maxCyphers",
      effort: "effort",
    };

    const fieldKey = resourceMap[resourceName];
    if (!fieldKey) {
      throw new Error(`Unknown resource: "${resourceName}"`);
    }

    const character = {
      name: "Test Character",
      tier: 1,
      type: "Nano",
      descriptor: "Strong",
      focus: "Controls Beasts",
      xp: 0,
      shins: 0,
      armor: 0,
      effort: 1,
      maxCyphers: 2,
      stats: {
        might: { pool: 10, current: 10, edge: 0 },
        speed: { pool: 10, current: 10, edge: 0 },
        intellect: { pool: 10, current: 10, edge: 0 },
      },
      textFields: {
        background: "",
        notes: "",
      },
      abilities: [],
      attacks: [],
      specialAbilities: [],
      equipment: [],
      cyphers: [],
      artifacts: [],
      oddities: [],
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
      [fieldKey]: value,
    };

    const storageHelper = new TestStorageHelper(this.page!);
    await storageHelper.setCharacter(character);

    await this.page!.reload();
    await this.page!.waitForLoadState("domcontentloaded");
  }
);

// Helper function to create character state
function createCharacterState(fieldKey: string, value: number) {
  const character = {
    name: "Test Character",
    tier: 1,
    type: "Nano",
    descriptor: "Strong",
    focus: "Controls Beasts",
    xp: 0,
    shins: 0,
    armor: 0,
    effort: 1,
    maxCyphers: 2,
    stats: {
      might: { pool: 10, current: 10, edge: 0 },
      speed: { pool: 10, current: 10, edge: 0 },
      intellect: { pool: 10, current: 10, edge: 0 },
    },
    textFields: {
      background: "",
      notes: "",
    },
    abilities: [],
    attacks: [],
    specialAbilities: [],
    equipment: [],
    cyphers: [],
    artifacts: [],
    oddities: [],
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
    [fieldKey]: value,
  };

  return {
    schemaVersion: 4,
    character: character,
  };
}

// Legacy Given steps for backward compatibility with existing feature files
Given("the character has {int} XP", async function (this: CustomWorld, xp: number) {
  const character = createCharacterState("xp", xp).character;
  const storageHelper = new TestStorageHelper(this.page!);

  // Wait before setCharacter to ensure any previous auto-save completes
  await this.page!.waitForTimeout(500);
  await storageHelper.setCharacter(character);

  // Wait for IndexedDB save to complete before reloading
  await this.page!.waitForTimeout(500);

  await this.page!.reload();
  await this.page!.waitForLoadState("networkidle");

  // Additional wait for character to load from IndexedDB
  await this.page!.waitForTimeout(200);

  // Wait for XP badge to show correct value (increased timeout for CI)
  await this.page!.waitForFunction(
    (expectedXp) => {
      const badge = document.querySelector('[data-testid="xp-badge"] .stat-badge-value');
      return badge?.textContent === String(expectedXp);
    },
    xp,
    { timeout: 10000 }
  );
});

Given("the character has {int} shins", async function (this: CustomWorld, shins: number) {
  const character = createCharacterState("shins", shins).character;
  const storageHelper = new TestStorageHelper(this.page!);

  // Wait before setCharacter to ensure any previous auto-save completes
  await this.page!.waitForTimeout(500);
  await storageHelper.setCharacter(character);

  // Wait for IndexedDB save to complete before reloading
  await this.page!.waitForTimeout(500);

  await this.page!.reload();
  await this.page!.waitForLoadState("networkidle");

  // Additional wait for character to load from IndexedDB
  await this.page!.waitForTimeout(200);

  // Wait for shins badge to show correct value (increased timeout for CI)
  await this.page!.waitForFunction(
    (expectedShins) => {
      const badge = document.querySelector('[data-testid="shins-badge"] .stat-badge-value');
      return badge?.textContent === String(expectedShins);
    },
    shins,
    { timeout: 10000 }
  );
});

Given("the character has {int} armor", async function (this: CustomWorld, armor: number) {
  const character = createCharacterState("armor", armor).character;
  const storageHelper = new TestStorageHelper(this.page!);

  // Wait before setCharacter to ensure any previous auto-save completes
  await this.page!.waitForTimeout(500);
  await storageHelper.setCharacter(character);

  // Wait for IndexedDB save to complete before reloading
  await this.page!.waitForTimeout(500);

  await this.page!.reload();
  await this.page!.waitForLoadState("networkidle");

  // Additional wait for character to load from IndexedDB
  await this.page!.waitForTimeout(200);

  // Wait for armor value to show correct value (increased timeout for CI)
  await this.page!.waitForFunction(
    (expectedArmor) => {
      const element = document.querySelector('[data-testid="armor-value"]');
      return element?.textContent === String(expectedArmor);
    },
    armor,
    { timeout: 10000 }
  );
});

Given(
  "the character has max cyphers {int}",
  async function (this: CustomWorld, maxCyphers: number) {
    const character = createCharacterState("maxCyphers", maxCyphers).character;
    const storageHelper = new TestStorageHelper(this.page!);

    // Wait before setCharacter to ensure any previous auto-save completes
    await this.page!.waitForTimeout(500);
    await storageHelper.setCharacter(character);

    // Wait for IndexedDB save to complete before reloading
    await this.page!.waitForTimeout(500);

    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");

    // Additional wait for character to load from IndexedDB
    await this.page!.waitForTimeout(200);

    // Wait for max cyphers value to show correct value (increased timeout for CI)
    await this.page!.waitForFunction(
      (expectedMaxCyphers) => {
        const element = document.querySelector('[data-testid="max-cyphers-value"]');
        return element?.textContent === String(expectedMaxCyphers);
      },
      maxCyphers,
      { timeout: 10000 }
    );
  }
);

Given("the character has effort {int}", async function (this: CustomWorld, effort: number) {
  const character = createCharacterState("effort", effort).character;
  const storageHelper = new TestStorageHelper(this.page!);

  // Wait before setCharacter to ensure any previous auto-save completes
  await this.page!.waitForTimeout(500);
  await storageHelper.setCharacter(character);

  // Wait for IndexedDB save to complete before reloading
  await this.page!.waitForTimeout(500);

  await this.page!.reload();
  await this.page!.waitForLoadState("networkidle");

  // Additional wait for character to load from IndexedDB
  await this.page!.waitForTimeout(200);

  // Wait for the effort element to exist first
  await this.page!.waitForSelector('[data-testid="effort-value"]', { timeout: 10000 });

  // Then wait for it to have the correct value
  await this.page!.waitForFunction(
    (expectedEffort) => {
      const element = document.querySelector('[data-testid="effort-value"]');
      return element?.textContent === String(expectedEffort);
    },
    effort,
    { timeout: 10000 }
  );
});

// ============================================================================
// THEN STEPS - Badge-specific assertions
// ============================================================================

Then(
  "the XP badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const xpBadgeValue = this.page!.locator('[data-testid="xp-badge"] .stat-badge-value');
    await expect(xpBadgeValue).toHaveText(expectedValue);
  }
);

Then(
  "the Shins badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const shinsBadgeValue = this.page!.locator('[data-testid="shins-badge"] .stat-badge-value');
    await expect(shinsBadgeValue).toHaveText(expectedValue);
  }
);

Then(
  "the Armor badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const armorValue = this.page!.locator('[data-testid="armor-value"]');
    await expect(armorValue).toHaveText(expectedValue);
  }
);

Then(
  "the Max Cyphers portion of the badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const maxCyphersValue = this.page!.locator('[data-testid="max-cyphers-value"]');
    await expect(maxCyphersValue).toHaveText(expectedValue);
  }
);

Then(
  "the Effort badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const effortValue = this.page!.locator('[data-testid="effort-value"]');
    await expect(effortValue).toHaveText(expectedValue);
  }
);

// ============================================================================
// THEN STEPS - LocalStorage data verification
// ============================================================================

Then(
  "the character data should have xp {int}",
  async function (this: CustomWorld, expectedXp: number) {
    await this.page!.waitForTimeout(200);
    const storageHelper = new TestStorageHelper(this.page!);
    const storedData = await storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.xp).toBe(expectedXp);
  }
);

Then(
  "the character data should have shins {int}",
  async function (this: CustomWorld, expectedShins: number) {
    await this.page!.waitForTimeout(200);
    const storageHelper = new TestStorageHelper(this.page!);
    const storedData = await storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.shins).toBe(expectedShins);
  }
);

Then(
  "the character data should have armor {int}",
  async function (this: CustomWorld, expectedArmor: number) {
    await this.page!.waitForTimeout(200);
    const storageHelper = new TestStorageHelper(this.page!);
    const storedData = await storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.armor).toBe(expectedArmor);
  }
);

Then(
  "the character data should have maxCyphers {int}",
  async function (this: CustomWorld, expectedMaxCyphers: number) {
    await this.page!.waitForTimeout(200);
    const storageHelper = new TestStorageHelper(this.page!);
    const storedData = await storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.maxCyphers).toBe(expectedMaxCyphers);
  }
);

Then(
  "the character data should have effort {int}",
  async function (this: CustomWorld, expectedEffort: number) {
    await this.page!.waitForTimeout(200);
    const storageHelper = new TestStorageHelper(this.page!);
    const storedData = await storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.effort).toBe(expectedEffort);
  }
);

Then("the modal confirm button should be disabled", async function (this: CustomWorld) {
  const confirmButton = this.page!.locator('[data-testid="modal-confirm-button"]');
  await expect(confirmButton).toBeDisabled();
});

// ============================================================================
// NOTE: The following steps are now handled by common-steps.ts:
// - When I click the XP/Shins/Armor/Max Cyphers/Effort badge
// - When I tap the XP/Shins badge
// - When I type {string} in the modal input
// - When I click the modal confirm/cancel button
// - When I tap the modal confirm button
// - When I click the modal backdrop
// - When I press Escape/Enter
// - Then the edit modal should open
// - Then the modal input should contain {string}
// - Then the modal should close
// ============================================================================
