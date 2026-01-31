import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";

// Recovery Rolls step definitions

Then("I should see a section titled {string}", async function (title: string) {
  const text = await this.page.textContent("body");
  expect(text).toContain(title);
});

Then("I should see the recovery modifier display {string}", async function (display: string) {
  const dom = new DOMHelpers(this.page);
  const recoveryDisplay = dom.getByTestId("recovery-modifier-display");
  await expect(recoveryDisplay).toBeVisible();
  await expect(recoveryDisplay).toContainText(display);
});

Then("I should see {int} recovery roll checkboxes", async function (count: number) {
  const checkboxes = await this.page.locator('input[type="checkbox"][data-recovery-roll]').count();
  expect(checkboxes).toBe(count);
});

Then(
  "I should see recovery roll {string} with time {string}",
  async function (rollName: string, timeText: string) {
    const text = await this.page.textContent("body");
    expect(text).toContain(rollName);
    expect(text).toContain(timeText);
  }
);

Given("the character has {string} recovery used", async function (rollType: string) {
  // This is already set in FULL_CHARACTER mock data
  this.testRecoveryRoll = rollType;
});

Then("the {string} recovery checkbox should be checked", async function (rollType: string) {
  const dom = new DOMHelpers(this.page);
  const sanitized = rollType.toLowerCase().replace(/\s+/g, "-");
  const checkbox = dom.getByTestId(`recovery-${sanitized}`);
  await expect(checkbox).toBeChecked();
});

Then("the {string} recovery checkbox should be unchecked", async function (rollType: string) {
  const dom = new DOMHelpers(this.page);
  const sanitized = rollType.toLowerCase().replace(/\s+/g, "-");
  const checkbox = dom.getByTestId(`recovery-${sanitized}`);
  await expect(checkbox).not.toBeChecked();
});

// Damage Track step definitions

Then("I should see {int} damage status options", async function (count: number) {
  const radios = await this.page.locator('input[type="radio"][name="damage-track"]').count();
  expect(radios).toBe(count);
});

Then("I should see damage status {string}", async function (status: string) {
  const text = await this.page.textContent("body");
  expect(text).toContain(status);
});

Then(
  "I should see damage status {string} with description {string}",
  async function (status: string, description: string) {
    const text = await this.page.textContent("body");
    expect(text).toContain(status);
    expect(text).toContain(description);
  }
);

Given("the character is {string}", async function (impairmentStatus: string) {
  // Modify character in localStorage to have the specified impairment status
  await this.page.evaluate((status: string) => {
    const stored = localStorage.getItem("numenera-character-state");
    if (stored) {
      const character = JSON.parse(stored);
      // Use raw format (no wrapper) - ensure damageTrack exists
      if (character && character.damageTrack) {
        character.damageTrack.impairment = status;
        localStorage.setItem("numenera-character-state", JSON.stringify(character));
      }
    }
  }, impairmentStatus);

  // Reload page to pick up the changes
  await this.page.reload({ waitUntil: "domcontentloaded" });

  // Wait for damage track section to be visible and correct radio button to be selected
  await this.page.waitForSelector('[data-testid="damage-track-section"]', { state: "visible" });
  const sanitized = impairmentStatus.toLowerCase();
  await this.page.waitForFunction(
    (status: string) => {
      const radio = document.querySelector(`[data-testid="damage-${status}"]`) as HTMLInputElement;
      return radio?.checked === true;
    },
    sanitized,
    { timeout: 2000 }
  );
});

Then("the {string} radio button should be selected", async function (status: string) {
  const dom = new DOMHelpers(this.page);
  const sanitized = status.toLowerCase();
  const radio = dom.getByTestId(`damage-${sanitized}`);
  await expect(radio).toBeChecked();
});

Then("the {string} radio button should not be selected", async function (status: string) {
  const dom = new DOMHelpers(this.page);
  const sanitized = status.toLowerCase();
  const radio = dom.getByTestId(`damage-${sanitized}`);
  await expect(radio).not.toBeChecked();
});

// Styling step definitions

Then("the recovery rolls section should have green styling", async function () {
  const dom = new DOMHelpers(this.page);
  const section = dom.getByTestId("recovery-rolls-section");
  await expect(section).toBeVisible();

  // Check for green-themed classes
  const hasGreenTheme = await dom.hasClass("recovery-rolls-section", "from-green-50");
  expect(hasGreenTheme).toBe(true);
});

Then("the damage track section should have red styling", async function () {
  const dom = new DOMHelpers(this.page);
  const section = dom.getByTestId("damage-track-section");
  await expect(section).toBeVisible();

  // Check for red-themed classes
  const hasRedTheme = await dom.hasClass("damage-track-section", "from-red-50");
  expect(hasRedTheme).toBe(true);
});

// Recovery modifier step definitions

Given("the character has recovery modifier {int}", async function (modifier: number) {
  // Modify character in localStorage to have the specified recovery modifier
  await this.page.evaluate((mod: number) => {
    const stored = localStorage.getItem("numenera-character-state");
    if (stored) {
      const character = JSON.parse(stored);
      // Use raw format (no wrapper)
      if (character && character.recoveryRolls) {
        character.recoveryRolls.modifier = mod;
        localStorage.setItem("numenera-character-state", JSON.stringify(character));
      }
    }
  }, modifier);

  // Reload page to pick up the changes
  await this.page.reload({ waitUntil: "domcontentloaded" });

  // Wait for recovery modifier display to show correct value
  // The display shows "1d6 + X" format
  await this.page.waitForFunction(
    (expectedModifier: number) => {
      const display = document.querySelector('[data-testid="recovery-modifier-display"]');
      const sign = expectedModifier >= 0 ? "+" : "";
      const expectedText = `1d6 ${sign} ${expectedModifier}`;
      return display?.textContent?.includes(expectedText) === true;
    },
    modifier,
    { timeout: 2000 }
  );
});

Then("I should see {string} in the recovery section", async function (text: string) {
  const dom = new DOMHelpers(this.page);
  const recoverySection = dom.getByTestId("recovery-rolls-section");
  await expect(recoverySection).toContainText(text);
});

// New character step definitions

Given("the character is new", async function () {
  // Click the NEW button to load NEW_CHARACTER
  const newButton = this.page.locator('[data-testid="new-button"]');
  await newButton.click();
  // Wait for the recovery rolls section to be visible
  await this.page.waitForSelector('[data-testid="recovery-rolls-section"]', { state: "visible" });
  await this.page.waitForTimeout(500);
});

Then("all recovery checkboxes should be unchecked", async function () {
  // Wait for checkboxes to be present
  await this.page.waitForSelector('input[type="checkbox"][data-recovery-roll]', {
    state: "visible",
  });
  const checkboxes = await this.page.locator('input[type="checkbox"][data-recovery-roll]').all();
  for (const checkbox of checkboxes) {
    await expect(checkbox).not.toBeChecked();
  }
});

// Edit recovery modifier step definitions

When("I click on the recovery modifier display", async function () {
  const dom = new DOMHelpers(this.page);
  const modifierDisplay = dom.getByTestId("recovery-modifier-display");
  await modifierDisplay.click();
  await this.page.waitForTimeout(200);
});

When("I enter {string} in the modifier field", async function (value: string) {
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill(value);
});

Then("I should see an edit modal", async function () {
  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible();
});

When("I confirm the edit", async function () {
  const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
  await confirmButton.click();
  await this.page.waitForTimeout(200);
});
