import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { startNewCharacter } from "../support/app-ready.js";

Given("a character is currently displayed", async function () {
  await expect(this.page.getByTestId("character-name")).toBeVisible();
});

Then("the character sheet should show empty states", async function () {
  await expect(this.page.getByTestId("empty-cyphers")).toBeVisible();
  await expect(this.page.getByTestId("empty-artifacts")).toBeVisible();
  await expect(this.page.getByTestId("empty-oddities")).toBeVisible();
});

Then("all sections should display empty state messages", async function () {
  await expect(this.page.getByTestId("empty-equipment")).toBeVisible();
  await expect(this.page.getByTestId("empty-abilities")).toBeVisible();

  const background = this.page.locator('[data-testid="character-background"]');
  await expect(background).toHaveValue("");
  const notes = this.page.locator('[data-testid="character-notes"]');
  await expect(notes).toHaveValue("");
});

Given("the character sheet is empty", async function () {
  await startNewCharacter(this.page, this.getBaseUrl());
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
  await expect(this.page.locator('[data-testid^="cypher-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="artifact-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="oddity-item"]').first()).toBeVisible();

  const background = this.page.locator('[data-testid="character-background"]');
  await expect(background).toBeVisible();
  const backgroundValue = await background.inputValue();
  expect(backgroundValue.length).toBeGreaterThan(0);

  const notes = this.page.locator('[data-testid="character-notes"]');
  await expect(notes).toBeVisible();
  const notesValue = await notes.inputValue();
  expect(notesValue.length).toBeGreaterThan(0);

  await expect(this.page.locator('[data-testid^="equipment-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="ability-item"]').first()).toBeVisible();
});

Then("the character should be displayed", async function () {
  const nameElement = this.page.getByTestId("character-name");
  await expect(nameElement).toBeVisible();
  await expect(nameElement).toHaveText("Kael the Wanderer");
});

Then("the same character should still be displayed", async function () {
  const nameElement = this.page.getByTestId("character-name");
  await expect(nameElement).toHaveText("Kael the Wanderer");
});

Then("all character data should be preserved", async function () {
  await expect(this.page.locator('[data-testid^="cypher-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="artifact-item"]').first()).toBeVisible();
  await expect(this.page.locator('[data-testid^="oddity-item"]').first()).toBeVisible();

  const background = this.page.locator('[data-testid="character-background"]');
  await expect(background).toBeVisible();
  const backgroundValue = await background.inputValue();
  expect(backgroundValue.length).toBeGreaterThan(0);

  const notes = this.page.locator('[data-testid="character-notes"]');
  await expect(notes).toBeVisible();
  const notesValue = await notes.inputValue();
  expect(notesValue.length).toBeGreaterThan(0);
});
