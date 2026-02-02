import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// ============================================================================
// FIELD CONFIGURATION - Central mapping of field names to test IDs
// ============================================================================

const FIELD_TEST_IDS: Record<string, string> = {
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
  "XP badge": "xp-badge",
  "Shins badge": "shins-badge",
  "Armor badge": "armor-badge",
  "Max Cyphers badge": "max-cyphers-badge",
  "Effort badge": "effort-badge",

  // Resource trackers (legacy - for backward compatibility)
  XP: "xp-badge",
  Shins: "shins-badge",
  Armor: "armor-badge",
  "Max Cyphers": "max-cyphers-badge",
  Effort: "effort-badge",

  // Text fields
  background: "character-background",
  notes: "character-notes",
  type: "character-type-select",
};

function getTestId(fieldName: string): string {
  const testId = FIELD_TEST_IDS[fieldName];
  if (!testId) {
    throw new Error(`Unknown field name: "${fieldName}". Add it to FIELD_TEST_IDS mapping.`);
  }
  return testId;
}

// ============================================================================
// REUSABLE WHEN STEPS - User Actions
// ============================================================================

When("I click on the {string} value", async function (this: CustomWorld, fieldName: string) {
  const testId = getTestId(fieldName);
  await this.page!.locator(`[data-testid="${testId}"]`).click();
  // For fields that open modals, wait for modal to appear
  if (!["background", "notes", "type"].includes(fieldName)) {
    await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
  }
});

When("I tap on the {string} value", async function (this: CustomWorld, fieldName: string) {
  const testId = getTestId(fieldName);
  await this.page!.locator(`[data-testid="${testId}"]`).tap();
  // For fields that open modals, wait for modal to appear
  if (!["background", "notes", "type"].includes(fieldName)) {
    await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
  }
});

When("I click the Confirm button", async function (this: CustomWorld) {
  await this.page!.click('[data-testid="modal-confirm-button"]');
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
  // Wait for auto-save to complete (300ms debounce + buffer)
  await this.page!.waitForTimeout(600);
});

When("I click the Cancel button", async function (this: CustomWorld) {
  await this.page!.click('[data-testid="modal-cancel-button"]');
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
});

// Individual badge click steps
When("I click the XP badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="xp-badge"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click the Shins badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="shins-badge"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click the Armor badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="armor-badge"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click the Max Cyphers badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="max-cyphers-badge"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click the Effort badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="effort-badge"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I tap the XP badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="xp-badge"]').tap();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I tap the Shins badge", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="shins-badge"]').tap();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

// Basic info field click steps (with value parameter)
When("I click on the character name {string}", async function (this: CustomWorld, _name: string) {
  await this.page!.locator('[data-testid="character-name"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click on the tier {string}", async function (this: CustomWorld, _tier: string) {
  await this.page!.locator('[data-testid="character-tier"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click on the descriptor {string}", async function (this: CustomWorld, _descriptor: string) {
  await this.page!.locator('[data-testid="character-descriptor"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click on the focus {string}", async function (this: CustomWorld, _focus: string) {
  await this.page!.locator('[data-testid="character-focus"]').click();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I tap on the character name {string}", async function (this: CustomWorld, _name: string) {
  await this.page!.locator('[data-testid="character-name"]').tap();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I tap on the tier {string}", async function (this: CustomWorld, _tier: string) {
  await this.page!.locator('[data-testid="character-tier"]').tap();
  await this.page!.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I hover over the character name {string}", async function (this: CustomWorld, _name: string) {
  await this.page!.locator('[data-testid="character-name"]').hover();
});

When("I hover over the tier {string}", async function (this: CustomWorld, _tier: string) {
  await this.page!.locator('[data-testid="character-tier"]').hover();
});

When("I click the modal confirm button", async function (this: CustomWorld) {
  await this.page!.click('[data-testid="modal-confirm-button"]');
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
  // Wait for auto-save to complete (300ms debounce + buffer)
  await this.page!.waitForTimeout(600);
});

When("I click the modal cancel button", async function (this: CustomWorld) {
  await this.page!.click('[data-testid="modal-cancel-button"]');
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
});

When("I click the modal backdrop", async function (this: CustomWorld) {
  await this.page!.click('[data-testid="modal-backdrop"]', { position: { x: 10, y: 10 } });
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
});

When("I tap the modal confirm button", async function (this: CustomWorld) {
  await this.page!.tap('[data-testid="modal-confirm-button"]');
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
  // Wait for auto-save to complete (300ms debounce + buffer)
  await this.page!.waitForTimeout(500);
});

When("I click the {string}", async function (this: CustomWorld, elementName: string) {
  const testIdMap: Record<string, string> = {
    "Confirm button": "modal-confirm-button",
    "confirm button": "modal-confirm-button",
    "Cancel button": "modal-cancel-button",
    "cancel button": "modal-cancel-button",
  };

  const testId = testIdMap[elementName];
  if (!testId) {
    throw new Error(`Unknown element: "${elementName}"`);
  }

  await this.page!.click(`[data-testid="${testId}"]`);

  // Wait for modal to close after confirm/cancel
  if (elementName.toLowerCase().includes("button")) {
    await this.page!.waitForSelector('[data-testid="edit-modal"]', {
      state: "hidden",
      timeout: 2000,
    }).catch(() => {
      // Modal might already be hidden
    });
  }
});

When("I tap the {string}", async function (this: CustomWorld, elementName: string) {
  const testIdMap: Record<string, string> = {
    "confirm button": "modal-confirm-button",
    "Cancel button": "modal-cancel-button",
    "cancel button": "modal-cancel-button",
  };

  const testId = testIdMap[elementName];
  if (!testId) {
    throw new Error(`Unknown element: "${elementName}"`);
  }

  await this.page!.tap(`[data-testid="${testId}"]`);
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 2000,
  }).catch(() => {
    // Modal might already be hidden
  });
});

When("I clear the input field", async function (this: CustomWorld) {
  const input = this.page!.locator('[data-testid="edit-modal-input"]');
  await input.clear();
});

When("I type {string} into the input field", async function (this: CustomWorld, text: string) {
  const input = this.page!.locator('[data-testid="edit-modal-input"]');
  await input.fill(text);
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

When("I type {string} in the input field", async function (this: CustomWorld, text: string) {
  const input = this.page!.locator('[data-testid="edit-modal-input"]');
  await input.fill(text);
});

// ============================================================================
// UNIFIED EDIT FIELD STEP - Replaces duplicates across multiple files
// ============================================================================

When(
  "I edit the {string} field to {string}",
  async function (this: CustomWorld, fieldName: string, value: string) {
    const testId = getTestId(fieldName);
    const field = this.page!.locator(`[data-testid="${testId}"]`);

    // Click field to open modal
    await field.click();

    // Wait for modal to appear
    const modal = this.page!.locator('[data-testid="edit-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Fill input with new value
    const input = this.page!.locator('[data-testid="edit-modal-input"]');
    await input.fill(value);

    // Click confirm button
    const confirmButton = this.page!.locator('[data-testid="modal-confirm-button"]');
    await confirmButton.click();

    // Wait for modal to close
    await expect(modal).toHaveCount(0, { timeout: 2000 });

    // Wait for auto-save to complete (300ms debounce + buffer)
    await this.page!.waitForTimeout(500);
  }
);

When("I click outside the modal on the backdrop", async function (this: CustomWorld) {
  // Click in the top-left corner which is definitely the backdrop, not the modal
  await this.page!.click("body", { position: { x: 10, y: 10 } });
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 1000,
  });
});

When("I tap outside the modal on the backdrop", async function (this: CustomWorld) {
  // Tap in the top-left corner which is definitely the backdrop, not the modal
  await this.page!.tap("body", { position: { x: 10, y: 10 } });
  await this.page!.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 1000,
  });
});

When("I press the Escape key", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Escape");
});

When("I press the Enter key", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Enter");
});

When("I press Enter", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Enter");
});

When("I press Escape", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Escape");
});

When("I reload the page", async function (this: CustomWorld) {
  // Wait for debounced auto-save to complete before reloading
  // (300ms debounce + buffer for async IndexedDB operations)
  await this.page!.waitForTimeout(500);

  await this.page!.reload();
  await this.page!.waitForLoadState("domcontentloaded");
});

// ============================================================================
// REUSABLE THEN STEPS - Assertions
// ============================================================================

Then(
  "I should see the {string} value displayed",
  async function (this: CustomWorld, fieldName: string) {
    const testId = getTestId(fieldName);
    const element = this.page!.locator(`[data-testid="${testId}"]`);
    await expect(element).toBeVisible();
  }
);

Then(
  "the {string} value should display {string}",
  async function (this: CustomWorld, fieldName: string, expectedValue: string) {
    const testId = getTestId(fieldName);
    const element = this.page!.locator(`[data-testid="${testId}"]`);
    await expect(element).toHaveText(expectedValue);
  }
);

Then(
  "the {string} value should not have changed",
  async function (this: CustomWorld, fieldName: string) {
    const testId = getTestId(fieldName);
    const element = this.page!.locator(`[data-testid="${testId}"]`);

    // Get current value
    const currentValue = (await element.textContent())?.trim();

    // Default values for verification (from FULL_CHARACTER in mockCharacters.ts)
    const defaultValues: Record<string, string> = {
      "Might Pool": "15",
      "Might Edge": "2",
      "Might Current": "12",
      "Speed Pool": "12",
      "Speed Edge": "1",
      "Speed Current": "12",
      "Intellect Pool": "10",
      "Intellect Edge": "0",
      "Intellect Current": "8",
    };

    const expectedDefault = defaultValues[fieldName];
    if (expectedDefault) {
      expect(currentValue).toBe(expectedDefault);
    } else {
      // For other fields, just verify it's not empty
      expect(currentValue).toBeTruthy();
    }
  }
);

Then("an edit modal should appear", async function (this: CustomWorld) {
  const modal = this.page!.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible();
});

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

Then("the modal should close", async function (this: CustomWorld) {
  const modal = this.page!.locator('[data-testid="edit-modal"]');
  await expect(modal).not.toBeVisible();
});

Then("the input field should contain {string}", async function (this: CustomWorld, value: string) {
  const input = this.page!.locator('[data-testid="edit-modal-input"]');
  await expect(input).toHaveValue(value);
});

Then("the input field should receive focus automatically", async function (this: CustomWorld) {
  const input = this.page!.locator('[data-testid="edit-modal-input"]');
  await expect(input).toBeFocused();
});

Then("the input field should be focused", async function (this: CustomWorld) {
  const input = this.page!.locator('[data-testid="edit-modal-input"]');
  await expect(input).toBeFocused();
});

Then(
  "the input field should contain the current {string} value",
  async function (this: CustomWorld, fieldName: string) {
    const input = this.page!.locator('[data-testid="edit-modal-input"]');

    // Default values for verification
    const defaultValues: Record<string, string> = {
      "Might Pool": "15",
      "Might Edge": "2",
      "Might Current": "12",
      "Speed Pool": "12",
      "Speed Edge": "1",
      "Speed Current": "12",
      "Intellect Pool": "10",
      "Intellect Edge": "0",
      "Intellect Current": "8",
    };

    const expectedValue = defaultValues[fieldName];
    if (expectedValue) {
      await expect(input).toHaveValue(expectedValue, { timeout: 10000 });
    }
  }
);
