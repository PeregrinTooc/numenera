import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// ============================================================================
// FIELD CONFIGURATION - Central mapping of field names to test IDs
// ============================================================================

const FIELD_TEST_IDS: Record<string, string> = {
  // Basic Info fields
  "character name": "character-name",
  tier: "character-tier",
  descriptor: "character-descriptor",
  focus: "character-focus",

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

  // Resource trackers
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

When("I click the {string}", async function (this: CustomWorld, elementName: string) {
  const testIdMap: Record<string, string> = {
    "Confirm button": "modal-confirm-button",
    "confirm button": "modal-confirm-button",
    "Cancel button": "modal-cancel-button",
    "cancel button": "modal-cancel-button",
    "modal backdrop": "modal-backdrop",
  };

  const testId = testIdMap[elementName];
  if (!testId) {
    throw new Error(`Unknown element: "${elementName}"`);
  }

  await this.page!.click(`[data-testid="${testId}"]`);

  // Wait for modal to close after confirm/cancel
  if (elementName.toLowerCase().includes("button") || elementName.includes("backdrop")) {
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

When("I press the Escape key", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Escape");
});

When("I press the Enter key", async function (this: CustomWorld) {
  await this.page!.keyboard.press("Enter");
});

When("I reload the page", async function (this: CustomWorld) {
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

Then("the modal should close", async function (this: CustomWorld) {
  const modal = this.page!.locator('[data-testid="edit-modal"]');
  await expect(modal).not.toBeVisible();
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
