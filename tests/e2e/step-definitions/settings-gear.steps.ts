import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { openSettingsPanel } from "../support/settings.js";

Given("I am viewing the character sheet", async function (this: CustomWorld) {
  await this.page.goto(this.getBaseUrl());
  await this.page.waitForSelector('[data-testid="character-header"]');
});

Then("I should see a settings gear icon in the header", async function (this: CustomWorld) {
  await expect(this.dom.getByTestId("settings-gear-button")).toBeVisible();
});

Then("the settings gear icon should still be visible", async function (this: CustomWorld) {
  await expect(this.dom.getByTestId("settings-gear-button")).toBeVisible();
});

Then("I should be able to click the settings gear icon", async function (this: CustomWorld) {
  const button = this.dom.getByTestId("settings-gear-button");
  await expect(button).toBeEnabled();
  const cursor = await button.evaluate((el: HTMLElement) => window.getComputedStyle(el).cursor);
  expect(cursor).toBe("pointer");
});

When("I click the settings gear icon", async function (this: CustomWorld) {
  await this.dom.getByTestId("settings-gear-button").click();
});

Then("I should see the settings panel", async function (this: CustomWorld) {
  await expect(this.dom.getByTestId("settings-panel")).toBeVisible();
});

Then("the settings panel should close", async function (this: CustomWorld) {
  await expect(this.dom.getByTestId("settings-panel")).not.toBeVisible();
});

Given("I have opened the settings panel", async function (this: CustomWorld) {
  await openSettingsPanel(this);
});

When("I click outside the settings panel", async function (this: CustomWorld) {
  // Click the page title's top-left corner. On phones the title wraps and the
  // panel covers its centre, so a centre click would land on the panel itself.
  const title = this.page.locator('[data-testid="page-title"]');
  const titleBox = await title.boundingBox();
  const panelBox = await this.dom.getByTestId("settings-panel").boundingBox();
  if (!titleBox || !panelBox) {
    throw new Error("Page title or settings panel has no bounding box");
  }
  const offset = { x: 2, y: 2 };
  const point = { x: titleBox.x + offset.x, y: titleBox.y + offset.y };
  const insidePanel =
    point.x >= panelBox.x &&
    point.x <= panelBox.x + panelBox.width &&
    point.y >= panelBox.y &&
    point.y <= panelBox.y + panelBox.height;
  expect(insidePanel, "click point must be outside the settings panel").toBe(false);
  // locator.click also verifies the title (not the panel) receives the click.
  await title.click({ position: offset });
});

When("I click the German flag icon", async function (this: CustomWorld) {
  await this.dom.getByTestId("language-flag-de").click();
});

When("I click the British flag icon", async function (this: CustomWorld) {
  await this.dom.getByTestId("language-flag-en").click();
});

Then("the interface should display in German", async function (this: CustomWorld) {
  const pageTitle = this.page.locator('[data-testid="page-title"]');
  await expect(pageTitle).toHaveText("Numenera Charakterbogen");
});

Then("the interface should display in English", async function (this: CustomWorld) {
  const pageTitle = this.page.locator('[data-testid="page-title"]');
  await expect(pageTitle).toHaveText("Numenera Character Sheet");
});

Given("the interface is in German", async function (this: CustomWorld) {
  await this.dom.getByTestId("language-flag-de").click();
  await this.page.waitForFunction(() => {
    const title = document.querySelector('[data-testid="page-title"]');
    return title?.textContent === "Numenera Charakterbogen";
  });
  await this.dom.getByTestId("settings-gear-button").click();
  await expect(this.dom.getByTestId("settings-panel")).toBeVisible();
});

Given(
  "I am viewing an old version with the version navigator visible",
  async function (this: CustomWorld) {
    await expect(this.dom.getByTestId("settings-gear-button")).toBeVisible();
  }
);

Then("I should see a {string} option", async function (this: CustomWorld, optionName: string) {
  if (optionName === "Reset Layout") {
    await expect(this.dom.getByTestId("settings-reset-layout")).toBeVisible();
  }
});

Then(
  "the {string} option should be disabled",
  async function (this: CustomWorld, optionName: string) {
    if (optionName === "Reset Layout") {
      const button = this.dom.getByTestId("settings-reset-layout");
      await expect(button).toBeDisabled();
    }
  }
);
