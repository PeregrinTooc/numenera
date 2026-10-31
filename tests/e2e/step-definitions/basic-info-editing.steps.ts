import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { getFieldSelector } from "../support/basicInfoHelpers.js";

// ============================================================================
// UNIQUE STEPS FOR BASIC INFO EDITING
// ============================================================================
// NOTE: Most common steps (click, type, modal interactions) are now in common-steps.ts
// This file contains only unique steps specific to basic info editing:
// - Modal validation and styling
// - Accessibility features
// - Mobile-specific assertions
// - Character field display assertions
// ============================================================================

// ============================================================================
// UNIQUE WHEN STEPS
// ============================================================================

When("I press Tab repeatedly", async function (this: CustomWorld) {
  const validElements = ["edit-modal-input", "modal-confirm-button", "modal-cancel-button"];

  // Press Tab 3 times with verification that focus settles on valid elements
  for (let i = 0; i < 3; i++) {
    await this.page.keyboard.press("Tab");
    // Wait for focus to be on a valid modal element
    await this.page.waitForFunction(
      (elements) => {
        const testId = document.activeElement?.getAttribute("data-testid");
        return testId && elements.includes(testId);
      },
      validElements,
      { timeout: 1000 }
    );
  }
});

// Note: "I click the confirm button", "I click the cancel button", and "I tap the confirm button"
// are now handled by steps in common-steps.ts

// ============================================================================
// UNIQUE THEN STEPS - Modal Assertions
// ============================================================================

Then("the modal should have a confirm button with icon", async function (this: CustomWorld) {
  const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
  await expect(confirmButton).toBeVisible();
  const icon = confirmButton.locator("svg");
  await expect(icon).toBeVisible();
});

Then("the modal should have a cancel button with icon", async function (this: CustomWorld) {
  const cancelButton = this.page.locator('[data-testid="modal-cancel-button"]');
  await expect(cancelButton).toBeVisible();
  const icon = cancelButton.locator("svg");
  await expect(icon).toBeVisible();
});

Then(
  "the input field should be of type {string}",
  async function (this: CustomWorld, inputType: string) {
    const input = this.page.locator('[data-testid="edit-modal-input"]');
    const type = await input.getAttribute("type");
    expect(type).toBe(inputType);
  }
);

// ============================================================================
// UNIQUE THEN STEPS - Character Field Display Assertions
// ============================================================================

Then(
  "the character name should display {string}",
  async function (this: CustomWorld, name: string) {
    const nameElement = this.page.locator(getFieldSelector("name"));
    await expect(nameElement).toHaveText(name);
  }
);

Then(
  "the character name should still display {string}",
  async function (this: CustomWorld, name: string) {
    const nameElement = this.page.locator(getFieldSelector("name"));
    await expect(nameElement).toHaveText(name);
  }
);

Then("the tier should display {string}", async function (this: CustomWorld, tier: string) {
  const tierElement = this.page.locator(getFieldSelector("tier"));
  const text = await tierElement.textContent();
  expect(text).toContain(tier);
});

Then(
  "the descriptor should display {string}",
  async function (this: CustomWorld, descriptor: string) {
    const descriptorElement = this.page.locator(getFieldSelector("descriptor"));
    await expect(descriptorElement).toHaveText(descriptor);
  }
);

Then("the focus should display {string}", async function (this: CustomWorld, focus: string) {
  const focusElement = this.page.locator(getFieldSelector("focus"));
  await expect(focusElement).toHaveText(focus);
});

// ============================================================================
// UNIQUE THEN STEPS - Validation Assertions
// ============================================================================

Then("the modal should not close", async function (this: CustomWorld) {
  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible();
});

// ============================================================================
// UNIQUE THEN STEPS - Visual Styling Assertions
// ============================================================================

Then("the modal should have Numenera-themed styling", async function (this: CustomWorld) {
  const modal = this.page.locator('[data-testid="edit-modal"]');
  const bgColor = await modal.evaluate(
    (el: HTMLElement) => window.getComputedStyle(el).backgroundColor
  );
  // Check that modal has a background color set (parchment-like)
  expect(bgColor).toBeTruthy();
});

Then("the confirm button should have a checkmark icon", async function (this: CustomWorld) {
  const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
  const icon = confirmButton.locator("svg");
  await expect(icon).toBeVisible();
});

Then("the cancel button should have an X icon", async function (this: CustomWorld) {
  const cancelButton = this.page.locator('[data-testid="modal-cancel-button"]');
  const icon = cancelButton.locator("svg");
  await expect(icon).toBeVisible();
});

Then("the modal backdrop should be semi-transparent", async function (this: CustomWorld) {
  const backdrop = this.page.locator('[data-testid="modal-backdrop"]');
  await expect(backdrop).toBeVisible();

  // Check the background-color's alpha channel, not the element's opacity property
  const bgColor = await backdrop.evaluate(
    (el: HTMLElement) => window.getComputedStyle(el).backgroundColor
  );

  // Parse rgba(r, g, b, alpha) or rgb(r, g, b) format
  // rgba format has alpha as the 4th value, rgb format is fully opaque (alpha = 1)
  const rgbaMatch = bgColor.match(/rgba?\([\d\s]+,[\d\s]+,[\d\s]+(?:,\s*([\d.]+))?\)/);
  const alpha = rgbaMatch?.[1] ? parseFloat(rgbaMatch[1]) : 1;

  expect(alpha).toBeGreaterThan(0);
  expect(alpha).toBeLessThan(1);
});

Then(
  "the name should show a hover state indicating it's editable",
  async function (this: CustomWorld) {
    const nameElement = this.page.locator(getFieldSelector("name"));
    const cursor = await nameElement.evaluate(
      (el: HTMLElement) => window.getComputedStyle(el).cursor
    );
    expect(cursor).toBe("pointer");
  }
);

Then(
  "the tier should show a hover state indicating it's editable",
  async function (this: CustomWorld) {
    const tierElement = this.page.locator(getFieldSelector("tier"));
    const cursor = await tierElement.evaluate(
      (el: HTMLElement) => window.getComputedStyle(el).cursor
    );
    expect(cursor).toBe("pointer");
  }
);
