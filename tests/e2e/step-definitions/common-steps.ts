import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";
import { waitForSaveComplete } from "../support/save.js";
import { getTestId } from "../support/fields.js";
import { FULL_CHARACTER } from "../support/cardTestFixtures.js";

// Default stat values for verification, derived from FULL_CHARACTER so this
// map can't drift from the character every card fixture builds on.
const DEFAULT_STAT_VALUES: Record<string, string> = Object.fromEntries(
  (["might", "speed", "intellect"] as const).flatMap((stat) => {
    const { pool, edge, current } = FULL_CHARACTER.stats[stat];
    const label = stat.charAt(0).toUpperCase() + stat.slice(1);
    return [
      [`${label} Pool`, String(pool)],
      [`${label} Edge`, String(edge)],
      [`${label} Current`, String(current)],
    ];
  })
);

// ============================================================================
// REUSABLE WHEN STEPS - User Actions
// ============================================================================

When("I click on the {string} value", async function (this: CustomWorld, fieldName: string) {
  await this.fields.click(fieldName);
  // For fields that open modals, wait for modal to appear
  if (!["background", "notes", "type"].includes(fieldName)) {
    await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
  }
});

When("I tap on the {string} value", async function (this: CustomWorld, fieldName: string) {
  await this.fields.tap(fieldName);
  // For fields that open modals, wait for modal to appear
  if (!["background", "notes", "type"].includes(fieldName)) {
    await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
  }
});

async function confirmModal(this: CustomWorld): Promise<void> {
  await this.modal.confirm();
}
When('I click the "Confirm" button', confirmModal);

async function cancelModal(this: CustomWorld): Promise<void> {
  await this.modal.cancel();
}
When('I click the "Cancel" button', cancelModal);

When('I click the "New" button', async function (this: CustomWorld) {
  await this.page.locator('[data-testid="new-button"]').click();
  await this.page.waitForTimeout(200); // Wait for re-render
});

// Badge click/tap steps, parameterised by the {badge} type (resolves to a
// data-testid; see support/parameterTypes.ts). No {badge} hover registration:
// no feature line exercises hovering a badge today, and adding one would be
// an unreachable step that check:steps would immediately flag as dead.
When("I click the {badge} badge", async function (this: CustomWorld, testId: string) {
  await this.dom.getByTestId(testId).click();
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I tap the {badge} badge", async function (this: CustomWorld, testId: string) {
  await this.dom.getByTestId(testId).tap();
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

// Basic info field click steps (with value parameter)
When("I click on the character name {string}", async function (this: CustomWorld, _name: string) {
  await this.page.locator('[data-testid="character-name"]').click();
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click on the tier {string}", async function (this: CustomWorld, _tier: string) {
  await this.page.locator('[data-testid="character-tier"]').click();
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click on the descriptor {string}", async function (this: CustomWorld, _descriptor: string) {
  await this.page.locator('[data-testid="character-descriptor"]').click();
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I click on the focus {string}", async function (this: CustomWorld, _focus: string) {
  await this.page.locator('[data-testid="character-focus"]').click();
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I tap on the character name {string}", async function (this: CustomWorld, _name: string) {
  await this.page.locator('[data-testid="character-name"]').tap();
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I tap on the tier {string}", async function (this: CustomWorld, _tier: string) {
  await this.page.locator('[data-testid="character-tier"]').tap();
  await this.page.waitForSelector('[data-testid="edit-modal"]', { state: "visible" });
});

When("I hover over the character name {string}", async function (this: CustomWorld, _name: string) {
  await this.page.locator('[data-testid="character-name"]').hover();
});

When("I hover over the tier {string}", async function (this: CustomWorld, _tier: string) {
  await this.page.locator('[data-testid="character-tier"]').hover();
});

When("I tap the modal confirm button", async function (this: CustomWorld) {
  await this.modal.tapConfirm();
});

When("I clear the input field", async function (this: CustomWorld) {
  await this.modal.clearInput();
});

async function typeIntoInputField(this: CustomWorld, text: string): Promise<void> {
  await this.modal.type(text);
}
When("I type {string} into the input field", typeIntoInputField);

When("I type {string} in the modal input", async function (this: CustomWorld, value: string) {
  await this.modal.type(value);
});

When("I type {string} in the input field", typeIntoInputField);

// ============================================================================
// UNIFIED EDIT FIELD STEP - Replaces duplicates across multiple files
// ============================================================================

When(
  "I edit the {string} field to {string}",
  async function (this: CustomWorld, fieldName: string, value: string) {
    const testId = getTestId(fieldName);
    const field = this.page.locator(`[data-testid="${testId}"]`);

    // Click field to open modal
    await field.click();

    // Wait for modal to appear
    const modal = this.page.locator('[data-testid="edit-modal"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Fill input with new value
    const input = this.page.locator('[data-testid="edit-modal-input"]');
    await input.fill(value);

    // Click confirm button
    const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
    await confirmButton.click();

    // Wait for modal to close
    await expect(modal).toHaveCount(0, { timeout: 2000 });

    // Wait for auto-save to complete
    await waitForSaveComplete(this.page);
  }
);

When("I click outside the modal on the backdrop", async function (this: CustomWorld) {
  // Click in the top-left corner which is definitely the backdrop, not the modal
  await this.page.click("body", { position: { x: 10, y: 10 } });
  await this.page.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 1000,
  });
});

When("I tap outside the modal on the backdrop", async function (this: CustomWorld) {
  // Tap in the top-left corner which is definitely the backdrop, not the modal
  await this.page.tap("body", { position: { x: 10, y: 10 } });
  await this.page.waitForSelector('[data-testid="edit-modal"]', {
    state: "hidden",
    timeout: 1000,
  });
});

When("I press the Escape key", async function (this: CustomWorld) {
  await this.page.keyboard.press("Escape");
});

When("I press the Enter key", async function (this: CustomWorld) {
  await this.page.keyboard.press("Enter");
});

When("I reload the page", async function (this: CustomWorld) {
  // Wait for debounced auto-save to complete before reloading (if save indicator is visible)
  const saveIndicator = this.page.locator('[data-testid="save-indicator"]');
  const isVisible = await saveIndicator.isVisible().catch(() => false);

  if (isVisible) {
    await waitForSaveComplete(this.page);
  } else {
    // No pending saves, just wait a short time for any in-flight operations
    await this.page.waitForTimeout(100);
  }

  await this.page.reload();
  // "domcontentloaded" fires before the app's own async render pipeline
  // (loadLayout/loadCharacterState, etc.) has produced any DOM content.
  // Wait for a baseline element every character sheet render always
  // includes, so callers checking rendered state right after don't race
  // the app's own bootstrap.
  await this.page.waitForSelector('[data-testid="character-name"]');
});

// ============================================================================
// REUSABLE THEN STEPS - Assertions
// ============================================================================

Then(
  "I should see the {string} value displayed",
  async function (this: CustomWorld, fieldName: string) {
    const testId = getTestId(fieldName);
    const element = this.page.locator(`[data-testid="${testId}"]`);
    await expect(element).toBeVisible();
  }
);

Then(
  "the {string} value should display {string}",
  async function (this: CustomWorld, fieldName: string, expectedValue: string) {
    const testId = getTestId(fieldName);
    const element = this.page.locator(`[data-testid="${testId}"]`);
    await expect(element).toHaveText(expectedValue);
  }
);

Then(
  "the {string} value should not have changed",
  async function (this: CustomWorld, fieldName: string) {
    const testId = getTestId(fieldName);
    const element = this.page.locator(`[data-testid="${testId}"]`);

    // Get current value
    const currentValue = (await element.textContent())?.trim();

    const expectedDefault = DEFAULT_STAT_VALUES[fieldName];
    if (expectedDefault) {
      expect(currentValue).toBe(expectedDefault);
    } else {
      // For other fields, just verify it's not empty
      expect(currentValue).toBeTruthy();
    }
  }
);

async function expectModalOpen(this: CustomWorld): Promise<void> {
  await this.modal.expectOpen();
}
Then("an edit modal should appear", expectModalOpen);

Then("the edit modal should open", expectModalOpen);

async function expectModalInputContains(this: CustomWorld, value: string): Promise<void> {
  await this.modal.expectInputValue(value);
}
Then("the modal input should contain {string}", expectModalInputContains);

Then("the modal should close", async function (this: CustomWorld) {
  await this.modal.expectClosed();
});

Then("the input field should contain {string}", expectModalInputContains);

async function expectInputFocused(this: CustomWorld): Promise<void> {
  await this.modal.expectInputFocused();
}
Then("the input field should receive focus automatically", expectInputFocused);

Then("the input field should be focused", expectInputFocused);

Then(
  "the input field should contain the current {string} value",
  async function (this: CustomWorld, fieldName: string) {
    const input = this.page.locator('[data-testid="edit-modal-input"]');

    const expectedValue = DEFAULT_STAT_VALUES[fieldName];
    if (expectedValue) {
      await expect(input).toHaveValue(expectedValue, { timeout: 10000 });
    }
  }
);
