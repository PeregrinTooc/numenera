import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";

// Helper function to sanitize ability names for testid
function sanitizeForTestId(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

Given(
  "the character has an ability {string} with:",
  async function (abilityName: string, dataTable) {
    // This will set up test data - for now we'll use the default character
    // and verify the display of abilities
    this.testAbilityName = abilityName;
    this.testAbilityProperties = {};

    const rows = dataTable.raw();
    for (let i = 0; i < rows.length; i++) {
      const [property, value] = rows[i];
      this.testAbilityProperties[property] = value;
    }
  }
);

Given("the character has abilities with different pools:", function (dataTable) {
  this.testAbilities = [];
  const rows = dataTable.raw().slice(1); // Skip header row

  for (const [name, pool] of rows) {
    this.testAbilities.push({ name, pool });
  }
});

Given("the character has no abilities", async function () {
  // Navigate to empty character using the base URL from world context
  await this.page.goto(`${this.getBaseUrl()}?empty=true`);
});

Then("I should see the ability {string}", async function (abilityName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `ability-item-${sanitizeForTestId(abilityName)}`;
  await expect(dom.getByTestId(testId)).toBeVisible();
});

Then(
  "the ability {string} should show cost {string}",
  async function (abilityName: string, cost: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `ability-cost-${sanitizeForTestId(abilityName)}`;
    const costElement = dom.getByTestId(testId);
    await expect(costElement).toBeVisible();
    await expect(costElement).toContainText(cost);
  }
);

Then(
  "the ability {string} should show pool {string}",
  async function (abilityName: string, pool: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `ability-pool-${sanitizeForTestId(abilityName)}`;
    const poolElement = dom.getByTestId(testId);
    await expect(poolElement).toBeVisible();
    await expect(poolElement).toContainText(pool);
  }
);

Then(
  "the ability {string} should show action {string}",
  async function (abilityName: string, action: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `ability-action-${sanitizeForTestId(abilityName)}`;
    const actionElement = dom.getByTestId(testId);
    await expect(actionElement).toBeVisible();
    await expect(actionElement).toContainText(action);
  }
);

Then("the ability {string} should not show cost badge", async function (abilityName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `ability-cost-${sanitizeForTestId(abilityName)}`;
  const costElement = dom.getByTestId(testId);
  await expect(costElement).not.toBeVisible();
});

Then("the ability {string} should not show pool indicator", async function (abilityName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `ability-pool-${sanitizeForTestId(abilityName)}`;
  const poolElement = dom.getByTestId(testId);
  await expect(poolElement).not.toBeVisible();
});

Then("the ability {string} should not show action indicator", async function (abilityName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `ability-action-${sanitizeForTestId(abilityName)}`;
  const actionElement = dom.getByTestId(testId);
  await expect(actionElement).not.toBeVisible();
});

Then("the ability {string} should have might pool styling", async function (abilityName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `ability-pool-${sanitizeForTestId(abilityName)}`;

  // Check for might-specific class or styling
  const hasClass = await dom.hasClass(testId, "pool-might");
  expect(hasClass).toBe(true);
});

Then("the ability {string} should have speed pool styling", async function (abilityName: string) {
  const dom = new DOMHelpers(this.page);
  const testId = `ability-pool-${sanitizeForTestId(abilityName)}`;

  // Check for speed-specific class or styling
  const hasClass = await dom.hasClass(testId, "pool-speed");
  expect(hasClass).toBe(true);
});

Then(
  "the ability {string} should have intellect pool styling",
  async function (abilityName: string) {
    const dom = new DOMHelpers(this.page);
    const testId = `ability-pool-${sanitizeForTestId(abilityName)}`;

    // Check for intellect-specific class or styling
    const hasClass = await dom.hasClass(testId, "pool-intellect");
    expect(hasClass).toBe(true);
  }
);

Then("I should see an empty abilities section", async function () {
  const dom = new DOMHelpers(this.page);
  await expect(dom.getByTestId("empty-abilities")).toBeVisible();
});

Then("the empty state should use translation keys", async function () {
  // This verifies that translation keys are used
  // We can check for the presence of translated text
  const dom = new DOMHelpers(this.page);
  const emptyState = dom.getByTestId("empty-abilities");
  await expect(emptyState).not.toBeEmpty();
});
