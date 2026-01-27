import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";

Then("the following elements should exist in the DOM:", async function (dataTable) {
  const dom = new DOMHelpers(this.page);

  for (const row of dataTable.rows().slice(1)) {
    const [_label, testId] = row;
    const element = dom.getByTestId(testId);
    await expect(element).toBeAttached();
  }
});

Then("the following basic info elements should exist:", async function (dataTable) {
  const dom = new DOMHelpers(this.page);

  for (const row of dataTable.rows().slice(1)) {
    const [_field, labelTestId, valueTestId] = row;

    const label = dom.getByTestId(labelTestId);
    await expect(label).toBeAttached();

    const value = dom.getByTestId(valueTestId);
    await expect(value).toBeAttached();
  }
});

Then("each stat pool should have the following elements:", async function (dataTable) {
  const dom = new DOMHelpers(this.page);

  for (const row of dataTable.rows().slice(1)) {
    const [_stat, containerTestId, labelTestId, poolTestId, edgeTestId, currentTestId] = row;

    // Verify container exists
    const container = dom.getByTestId(containerTestId);
    await expect(container).toBeAttached();

    // Verify label exists
    const label = dom.getByTestId(labelTestId);
    await expect(label).toBeAttached();

    // Verify pool, edge, current values exist
    await expect(dom.getByTestId(poolTestId)).toBeAttached();
    await expect(dom.getByTestId(edgeTestId)).toBeAttached();
    await expect(dom.getByTestId(currentTestId)).toBeAttached();
  }
});

Then(
  "the cyphers section should have a heading with testid {string}",
  async function (testId: string) {
    const dom = new DOMHelpers(this.page);
    await expect(dom.getByTestId(testId)).toBeAttached();
  }
);

Then(
  "the cyphers section should have a list with testid {string}",
  async function (testId: string) {
    const dom = new DOMHelpers(this.page);
    await expect(dom.getByTestId(testId)).toBeAttached();
  }
);

Then(
  "the artifacts section should have a heading with testid {string}",
  async function (testId: string) {
    const dom = new DOMHelpers(this.page);
    await expect(dom.getByTestId(testId)).toBeAttached();
  }
);

Then(
  "the artifacts section should have a list with testid {string}",
  async function (testId: string) {
    const dom = new DOMHelpers(this.page);
    await expect(dom.getByTestId(testId)).toBeAttached();
  }
);

Then(
  "the oddities section should have a heading with testid {string}",
  async function (testId: string) {
    const dom = new DOMHelpers(this.page);
    await expect(dom.getByTestId(testId)).toBeAttached();
  }
);

Then(
  "the oddities section should have a list with testid {string}",
  async function (testId: string) {
    const dom = new DOMHelpers(this.page);
    await expect(dom.getByTestId(testId)).toBeAttached();
  }
);

Then("the following text field containers should exist:", async function (dataTable) {
  const dom = new DOMHelpers(this.page);

  for (const row of dataTable.rows().slice(1)) {
    const [_field, containerTestId, labelTestId] = row;

    const container = dom.getByTestId(containerTestId);
    await expect(container).toBeAttached();

    const label = dom.getByTestId(labelTestId);
    await expect(label).toBeAttached();
  }
});

When("I click the new button", async function () {
  const dom = new DOMHelpers(this.page);
  const newButton = dom.getByTestId("new-button");
  await newButton.click();
  // Wait for the page to update
  await this.page.waitForTimeout(100);
});

Then("the element with testid {string} should be visible", async function (testId: string) {
  const dom = new DOMHelpers(this.page);
  await expect(dom.getByTestId(testId)).toBeVisible();
});

Then(
  "I should see {int} element(s) with testid starting with {string}",
  async function (expectedCount: number, testIdPrefix: string) {
    const dom = new DOMHelpers(this.page);
    const actualCount = await dom.count(testIdPrefix);
    expect(actualCount).toBe(expectedCount);
  }
);

Then(
  "I should see exactly {int} buttons in the character header",
  async function (expectedCount: number) {
    const headerButtons = this.page.locator('[data-testid="character-header"] button');
    const actualCount = await headerButtons.count();
    expect(actualCount).toBe(expectedCount);
  }
);

Then("the load button should have testid {string}", async function (testId: string) {
  const dom = new DOMHelpers(this.page);
  const loadButton = dom.getByTestId(testId);
  await expect(loadButton).toBeAttached();
  await expect(loadButton).toHaveText("Load Example");
});

Then("the new button should have testid {string}", async function (testId: string) {
  const dom = new DOMHelpers(this.page);
  const newButton = dom.getByTestId(testId);
  await expect(newButton).toBeAttached();
  await expect(newButton).toHaveText("New");
});

Then("the import button should have testid {string}", async function (testId: string) {
  const dom = new DOMHelpers(this.page);
  const importButton = dom.getByTestId(testId);
  await expect(importButton).toBeAttached();
  await expect(importButton).toHaveText("Import");
});

Then("the export button should have testid {string}", async function (testId: string) {
  const dom = new DOMHelpers(this.page);
  const exportButton = dom.getByTestId(testId);
  await expect(exportButton).toBeAttached();
  await expect(exportButton).toHaveText("Export");
});

// Responsive tests (currently @skip)
Then("the stats section should use responsive mobile classes", async function () {
  const dom = new DOMHelpers(this.page);
  // This is a placeholder for future responsive testing
  // Will check for vertical stacking classes like flex-col
  const hasFlexCol = await dom.hasClass("stats-section", "flex-col");
  expect(hasFlexCol).toBeTruthy();
});

Then("the character sheet should be mobile-optimized", async function () {
  // Placeholder for mobile optimization checks
  // Could check viewport width, font sizes, etc.
  const dom = new DOMHelpers(this.page);
  await expect(dom.getByTestId("character-header")).toBeVisible();
});

Then("the stats section should use responsive desktop classes", async function () {
  const dom = new DOMHelpers(this.page);
  // This is a placeholder for future responsive testing
  // Will check for horizontal layout classes
  const hasFlexRow = await dom.hasClass("stats-section", "flex-row");
  expect(hasFlexRow).toBeTruthy();
});

Then("the character sheet should use multi-column layout", async function () {
  // Placeholder for desktop multi-column layout checks
  const dom = new DOMHelpers(this.page);
  await expect(dom.getByTestId("character-header")).toBeVisible();
});
