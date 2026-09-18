import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// ============================================================================
// GIVEN STEPS - Setup character state with specific resource values
// ============================================================================

// Helper function to create character state
function createCharacterState(fieldKey: string, value: number) {
  const character = {
    name: "Test Character",
    tier: 1,
    type: "Nano",
    descriptor: "Strong",
    focus: "Controls Beasts",
    currentXp: 0,
    totalXp: 0,
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

Given(
  "the character has {int} current XP and {int} total XP",
  async function (this: CustomWorld, currentXp: number, totalXp: number) {
    await this.setup.character({ currentXp, totalXp });

    // Wait for both XP cells to show the correct values (increased timeout for CI)
    await this.page!.waitForFunction(
      ({ expectedCurrent, expectedTotal }) => {
        const currentCell = document.querySelector(
          '[data-testid="xp-badge-current"] .stat-badge-value'
        );
        const totalCell = document.querySelector(
          '[data-testid="xp-badge-total"] .stat-badge-value'
        );
        return (
          currentCell?.textContent === String(expectedCurrent) &&
          totalCell?.textContent === String(expectedTotal)
        );
      },
      { expectedCurrent: currentXp, expectedTotal: totalXp },
      { timeout: 10000 }
    );
  }
);

Given(
  "the character was saved with a single legacy XP value of {int}",
  async function (this: CustomWorld, legacyXp: number) {
    const {
      currentXp: _currentXp,
      totalXp: _totalXp,
      ...rest
    } = createCharacterState("currentXp", legacyXp).character as any;
    const character = { ...rest, xp: legacyXp };

    await this.page!.waitForTimeout(500);
    await this.storageHelper.setCharacter(character);
    await this.page!.waitForTimeout(500);

    await this.page!.reload();
    await this.page!.waitForLoadState("networkidle");
    await this.page!.waitForTimeout(200);

    await this.page!.waitForFunction(
      ({ expectedCurrent, expectedTotal }) => {
        const currentCell = document.querySelector(
          '[data-testid="xp-badge-current"] .stat-badge-value'
        );
        const totalCell = document.querySelector(
          '[data-testid="xp-badge-total"] .stat-badge-value'
        );
        return (
          currentCell?.textContent === String(expectedCurrent) &&
          totalCell?.textContent === String(expectedTotal)
        );
      },
      { expectedCurrent: legacyXp, expectedTotal: legacyXp },
      { timeout: 10000 }
    );
  }
);

// Selector for each {resource} field's rendered value, used to wait for the
// reload in this.setup.character() to actually reflect the new value.
const RESOURCE_VALUE_SELECTORS: Record<string, string> = {
  shins: '[data-testid="shins-badge"] .stat-badge-value',
  armor: '[data-testid="armor-value"]',
  maxCyphers: '[data-testid="max-cyphers-value"]',
  effort: '[data-testid="effort-value"]',
};

async function waitForResourceValue(
  world: CustomWorld,
  field: string,
  value: number
): Promise<void> {
  const selector = RESOURCE_VALUE_SELECTORS[field];
  await world.page!.waitForSelector(selector, { timeout: 10000 });
  await world.page!.waitForFunction(
    ({ sel, expected }) => document.querySelector(sel)?.textContent === String(expected),
    { sel: selector, expected: value },
    { timeout: 10000 }
  );
}

// The feature files use both word orders: "{int} shins/armor" but
// "max cyphers/effort {int}" — two registrations, one shared body.
Given(
  "the character has {int} {resource}",
  async function (this: CustomWorld, value: number, field: string) {
    await this.setup.character({ [field]: value });
    await waitForResourceValue(this, field, value);
  }
);

Given(
  "the character has {resource} {int}",
  async function (this: CustomWorld, field: string, value: number) {
    await this.setup.character({ [field]: value });
    await waitForResourceValue(this, field, value);
  }
);

// ============================================================================
// THEN STEPS - Badge-specific assertions
// ============================================================================

Then(
  "the Current XP badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const currentXpValue = this.page!.locator('[data-testid="xp-badge-current"] .stat-badge-value');
    await expect(currentXpValue).toHaveText(expectedValue);
  }
);

Then(
  "the Total XP badge should show {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const totalXpValue = this.page!.locator('[data-testid="xp-badge-total"] .stat-badge-value');
    await expect(totalXpValue).toHaveText(expectedValue);
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
  "the character data should have currentXp {int}",
  async function (this: CustomWorld, expectedCurrentXp: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.currentXp).toBe(expectedCurrentXp);
  }
);

Then(
  "the character data should have totalXp {int}",
  async function (this: CustomWorld, expectedTotalXp: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.totalXp).toBe(expectedTotalXp);
  }
);

Then(
  "the character data should have shins {int}",
  async function (this: CustomWorld, expectedShins: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.shins).toBe(expectedShins);
  }
);

Then(
  "the character data should have armor {int}",
  async function (this: CustomWorld, expectedArmor: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.armor).toBe(expectedArmor);
  }
);

Then(
  "the character data should have maxCyphers {int}",
  async function (this: CustomWorld, expectedMaxCyphers: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.maxCyphers).toBe(expectedMaxCyphers);
  }
);

Then(
  "the character data should have effort {int}",
  async function (this: CustomWorld, expectedEffort: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.storageHelper.getCharacter();
    expect(storedData).toBeTruthy();
    expect(storedData.effort).toBe(expectedEffort);
  }
);

Then("the modal confirm button should be disabled", async function (this: CustomWorld) {
  const confirmButton = this.page!.locator('[data-testid="modal-confirm-button"]');
  await expect(confirmButton).toBeDisabled();
});

Then(
  "the modal should show a real validation error, not a raw translation key",
  async function (this: CustomWorld) {
    const errorElement = this.page!.locator(".edit-modal-error");
    const errorText = await errorElement.textContent();
    expect(errorText).toBeTruthy();
    expect(errorText).not.toMatch(/^validation\./);
  }
);

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
