import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

// Scenario: Clear character data via clear button
Given("a character is currently displayed", async function () {
  // Character is loaded by default (from the Background step in character-display.steps.ts)
  // Just verify we're on the page
  await expect(this.page.getByTestId("character-name")).toBeVisible();
});

When('I click the "Clear" button', async function () {
  const clearButton = this.page.getByTestId("clear-button");
  await clearButton.click();
});

Then("the character sheet should show empty states", async function () {
  // Verify empty states for items
  await expect(this.page.getByTestId("empty-cyphers")).toBeVisible();
  await expect(this.page.getByTestId("empty-artifacts")).toBeVisible();
  await expect(this.page.getByTestId("empty-oddities")).toBeVisible();
});

Then("all sections should display empty state messages", async function () {
  // Verify empty states for text fields
  await expect(this.page.getByTestId("empty-background")).toBeVisible();
  await expect(this.page.getByTestId("empty-notes")).toBeVisible();
  await expect(this.page.getByTestId("empty-equipment")).toBeVisible();
  await expect(this.page.getByTestId("empty-abilities")).toBeVisible();
});

// Scenario: Load hard-coded character via load button
Given("the character sheet is empty", async function () {
  // Navigate with empty=true to start with empty character
  await this.page.goto("http://localhost:3000?empty=true");
});

When('I click the "Load" button', async function () {
  const loadButton = this.page.getByTestId("load-button");
  await loadButton.click();
});

Then("the character {string} should be displayed", async function (name: string) {
  const nameElement = this.page.getByTestId("character-name");
  await expect(nameElement).toHaveText(name);
});

Then("all character sections should show data", async function () {
  // Verify at least one item in each section
  await expect(this.page.getByTestId("cypher-item").first()).toBeVisible();
  await expect(this.page.getByTestId("artifact-item").first()).toBeVisible();
  await expect(this.page.getByTestId("oddity-item").first()).toBeVisible();

  // Verify text fields have content (not empty states)
  await expect(this.page.getByTestId("text-background")).toBeVisible();
  await expect(this.page.getByTestId("text-notes")).toBeVisible();

  // Equipment and abilities are now separate components
  await expect(this.page.getByTestId("equipment-content")).toBeVisible();
  await expect(this.page.getByTestId("ability-item").first()).toBeVisible();
});

// Scenario: Character state persists across page reloads (after Load)
Then("the character should be displayed", async function () {
  // Verify character name is visible (not empty state)
  const nameElement = this.page.getByTestId("character-name");
  await expect(nameElement).toBeVisible();
  await expect(nameElement).toHaveText("Kael the Wanderer");
});

Then("the same character should still be displayed", async function () {
  // After reload, verify character name still there
  const nameElement = this.page.getByTestId("character-name");
  await expect(nameElement).toHaveText("Kael the Wanderer");
});

Then("all character data should be preserved", async function () {
  // Verify all sections still have data (not empty states)
  await expect(this.page.getByTestId("cypher-item").first()).toBeVisible();
  await expect(this.page.getByTestId("artifact-item").first()).toBeVisible();
  await expect(this.page.getByTestId("oddity-item").first()).toBeVisible();
  await expect(this.page.getByTestId("text-background")).toBeVisible();
  await expect(this.page.getByTestId("text-notes")).toBeVisible();
});

// Scenario: Empty state persists across page reloads after clearing
When("I reload the page", async function () {
  await this.page.reload();
});
