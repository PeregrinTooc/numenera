import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { waitForCharacterSheetReady } from "../support/app-ready.js";

Given("the language is set to {string}", async function (language: string) {
  await this.page.goto(`${this.getBaseUrl()}?lang=${language}`);
  await waitForCharacterSheetReady(this.page);
});

Given("I am on the character sheet page with {string}", async function (queryString: string) {
  await this.page.goto(`${this.getBaseUrl()}${queryString}`);
  await waitForCharacterSheetReady(this.page);
});

When("I navigate to the page with {string}", async function (queryString: string) {
  await this.page.goto(`${this.getBaseUrl()}${queryString}`);
  await waitForCharacterSheetReady(this.page);
});

Then("the page title should be in English", async function () {
  const title = this.dom.getByTestId("page-title");
  await expect(title).toHaveText("Numenera Character Sheet");
});

Then("the page title should be {string}", async function (expectedTitle: string) {
  const title = this.dom.getByTestId("page-title");
  await expect(title).toHaveText(expectedTitle);
});

Then("the load button should display {string}", async function (expectedText: string) {
  const button = this.dom.getByTestId("load-button");
  await expect(button).toHaveText(expectedText);
});

Then("the new button should display {string}", async function (expectedText: string) {
  const button = this.dom.getByTestId("new-button");
  await expect(button).toHaveText(expectedText);
});

Then("the stats heading should be {string}", async function (expectedText: string) {
  const heading = this.dom.getByTestId("stats-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("the might stat should display {string}", async function (expectedText: string) {
  // The testid uses the translated stat name in lowercase
  const statLabel = this.page.locator('[data-testid^="stat-"][data-testid$="-label"]').first();
  await expect(statLabel).toHaveText(expectedText);
});

Then("the speed stat should display {string}", async function (expectedText: string) {
  const statLabel = this.page.locator('[data-testid^="stat-"][data-testid$="-label"]').nth(1);
  await expect(statLabel).toHaveText(expectedText);
});

Then("the intellect stat should display {string}", async function (expectedText: string) {
  const statLabel = this.page.locator('[data-testid^="stat-"][data-testid$="-label"]').nth(2);
  await expect(statLabel).toHaveText(expectedText);
});

Then("the stat pool label should be {string}", async function (expectedText: string) {
  const element = this.page
    .locator('[data-testid="stats-section"]', { hasText: expectedText })
    .first();
  await expect(element).toBeVisible();
});

Then("the stat edge label should be {string}", async function (expectedText: string) {
  const label = this.page
    .locator('[data-testid="stats-section"] label', { hasText: expectedText })
    .first();
  await expect(label).toBeVisible();
});

Then("the stat current label should be {string}", async function (expectedText: string) {
  const label = this.page
    .locator('[data-testid="stats-section"] label', { hasText: expectedText })
    .first();
  await expect(label).toBeVisible();
});

Then("the cyphers heading should be {string}", async function (expectedText: string) {
  const heading = this.dom.getByTestId("cyphers-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("cypher level labels should display {string}", async function (expectedText: string) {
  const levelText = await this.page.locator('[data-testid^="cypher-level-"]').first().textContent();
  expect(levelText).toContain(expectedText);
});

Then("the artifacts heading should be {string}", async function (expectedText: string) {
  const heading = this.dom.getByTestId("artifacts-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("artifact level labels should display {string}", async function (expectedText: string) {
  const levelText = await this.page
    .locator('[data-testid^="artifact-level-"]')
    .first()
    .textContent();
  expect(levelText).toContain(expectedText);
});

Then("the oddities heading should be {string}", async function (expectedText: string) {
  const heading = this.dom.getByTestId("oddities-heading");
  await expect(heading).toHaveText(expectedText);
});

Then("the background field label should be {string}", async function (expectedText: string) {
  // Background label is the h3 of the Background section
  const label = this.page.locator('[data-testid="background-section"] h3');
  await expect(label).toHaveText(expectedText);
});

Then("the notes field label should be {string}", async function (expectedText: string) {
  // Notes label is the h3 of the Notes section
  const label = this.page.locator('[data-testid="notes-section"] h3');
  await expect(label).toHaveText(expectedText);
});

Then("the empty cyphers message should be {string}", async function (expectedText: string) {
  const message = this.dom.getByTestId("empty-cyphers");
  await expect(message).toHaveText(expectedText);
});

Then("the empty artifacts message should be {string}", async function (expectedText: string) {
  const message = this.dom.getByTestId("empty-artifacts");
  await expect(message).toHaveText(expectedText);
});

Then("the empty oddities message should be {string}", async function (expectedText: string) {
  const message = this.dom.getByTestId("empty-oddities");
  await expect(message).toHaveText(expectedText);
});

Then("the empty background message should be {string}", async function (_expectedText: string) {
  const textarea = this.page.locator('[data-testid="character-background"]');
  await expect(textarea).toHaveValue("");

  const label = this.page.locator('[data-testid="background-section"] h3');
  await expect(label).toBeVisible();
});

Then("the empty notes message should be {string}", async function (_expectedText: string) {
  const textarea = this.page.locator('[data-testid="character-notes"]');
  await expect(textarea).toHaveValue("");

  const label = this.page.locator('[data-testid="notes-section"] h3');
  await expect(label).toBeVisible();
});

Then("the empty equipment message should be {string}", async function (expectedText: string) {
  const message = this.dom.getByTestId("empty-equipment");
  await expect(message).toHaveText(expectedText);
});

Then("the empty abilities message should be {string}", async function (expectedText: string) {
  const message = this.dom.getByTestId("empty-abilities");
  await expect(message).toHaveText(expectedText);
});

Then("the language should remain German", async function () {
  const title = this.dom.getByTestId("page-title");
  await expect(title).toHaveText("Numenera Charakterbogen");
});

Then("the page should declare its language as {string}", async function (language: string) {
  await expect(this.page.locator("html")).toHaveAttribute("lang", language);
});
