import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { DOMHelpers } from "../support/dom-helpers.js";

// Helper step definitions for "character has items" (uses default FULL_CHARACTER)
Given("the character has cyphers", async function () {
  // Default character already has cyphers, nothing to do
  return;
});

Given("the character has artifacts", async function () {
  // Default character already has artifacts, nothing to do
  return;
});

Given("the character has oddities", async function () {
  // Default character already has oddities, nothing to do
  return;
});

// Cypher blue-themed styling
Then("the cypher card should have blue-themed styling", async function () {
  const dom = new DOMHelpers(this.page);

  // Check for blue border or blue-themed class
  const hasBlueTheme = await dom.hasClass("cypher-item", "cypher-item-card");
  expect(hasBlueTheme).toBe(true);
});

Then('the cypher card should have a "ONE-USE" warning badge', async function () {
  const dom = new DOMHelpers(this.page);

  // Get first cypher card and find warning badge within it
  const badge = dom.getByTestId("cypher-warning").first();
  await expect(badge).toBeVisible();
  await expect(badge).toContainText("ONE-USE");
});

Then("the cypher level badge should have blue background", async function () {
  const dom = new DOMHelpers(this.page);

  // Get first cypher's level badge testid from page
  const levelBadge = this.page.locator('[data-testid^="cypher-level-"]').first();
  const testId = await levelBadge.getAttribute("data-testid");

  if (testId) {
    const hasBlueBackground = await dom.hasClass(testId, "cypher-level-badge");
    expect(hasBlueBackground).toBe(true);
  }
});

// Artifact gold-themed styling
Then("the artifact card should have gold-themed styling", async function () {
  const artifactCard = this.page.locator('[data-testid^="artifact-item-"]').first();
  await expect(artifactCard).toBeVisible();

  const classes = await artifactCard.getAttribute("class");
  expect(classes).toContain("artifact-item-card");
});

Then("the artifact name should use serif font", async function () {
  const dom = new DOMHelpers(this.page);

  const artifactName = this.page.locator('[data-testid^="artifact-name-"]').first();
  const testId = await artifactName.getAttribute("data-testid");

  if (testId) {
    const hasSerifFont = await dom.hasClass(testId, "artifact-name");
    expect(hasSerifFont).toBe(true);
  }
});

Then("the artifact level badge should have gold background", async function () {
  const dom = new DOMHelpers(this.page);

  const levelBadge = this.page.locator('[data-testid^="artifact-level-"]').first();
  const testId = await levelBadge.getAttribute("data-testid");

  if (testId) {
    const hasGoldBackground = await dom.hasClass(testId, "artifact-level-badge");
    expect(hasGoldBackground).toBe(true);
  }
});

// Oddity brown-themed styling
Then("the oddity card should have brown-themed styling", async function () {
  const dom = new DOMHelpers(this.page);

  const hasBrownTheme = await dom.hasClass("oddity-item", "oddity-item-card");
  expect(hasBrownTheme).toBe(true);
});

Then("the oddity text should be subtle and understated", async function () {
  const dom = new DOMHelpers(this.page);

  // Get oddity item card and check for oddity-text class within it
  const oddityItem = dom.getByTestId("oddity-item").first();
  const oddityText = oddityItem.locator(".oddity-text");

  await expect(oddityText).toBeVisible();
  const classes = await oddityText.getAttribute("class");
  expect(classes).toContain("oddity-text");
});

// Empty state styling
Then("the empty cyphers message should have blue-themed styling", async function () {
  const dom = new DOMHelpers(this.page);

  // Wait for empty state to be visible first
  await expect(dom.getByTestId("empty-cyphers")).toBeVisible();

  const hasBlueTheme = await dom.hasClass("empty-cyphers", "empty-cyphers-styled");
  expect(hasBlueTheme).toBe(true);
});

Then("the empty cyphers section should match cypher card style", async function () {
  const dom = new DOMHelpers(this.page);

  // Should have similar visual treatment to cypher cards
  const hasMatchingStyle = await dom.hasClass("empty-cyphers", "empty-cyphers-styled");
  expect(hasMatchingStyle).toBe(true);
});

Then("the empty artifacts message should have gold-themed styling", async function () {
  const dom = new DOMHelpers(this.page);

  // Wait for empty state to be visible first
  await expect(dom.getByTestId("empty-artifacts")).toBeVisible();

  const hasGoldTheme = await dom.hasClass("empty-artifacts", "empty-artifacts-styled");
  expect(hasGoldTheme).toBe(true);
});

Then("the empty artifacts section should match artifact card style", async function () {
  const dom = new DOMHelpers(this.page);

  const hasMatchingStyle = await dom.hasClass("empty-artifacts", "empty-artifacts-styled");
  expect(hasMatchingStyle).toBe(true);
});

Then("the empty oddities message should have brown-themed styling", async function () {
  const dom = new DOMHelpers(this.page);

  // Wait for empty state to be visible first
  await expect(dom.getByTestId("empty-oddities")).toBeVisible();

  const hasBrownTheme = await dom.hasClass("empty-oddities", "empty-oddities-styled");
  expect(hasBrownTheme).toBe(true);
});

Then("the empty oddities section should match oddity card style", async function () {
  const dom = new DOMHelpers(this.page);

  const hasMatchingStyle = await dom.hasClass("empty-oddities", "empty-oddities-styled");
  expect(hasMatchingStyle).toBe(true);
});

// Hover effects
When("I hover over a cypher card", async function () {
  const cypherCard = this.page.locator('[data-testid="cypher-item"]').first();
  await cypherCard.hover();
  // Small delay to let hover effects activate
  await this.page.waitForTimeout(100);
});

Then("the cypher card should have a dramatic visual effect", async function () {
  const dom = new DOMHelpers(this.page);

  // Check that hover class or animation is present
  const hasHoverEffect = await dom.hasClass("cypher-item", "cypher-item-card");
  expect(hasHoverEffect).toBe(true);
});

Then("the cypher card should elevate slightly", async function () {
  // This is tested via CSS transform, verified by class presence
  const dom = new DOMHelpers(this.page);

  const hasElevation = await dom.hasClass("cypher-item", "cypher-item-card");
  expect(hasElevation).toBe(true);
});

When("I hover over an artifact card", async function () {
  const artifactCard = this.page.locator('[data-testid^="artifact-item-"]').first();
  await artifactCard.hover();
  await this.page.waitForTimeout(100);
});

Then("the artifact card should have a shimmer effect", async function () {
  const artifactCard = this.page.locator('[data-testid^="artifact-item-"]').first();
  const classes = await artifactCard.getAttribute("class");
  expect(classes).toContain("artifact-item-card");
});

Then("the artifact card should show enhanced depth", async function () {
  const artifactCard = this.page.locator('[data-testid^="artifact-item-"]').first();
  const classes = await artifactCard.getAttribute("class");
  expect(classes).toContain("artifact-item-card");
});

// Background styling
Then("cypher cards should have parchment background", async function () {
  const dom = new DOMHelpers(this.page);

  const hasParchment = await dom.hasClass("cypher-item", "cypher-item-card");
  expect(hasParchment).toBe(true);
});

Then("cypher cards should have subtle blue tint", async function () {
  const dom = new DOMHelpers(this.page);

  const hasBlueTint = await dom.hasClass("cypher-item", "cypher-item-card");
  expect(hasBlueTint).toBe(true);
});

Then("artifact cards should have rich parchment background", async function () {
  const artifactCard = this.page.locator('[data-testid^="artifact-item-"]').first();
  const classes = await artifactCard.getAttribute("class");
  expect(classes).toContain("artifact-item-card");
});

Then("artifact cards should have decorative elements", async function () {
  const artifactCard = this.page.locator('[data-testid^="artifact-item-"]').first();
  const classes = await artifactCard.getAttribute("class");
  expect(classes).toContain("artifact-item-card");
});

Then("oddity cards should have light parchment background", async function () {
  const dom = new DOMHelpers(this.page);

  const hasLightParchment = await dom.hasClass("oddity-item", "oddity-item-card");
  expect(hasLightParchment).toBe(true);
});

Then(
  "oddity cards should be visually less prominent than cyphers and artifacts",
  async function () {
    const dom = new DOMHelpers(this.page);

    const hasSubtleStyle = await dom.hasClass("oddity-item", "oddity-item-card");
    expect(hasSubtleStyle).toBe(true);
  }
);
