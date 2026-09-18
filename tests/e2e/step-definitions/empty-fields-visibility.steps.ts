import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";

Then("the descriptor field should display placeholder text", async function (this: CustomWorld) {
  const descriptorField = this.dom.getByTestId("character-descriptor");
  const text = await descriptorField.textContent();

  // Should show "Descriptor" as placeholder
  expect(text?.trim()).toBe("Descriptor");
});

Then("the focus field should display placeholder text", async function (this: CustomWorld) {
  const focusField = this.dom.getByTestId("character-focus");
  const text = await focusField.textContent();

  // Should show "Focus" as placeholder
  expect(text?.trim()).toBe("Focus");
});

Then("the descriptor field should be visible", async function (this: CustomWorld) {
  const descriptorField = this.dom.getByTestId("character-descriptor");
  await expect(descriptorField).toBeVisible();
});

Then("the focus field should be visible", async function (this: CustomWorld) {
  const focusField = this.dom.getByTestId("character-focus");
  await expect(focusField).toBeVisible();
});

Then("the descriptor field should be clickable", async function (this: CustomWorld) {
  const descriptorField = this.dom.getByTestId("character-descriptor");

  // Verify it has editable-field class
  const hasClass = await descriptorField.evaluate((el) => {
    return el.classList.contains("editable-field");
  });
  expect(hasClass).toBe(true);

  // Verify cursor is pointer
  const cursor = await descriptorField.evaluate((el) => {
    return window.getComputedStyle(el).cursor;
  });
  expect(cursor).toBe("pointer");
});

Then("the focus field should be clickable", async function (this: CustomWorld) {
  const focusField = this.dom.getByTestId("character-focus");

  // Verify it has editable-field class
  const hasClass = await focusField.evaluate((el) => {
    return el.classList.contains("editable-field");
  });
  expect(hasClass).toBe(true);

  // Verify cursor is pointer
  const cursor = await focusField.evaluate((el) => {
    return window.getComputedStyle(el).cursor;
  });
  expect(cursor).toBe("pointer");
});

When("I click on the descriptor field", async function (this: CustomWorld) {
  const descriptorField = this.dom.getByTestId("character-descriptor");
  await descriptorField.click();
  await this.page.waitForTimeout(200);
});

When("I click on the focus field", async function (this: CustomWorld) {
  const focusField = this.dom.getByTestId("character-focus");
  await focusField.click();
  await this.page.waitForTimeout(200);
});

When("I enter {string} in the edit field", async function (this: CustomWorld, value: string) {
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill(value);
});

Then(
  "the descriptor field should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    const descriptorField = this.dom.getByTestId("character-descriptor");
    const text = await descriptorField.textContent();
    expect(text?.trim()).toBe(expectedText);
  }
);

Then(
  "the focus field should display {string}",
  async function (this: CustomWorld, expectedText: string) {
    const focusField = this.dom.getByTestId("character-focus");
    const text = await focusField.textContent();
    expect(text?.trim()).toBe(expectedText);
  }
);

Then("the descriptor field should not show placeholder text", async function (this: CustomWorld) {
  const descriptorField = this.dom.getByTestId("character-descriptor");
  const text = await descriptorField.textContent();

  // Should not be "Descriptor" anymore
  expect(text?.trim()).not.toBe("Descriptor");
  expect(text?.trim().length).toBeGreaterThan(0);
});

Then("the focus field should not show placeholder text", async function (this: CustomWorld) {
  const focusField = this.dom.getByTestId("character-focus");
  const text = await focusField.textContent();

  // Should not be "Focus" anymore
  expect(text?.trim()).not.toBe("Focus");
  expect(text?.trim().length).toBeGreaterThan(0);
});

Then(
  "an edit modal should appear with value {string}",
  async function (this: CustomWorld, expectedValue: string) {
    const modal = this.page.locator('[data-testid="edit-modal"]');
    await expect(modal).toBeVisible();

    const input = this.page.locator('[data-testid="edit-modal-input"]');
    const value = await input.inputValue();
    expect(value).toBe(expectedValue);
  }
);
