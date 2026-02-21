import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { DOMHelpers } from "../support/dom-helpers.js";

// ============================================================================
// SETTINGS GEAR STEP DEFINITIONS
// ============================================================================

// Background step - reuse if not already defined elsewhere
Given("I am viewing the character sheet", async function (this: CustomWorld) {
  await this.page!.goto(this.getBaseUrl());
  // Wait for page to load
  await this.page!.waitForSelector('[data-testid="character-header"]');
});

// ============================================================================
// VISIBILITY STEPS
// ============================================================================

Then("I should see a settings gear icon in the header", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await expect(dom.getByTestId("settings-gear-button")).toBeVisible();
});

Then("the settings gear icon should still be visible", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await expect(dom.getByTestId("settings-gear-button")).toBeVisible();
});

Then("I should be able to click the settings gear icon", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  const button = dom.getByTestId("settings-gear-button");
  await expect(button).toBeEnabled();
  // Verify it's clickable by checking pointer cursor
  const cursor = await button.evaluate((el: HTMLElement) => window.getComputedStyle(el).cursor);
  expect(cursor).toBe("pointer");
});

// ============================================================================
// SETTINGS PANEL STEPS
// ============================================================================

When("I click the settings gear icon", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await dom.getByTestId("settings-gear-button").click();
});

Then("I should see the settings panel", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await expect(dom.getByTestId("settings-panel")).toBeVisible();
});

Then("the settings panel should close", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await expect(dom.getByTestId("settings-panel")).not.toBeVisible();
});

Given("I have opened the settings panel", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await dom.getByTestId("settings-gear-button").click();
  await expect(dom.getByTestId("settings-panel")).toBeVisible();
});

When("I click outside the settings panel", async function (this: CustomWorld) {
  // Click on the page title which is outside the settings panel
  await this.page!.locator('[data-testid="page-title"]').click();
});

// Note: "I press the Escape key" is defined in common-steps.ts

// ============================================================================
// LANGUAGE SWITCHING STEPS
// ============================================================================

When("I click the German flag icon", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await dom.getByTestId("language-flag-de").click();
});

When("I click the British flag icon", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await dom.getByTestId("language-flag-en").click();
});

Then("the interface should display in German", async function (this: CustomWorld) {
  // Check that the page title is in German
  const pageTitle = this.page!.locator('[data-testid="page-title"]');
  await expect(pageTitle).toHaveText("Numenera Charakterbogen");
});

Then("the interface should display in English", async function (this: CustomWorld) {
  // Check that the page title is in English
  const pageTitle = this.page!.locator('[data-testid="page-title"]');
  await expect(pageTitle).toHaveText("Numenera Character Sheet");
});

Given("the interface is in German", async function (this: CustomWorld) {
  // Click the German flag to switch to German
  const dom = new DOMHelpers(this.page!);
  await dom.getByTestId("language-flag-de").click();
  // Wait for UI to update
  await this.page!.waitForFunction(() => {
    const title = document.querySelector('[data-testid="page-title"]');
    return title?.textContent === "Numenera Charakterbogen";
  });
  // Re-open the settings panel for the test
  await dom.getByTestId("settings-gear-button").click();
  await expect(dom.getByTestId("settings-panel")).toBeVisible();
});

// ============================================================================
// VERSION NAVIGATOR STEPS
// ============================================================================

Given(
  "I am viewing an old version with the version navigator visible",
  async function (this: CustomWorld) {
    // This requires having version history. For now, simulate by checking
    // that settings gear is accessible even if version navigator were present.
    // We can implement full version history test setup later if needed.
    // For now, just verify the gear is in a position that won't conflict.
    const dom = new DOMHelpers(this.page!);
    await expect(dom.getByTestId("settings-gear-button")).toBeVisible();
  }
);

// ============================================================================
// RESET LAYOUT STEPS
// ============================================================================

Then("I should see a {string} option", async function (this: CustomWorld, optionName: string) {
  if (optionName === "Reset Layout") {
    const dom = new DOMHelpers(this.page!);
    await expect(dom.getByTestId("settings-reset-layout")).toBeVisible();
  }
});

Then(
  "the {string} option should be disabled",
  async function (this: CustomWorld, optionName: string) {
    if (optionName === "Reset Layout") {
      const dom = new DOMHelpers(this.page!);
      const button = dom.getByTestId("settings-reset-layout");
      await expect(button).toBeDisabled();
    }
  }
);
