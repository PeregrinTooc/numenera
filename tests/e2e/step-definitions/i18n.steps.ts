import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";

Given("I am on the character sheet page with {string}", async function (queryString: string) {
  await this.page.goto(`http://localhost:3000${queryString}`);
  // Wait for i18n to initialize
  await this.page.waitForTimeout(200);
});

When("I navigate to the page with {string}", async function (queryString: string) {
  await this.page.goto(`http://localhost:3000${queryString}`);
  // Wait for i18n to initialize
  await this.page.waitForTimeout(200);
});

Then("the page title should be in English", async function () {
  const dom = new DOMHelpers(this.page);
  const title = dom.getByTestId("page-title");
  await expect(title).toHaveText("Numenera Character Sheet");
});

Then("the page title should be {string}", async function (expectedTitle: string) {
  const dom = new DOMHelpers(this.page);
  const title = dom.getByTestId("page-title");
  await expect(title).toHaveText(expectedTitle);
});

Then("the load button should display {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const button = dom.getByTestId("load-button");
  await expect(button).toHaveText(expectedText);
});

Then("the new button should display {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const button = dom.getByTestId("new-button");
  await expect(button).toHaveText(expectedText);
});

Then("the character name label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-name");
  await expect(label).toContainText(expectedText);
});

Then("the character tier label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-tier");
  await expect(label).toContainText(expectedText);
});

Then("the character type label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-type");
  await expect(label).toContainText(expectedText);
});

Then("the character descriptor label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-descriptor");
  await expect(label).toContainText(expectedText);
});

Then("the character focus label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-focus");
  await expect(label).toContainText(expectedText);
});

Then("the stats heading should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const heading = dom.getByTestId("stats-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("the might stat should display {string}", async function (expectedText: string) {
  // The testid uses the translated stat name in lowercase
  const statLabel = this.page.locator('[data-testid^="stat-"][data-testid$="-label"]').first();
  await expect(statLabel).toHaveText(expectedText);
});

Then("the speed stat should display {string}", async function (expectedText: string) {
  // Get the second stat label
  const statLabel = this.page.locator('[data-testid^="stat-"][data-testid$="-label"]').nth(1);
  await expect(statLabel).toHaveText(expectedText);
});

Then("the intellect stat should display {string}", async function (expectedText: string) {
  // Get the third stat label
  const statLabel = this.page.locator('[data-testid^="stat-"][data-testid$="-label"]').nth(2);
  await expect(statLabel).toHaveText(expectedText);
});

Then("the stat pool label should be {string}", async function (expectedText: string) {
  // Find any element containing the expected text within stats section (div or label)
  const element = this.page
    .locator('[data-testid="stats-section"]', { hasText: expectedText })
    .first();
  await expect(element).toBeVisible();
});

Then("the stat edge label should be {string}", async function (expectedText: string) {
  // Find label element containing the expected text within stats section
  const label = this.page
    .locator('[data-testid="stats-section"] label', { hasText: expectedText })
    .first();
  await expect(label).toBeVisible();
});

Then("the stat current label should be {string}", async function (expectedText: string) {
  // Find label element containing the expected text within stats section
  const label = this.page
    .locator('[data-testid="stats-section"] label', { hasText: expectedText })
    .first();
  await expect(label).toBeVisible();
});

Then("the cyphers heading should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const heading = dom.getByTestId("cyphers-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("cypher level labels should display {string}", async function (expectedText: string) {
  // Check first cypher's level label contains the expected text
  const levelText = await this.page.locator('[data-testid^="cypher-level-"]').first().textContent();
  expect(levelText).toContain(expectedText);
});

Then("the artifacts heading should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const heading = dom.getByTestId("artifacts-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("artifact level labels should display {string}", async function (expectedText: string) {
  // Check first artifact's level label contains the expected text
  const levelText = await this.page
    .locator('[data-testid^="artifact-level-"]')
    .first()
    .textContent();
  expect(levelText).toContain(expectedText);
});

Then("the oddities heading should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const heading = dom.getByTestId("oddities-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("the text fields heading should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const heading = dom.getByTestId("text-fields-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("the background field label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-background");
  await expect(label).toHaveText(expectedText);
});

Then("the notes field label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-notes");
  await expect(label).toHaveText(expectedText);
});

Then("the equipment field label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-equipment");
  await expect(label).toHaveText(expectedText);
});

Then("the abilities field label should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const label = dom.getByTestId("label-abilities");
  await expect(label).toHaveText(expectedText);
});

Then("the empty cyphers message should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const message = dom.getByTestId("empty-cyphers");
  await expect(message).toHaveText(expectedText);
});

Then("the empty artifacts message should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const message = dom.getByTestId("empty-artifacts");
  await expect(message).toHaveText(expectedText);
});

Then("the empty oddities message should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const message = dom.getByTestId("empty-oddities");
  await expect(message).toHaveText(expectedText);
});

Then("the empty background message should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const message = dom.getByTestId("empty-background");
  await expect(message).toHaveText(expectedText);
});

Then("the empty notes message should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const message = dom.getByTestId("empty-notes");
  await expect(message).toHaveText(expectedText);
});

Then("the empty equipment message should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const message = dom.getByTestId("empty-equipment");
  await expect(message).toHaveText(expectedText);
});

Then("the empty abilities message should be {string}", async function (expectedText: string) {
  const dom = new DOMHelpers(this.page);
  const message = dom.getByTestId("empty-abilities");
  await expect(message).toHaveText(expectedText);
});

Then("the language should remain German", async function () {
  const dom = new DOMHelpers(this.page);
  const title = dom.getByTestId("page-title");
  await expect(title).toHaveText("Numenera Charakterbogen");
});
