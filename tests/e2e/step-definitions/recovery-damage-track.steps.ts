import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { waitForSaveComplete } from "../support/save.js";
import { waitForNewCharacterPersisted } from "../support/app-ready.js";
import type { CustomWorld } from "../support/world.js";
import type { DamageTrack } from "@/types/character";

Then("I should see a section titled {string}", async function (title: string) {
  const text = await this.page.textContent("body");
  expect(text).toContain(title);
});

Then("I should see the recovery modifier display {string}", async function (display: string) {
  const recoveryDisplay = this.dom.getByTestId("recovery-modifier-display");
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
  this.testRecoveryRoll = rollType;
});

Then("the {string} recovery checkbox should be checked", async function (rollType: string) {
  const sanitized = rollType.toLowerCase().replace(/\s+/g, "-");
  const checkbox = this.dom.getByTestId(`recovery-${sanitized}`);
  await expect(checkbox).toBeChecked();
});

Then("the {string} recovery checkbox should be unchecked", async function (rollType: string) {
  const sanitized = rollType.toLowerCase().replace(/\s+/g, "-");
  const checkbox = this.dom.getByTestId(`recovery-${sanitized}`);
  await expect(checkbox).not.toBeChecked();
});

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

Given("the character is {string}", async function (this: CustomWorld, impairmentStatus: string) {
  await this.setup.updateCharacter((character) => {
    character.damageTrack.impairment = impairmentStatus as DamageTrack["impairment"];
  });

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
  const sanitized = status.toLowerCase();
  const radio = this.dom.getByTestId(`damage-${sanitized}`);
  await expect(radio).toBeChecked();
});

Then("the {string} radio button should not be selected", async function (status: string) {
  const sanitized = status.toLowerCase();
  const radio = this.dom.getByTestId(`damage-${sanitized}`);
  await expect(radio).not.toBeChecked();
});

Then("the recovery rolls section should have green styling", async function () {
  const section = this.dom.getByTestId("recovery-rolls-section");
  await expect(section).toBeVisible();

  const hasGreenTheme = await this.dom.hasClass("recovery-rolls-section", "from-green-50");
  expect(hasGreenTheme).toBe(true);
});

Then("the damage track section should have red styling", async function () {
  const section = this.dom.getByTestId("damage-track-section");
  await expect(section).toBeVisible();

  const hasRedTheme = await this.dom.hasClass("damage-track-section", "from-red-50");
  expect(hasRedTheme).toBe(true);
});

Given(
  "the character has recovery modifier {int}",
  async function (this: CustomWorld, modifier: number) {
    await this.setup.updateCharacter((character) => {
      character.recoveryRolls.modifier = modifier;
    });

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
  }
);

Then("I should see {string} in the recovery section", async function (text: string) {
  const recoverySection = this.dom.getByTestId("recovery-rolls-section");
  await expect(recoverySection).toContainText(text);
});

Given("the character is new", async function () {
  const newButton = this.page.locator('[data-testid="new-button"]');
  await newButton.click();
  await this.page.waitForSelector('[data-testid="recovery-rolls-section"]', { state: "visible" });
  await waitForNewCharacterPersisted(this.page);
});

Then("all recovery checkboxes should be unchecked", async function () {
  await this.page.waitForSelector('input[type="checkbox"][data-recovery-roll]', {
    state: "visible",
  });
  const checkboxes = await this.page.locator('input[type="checkbox"][data-recovery-roll]').all();
  for (const checkbox of checkboxes) {
    await expect(checkbox).not.toBeChecked();
  }
});

When("I change my recovery modifier to {int}", async function (this: CustomWorld, value: number) {
  await this.character.change("recovery modifier", String(value));
});

When("I click the {string} recovery checkbox", async function (rollType: string) {
  const sanitized = rollType.toLowerCase().replace(/\s+/g, "-");
  const checkbox = this.dom.getByTestId(`recovery-${sanitized}`);
  await checkbox.click();
  await waitForSaveComplete(this.page);
});

When("I select the {string} damage status", async function (status: string) {
  const sanitized = status.toLowerCase();
  const radio = this.dom.getByTestId(`damage-${sanitized}`);
  await radio.click();
  await waitForSaveComplete(this.page);
});
