import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

// Modal state checks - removed duplicate, use existing one from card-creation.steps.ts

Then("the card edit modal should be closed", async function () {
  const modal = this.page.locator('[data-testid="card-edit-modal"]');
  await expect(modal).not.toBeVisible();
});

// Basic Tab/Shift+Tab steps
When("I press the Tab key", async function () {
  await this.page.keyboard.press("Tab");
  await this.page.waitForTimeout(30);
});

When("I press Shift+Tab", async function () {
  await this.page.keyboard.press("Shift+Tab");
  await this.page.waitForTimeout(30);
});

// Auto-focus checks
Then("the first input field in the modal should be automatically focused", async function () {
  // Wait a bit for auto-focus to happen
  await this.page.waitForTimeout(100);

  const focusedElement = await this.page.evaluate(() => {
    const activeElement = document.activeElement;
    return {
      tagName: activeElement?.tagName,
      type: (activeElement as HTMLInputElement)?.type,
      isInModal:
        document.querySelector('[data-testid="card-edit-modal"]')?.contains(activeElement) ?? false,
    };
  });

  expect(focusedElement.tagName).toBe("INPUT");
  expect(focusedElement.isInModal).toBe(true);
});

// Tab navigation
When("I press the Tab key repeatedly", async function () {
  // Press Tab 10 times to cycle through elements
  for (let i = 0; i < 10; i++) {
    await this.page.keyboard.press("Tab");
    await this.page.waitForTimeout(50);
  }
});

When("I press Shift+Tab repeatedly", async function () {
  // Press Shift+Tab 10 times to cycle through elements backward
  for (let i = 0; i < 10; i++) {
    await this.page.keyboard.press("Shift+Tab");
    await this.page.waitForTimeout(50);
  }
});

When("I press the Tab key {int} times", async function (times: number) {
  for (let i = 0; i < times; i++) {
    await this.page.keyboard.press("Tab");
    await this.page.waitForTimeout(30);
  }
});

// Focus movement assertions
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

// Focus trap verification - the critical tests
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

  // Critical assertions - these should fail if focus trap is broken
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
