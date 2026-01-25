import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

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

    const wrappedState = {
      schemaVersion: 4,
      character: character,
    };

    await this.page!.evaluate((state) => {
      localStorage.setItem("numenera-character-state", JSON.stringify(state));
    }, wrappedState);

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
  const wrappedState = createCharacterState("xp", xp);
  await this.page!.evaluate((state) => {
    localStorage.setItem("numenera-character-state", JSON.stringify(state));
  }, wrappedState);
  await this.page!.reload();
  await this.page!.waitForLoadState("domcontentloaded");
});

Given("the character has {int} shins", async function (this: CustomWorld, shins: number) {
  const wrappedState = createCharacterState("shins", shins);
  await this.page!.evaluate((state) => {
    localStorage.setItem("numenera-character-state", JSON.stringify(state));
  }, wrappedState);
  await this.page!.reload();
  await this.page!.waitForLoadState("domcontentloaded");
});

Given("the character has {int} armor", async function (this: CustomWorld, armor: number) {
  const wrappedState = createCharacterState("armor", armor);
  await this.page!.evaluate((state) => {
    localStorage.setItem("numenera-character-state", JSON.stringify(state));
  }, wrappedState);
  await this.page!.reload();
  await this.page!.waitForLoadState("domcontentloaded");
});

Given(
  "the character has max cyphers {int}",
  async function (this: CustomWorld, maxCyphers: number) {
    const wrappedState = createCharacterState("maxCyphers", maxCyphers);
    await this.page!.evaluate((state) => {
      localStorage.setItem("numenera-character-state", JSON.stringify(state));
    }, wrappedState);
    await this.page!.reload();
    await this.page!.waitForLoadState("domcontentloaded");
  }
);

Given("the character has effort {int}", async function (this: CustomWorld, effort: number) {
  const wrappedState = createCharacterState("effort", effort);
  await this.page!.evaluate((state) => {
    localStorage.setItem("numenera-character-state", JSON.stringify(state));
  }, wrappedState);
  await this.page!.reload();
  await this.page!.waitForLoadState("domcontentloaded");
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
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });
    expect(storedData).toBeTruthy();
    if (storedData.character) {
      expect(storedData.character.xp).toBe(expectedXp);
    } else {
      expect(storedData.xp).toBe(expectedXp);
    }
  }
);

Then(
  "the character data should have shins {int}",
  async function (this: CustomWorld, expectedShins: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });
    expect(storedData).toBeTruthy();
    if (storedData.character) {
      expect(storedData.character.shins).toBe(expectedShins);
    } else {
      expect(storedData.shins).toBe(expectedShins);
    }
  }
);

Then(
  "the character data should have armor {int}",
  async function (this: CustomWorld, expectedArmor: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });
    expect(storedData).toBeTruthy();
    if (storedData.character) {
      expect(storedData.character.armor).toBe(expectedArmor);
    } else {
      expect(storedData.armor).toBe(expectedArmor);
    }
  }
);

Then(
  "the character data should have maxCyphers {int}",
  async function (this: CustomWorld, expectedMaxCyphers: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });
    expect(storedData).toBeTruthy();
    if (storedData.character) {
      expect(storedData.character.maxCyphers).toBe(expectedMaxCyphers);
    } else {
      expect(storedData.maxCyphers).toBe(expectedMaxCyphers);
    }
  }
);

Then(
  "the character data should have effort {int}",
  async function (this: CustomWorld, expectedEffort: number) {
    await this.page!.waitForTimeout(200);
    const storedData = await this.page!.evaluate(() => {
      const data = localStorage.getItem("numenera-character-state");
      return data ? JSON.parse(data) : null;
    });
    expect(storedData).toBeTruthy();
    if (storedData.character) {
      expect(storedData.character.effort).toBe(expectedEffort);
    } else {
      expect(storedData.effort).toBe(expectedEffort);
    }
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
