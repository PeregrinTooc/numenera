import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

// Scenario: Clear character data via clear button
Given("a character is currently displayed", async function () {
  // Character is loaded by default (from the Background step in character-display.steps.ts)
  // Just verify we're on the page
  await expect(this.page.getByTestId("character-name")).toBeVisible();
});

When('I click the "New" button', async function () {
  const newButton = this.page.getByTestId("new-button");
  await newButton.click();

  // Save is now immediate, just wait for UI to settle
  await this.page.waitForTimeout(100);
});

Then("the character sheet should show empty states", async function () {
  // Verify empty states for items
  await expect(this.page.getByTestId("empty-cyphers")).toBeVisible();
  await expect(this.page.getByTestId("empty-artifacts")).toBeVisible();
  await expect(this.page.getByTestId("empty-oddities")).toBeVisible();
});

Then("all sections should display empty state messages", async function () {
  // Verify empty states for items sections (background and notes don't have empty states anymore)
  await expect(this.page.getByTestId("empty-equipment")).toBeVisible();
  await expect(this.page.getByTestId("empty-abilities")).toBeVisible();

  // Background and notes textareas should be empty
  const background = this.page.locator('[data-testid="character-background"]');
  await expect(background).toHaveValue("");
  const notes = this.page.locator('[data-testid="character-notes"]');
  await expect(notes).toHaveValue("");
});

// Scenario: Load hard-coded character via load button
Given("the character sheet is empty", async function () {
  // Click the "New" button to start with empty character
  await this.page.goto(this.getBaseUrl());
  await this.page.getByTestId("new-button").click();
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
  await expect(this.page.locator('[data-testid^="cypher-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="artifact-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="oddity-item"]').first()).toBeVisible();

  // Verify text fields have content (textareas are visible and not empty)
  const background = this.page.locator('[data-testid="character-background"]');
  await expect(background).toBeVisible();
  const backgroundValue = await background.inputValue();
  expect(backgroundValue.length).toBeGreaterThan(0);

  const notes = this.page.locator('[data-testid="character-notes"]');
  await expect(notes).toBeVisible();
  const notesValue = await notes.inputValue();
  expect(notesValue.length).toBeGreaterThan(0);

  // Equipment and abilities are now individual items
  await expect(this.page.locator('[data-testid^="equipment-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="ability-item"]').first()).toBeVisible();
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
  await expect(this.page.locator('[data-testid^="cypher-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="artifact-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="oddity-item"]').first()).toBeVisible();

  // Verify text fields have content
  const background = this.page.locator('[data-testid="character-background"]');
  await expect(background).toBeVisible();
  const backgroundValue = await background.inputValue();
  expect(backgroundValue.length).toBeGreaterThan(0);

  const notes = this.page.locator('[data-testid="character-notes"]');
  await expect(notes).toBeVisible();
  const notesValue = await notes.inputValue();
  expect(notesValue.length).toBeGreaterThan(0);
});
