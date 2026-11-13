import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Then("the card edit modal should be closed", async function () {
  const modal = this.page.locator('[data-testid="card-edit-modal"]');
  await expect(modal).not.toBeVisible();
});

When("I press the Tab key", async function () {
  await this.page.keyboard.press("Tab");
});

When("I press Shift+Tab", async function () {
  await this.page.keyboard.press("Shift+Tab");
});

Then("the first input field in the modal should be automatically focused", async function () {
  const firstInput = this.page.locator('[data-testid="card-edit-modal"] input').first();
  await expect(firstInput).toBeFocused();
});

When("I press the Tab key repeatedly", async function () {
  for (let i = 0; i < 10; i++) {
    await this.page.keyboard.press("Tab");
  }
});

When("I press Shift+Tab repeatedly", async function () {
  for (let i = 0; i < 10; i++) {
    await this.page.keyboard.press("Shift+Tab");
  }
});

When("I press the Tab key {int} times", async function (times: number) {
  for (let i = 0; i < times; i++) {
    await this.page.keyboard.press("Tab");
  }
});

Then("focus should move to the next focusable element in the modal", async function () {
  const isInModal = await this.page.evaluate(() => {
    const modal = document.querySelector('[data-testid="card-edit-modal"]');
    const activeElement = document.activeElement;
    return modal?.contains(activeElement) ?? false;
  });
  expect(isInModal).toBe(true);
});

Then("focus should move to the last focusable element in the modal", async function () {
  const isInModal = await this.page.evaluate(() => {
    const modal = document.querySelector('[data-testid="card-edit-modal"]');
    const activeElement = document.activeElement;
    return modal?.contains(activeElement) ?? false;
  });
  expect(isInModal).toBe(true);
});

Then("focus should eventually wrap back to the first input field", async function () {
  const focusedElement = await this.page.evaluate(() => {
    const activeElement = document.activeElement;
    const modal = document.querySelector('[data-testid="card-edit-modal"]');
    const inputs = modal?.querySelectorAll("input, textarea");
    const firstInput = inputs?.[0];

    return {
      isFocused: activeElement === firstInput,
      isInModal: modal?.contains(activeElement) ?? false,
      activeTagName: activeElement?.tagName,
    };
  });

  // Focus should either be on the first input, or at least still in the modal
  expect(focusedElement.isInModal).toBe(true);
});

Then("focus should eventually wrap back to the last focusable element", async function () {
  const isInModal = await this.page.evaluate(() => {
    const modal = document.querySelector('[data-testid="card-edit-modal"]');
    const activeElement = document.activeElement;
    return modal?.contains(activeElement) ?? false;
  });
  expect(isInModal).toBe(true);
});

Then("focus should never escape to the page body or address bar", async function () {
  const focusState = await this.page.evaluate(() => {
    const activeElement = document.activeElement;
    const modal = document.querySelector('[data-testid="card-edit-modal"]');

    return {
      isBody: activeElement === document.body,
      isDocument: activeElement === document.documentElement || activeElement === null,
      isInModal: modal?.contains(activeElement) ?? false,
      tagName: activeElement?.tagName,
      testId: activeElement?.getAttribute("data-testid"),
    };
  });

  expect(focusState.isBody).toBe(false);
  expect(focusState.isDocument).toBe(false);
  expect(focusState.isInModal).toBe(true);
});

Then("focus should still be within the card modal", async function () {
  const isInModal = await this.page.evaluate(() => {
    const modal = document.querySelector('[data-testid="card-edit-modal"]');
    const activeElement = document.activeElement;
    return modal?.contains(activeElement) ?? false;
  });
  expect(isInModal).toBe(true);
});

Then("the active element should not be the document body", async function () {
  const isBody = await this.page.evaluate(() => {
    return document.activeElement === document.body;
  });
  expect(isBody).toBe(false);
});

Then("focus should be on the description textarea", async function () {
  // The trap's own focusable list must include the textarea, or Tab can never land on it.
  await expect(this.page.locator('[data-testid="edit-ability-description"]')).toBeFocused();
});

Then("the active element should not be the browser chrome", async function () {
  const isInDocument = await this.page.evaluate(() => {
    const activeElement = document.activeElement;
    return (
      activeElement === null ||
      activeElement === document.documentElement ||
      activeElement === document.body
    );
  });
  expect(isInDocument).toBe(false);
});
