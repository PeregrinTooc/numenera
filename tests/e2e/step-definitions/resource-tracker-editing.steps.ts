import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// ============================================================================
// GIVEN STEPS - Setup character state
// ============================================================================

Given("the character has {int} XP", async function (this: CustomWorld, xp: number) {
  const character = {
    name: "Test Character",
    tier: 1,
    type: "Nano",
    descriptor: "Strong",
    focus: "Controls Beasts",
    xp,
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
});

Given("the character has {int} shins", async function (this: CustomWorld, shins: number) {
  const character = {
    name: "Test Character",
    tier: 1,
    type: "Nano",
    descriptor: "Strong",
    focus: "Controls Beasts",
    xp: 0,
    shins,
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
});

Given("the character has {int} armor", async function (this: CustomWorld, armor: number) {
  const character = {
    name: "Test Character",
    tier: 1,
    type: "Nano",
    descriptor: "Strong",
    focus: "Controls Beasts",
    xp: 0,
    shins: 0,
    armor,
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
});

Given(
  "the character has max cyphers {int}",
  async function (this: CustomWorld, maxCyphers: number) {
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
      maxCyphers,
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

Given("the character has effort {int}", async function (this: CustomWorld, effort: number) {
  const character = {
    name: "Test Character",
    tier: 1,
    type: "Nano",
    descriptor: "Strong",
    focus: "Controls Beasts",
    xp: 0,
    shins: 0,
    armor: 0,
    effort,
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
});

// ============================================================================
// WHEN STEPS - User actions
// ============================================================================

When("I click the XP badge", async function (this: CustomWorld) {
  const xpBadge = this.page!.locator('[data-testid="xp-badge"]');
  await xpBadge.click();
});

When("I tap the XP badge", async function (this: CustomWorld) {
  const xpBadge = this.page!.locator('[data-testid="xp-badge"]');
  await xpBadge.tap();
});

When("I click the Shins badge", async function (this: CustomWorld) {
  const shinsBadge = this.page!.locator('[data-testid="shins-badge"]');
  await shinsBadge.click();
});

When("I tap the Shins badge", async function (this: CustomWorld) {
  const shinsBadge = this.page!.locator('[data-testid="shins-badge"]');
  await shinsBadge.tap();
});

When("I click the Armor badge", async function (this: CustomWorld) {
  const armorBadge = this.page!.locator('[data-testid="armor-badge"]');
  await armorBadge.click();
});

When("I click the Max Cyphers badge", async function (this: CustomWorld) {
  const maxCyphersBadge = this.page!.locator('[data-testid="max-cyphers-badge"]');
  await maxCyphersBadge.click();
});

When("I click the Effort badge", async function (this: CustomWorld) {
  const effortBadge = this.page!.locator('[data-testid="effort-badge"]');
  await effortBadge.click();
});

When("I type {string} in the modal input", async function (this: CustomWorld, value: string) {
  const input = this.page!.locator('[data-testid="edit-modal-input"]');
  await input.clear();

  // For non-numeric values in number inputs, use pressSequentially to simulate keyboard
  const inputType = await input.getAttribute("type");
  if (inputType === "number" && !/^\d+$/.test(value)) {
    await input.pressSequentially(value);
  } else {
    await input.fill(value);
  }
});

When("I click the modal confirm button", async function (this: CustomWorld) {
  const confirmButton = this.page!.locator('[data-testid="modal-confirm-button"]');
  await confirmButton.click();
});

When("I tap the modal confirm button", async function (this: CustomWorld) {
  const confirmButton = this.page!.locator('[data-testid="modal-confirm-button"]');
  await confirmButton.tap();
});

When("I click the modal cancel button", async function (this: CustomWorld) {
  const cancelButton = this.page!.locator('[data-testid="modal-cancel-button"]');
  await cancelButton.click();
});

When("I click the modal backdrop", async function (this: CustomWorld) {
  const backdrop = this.page!.locator('[data-testid="modal-backdrop"]');
  await backdrop.click({ position: { x: 10, y: 10 } });
});

When("I press Escape", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Escape");
});

When("I press Enter", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Enter");
});

// ============================================================================
// THEN STEPS - Assertions
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

Then("the edit modal should open", async function (this: CustomWorld) {
  const modal = this.page!.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible();
});

Then(
  "the modal input should contain {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await expect(input).toHaveValue(expectedValue);
  }
);

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
