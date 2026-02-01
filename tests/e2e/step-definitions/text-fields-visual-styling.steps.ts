// Step definitions for text fields visual styling tests

import { Given, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { FULL_CHARACTER } from "../../../src/data/mockCharacters.js";
import { DOMHelpers } from "../support/dom-helpers.js";
import { TestStorageHelper } from "../support/testStorageHelper.js";

Given("a character exists with background text {string}", async function (backgroundText: string) {
  if (!this.character) {
    this.character = { ...FULL_CHARACTER };
  }
  this.character = {
    ...this.character,
    textFields: {
      ...this.character.textFields,
      background: backgroundText,
    },
  };
});

Given("a character exists with notes text {string}", async function (notesText: string) {
  if (!this.character) {
    this.character = { ...FULL_CHARACTER };
  }
  this.character = {
    ...this.character,
    textFields: {
      ...this.character.textFields,
      notes: notesText,
    },
  };
});

Given("a character exists with no background text", async function () {
  if (!this.character) {
    this.character = { ...FULL_CHARACTER };
  }
  this.character = {
    ...this.character,
    textFields: {
      ...this.character.textFields,
      background: "",
    },
  };
});

Given("a character exists with no notes text", async function () {
  if (!this.character) {
    this.character = { ...FULL_CHARACTER };
  }
  this.character = {
    ...this.character,
    textFields: {
      ...this.character.textFields,
      notes: "",
    },
  };
});

Given("a character exists with background and notes", async function () {
  if (!this.character) {
    this.character = { ...FULL_CHARACTER };
  }
  this.character = {
    ...this.character,
    textFields: {
      background: "Test background",
      notes: "Test notes",
    },
  };
});

Given("I have a character with empty background in localStorage", async function () {
  const storageHelper = new TestStorageHelper(this.page);
  const character = {
    ...FULL_CHARACTER,
    textFields: {
      ...FULL_CHARACTER.textFields,
      background: "",
    },
  };
  await storageHelper.setCharacter(character);
});

Given("I have a character with empty notes in localStorage", async function () {
  const storageHelper = new TestStorageHelper(this.page);
  const character = {
    ...FULL_CHARACTER,
    textFields: {
      ...FULL_CHARACTER.textFields,
      notes: "",
    },
  };
  await storageHelper.setCharacter(character);
});

Then("the background container should have parchment styling", async function () {
  // Find the parchment-field div containing the background textarea
  const container = this.page.locator('.parchment-field:has([data-testid="character-background"])');
  await expect(container).toBeVisible();

  // Check for parchment-themed class
  const classes = await container.getAttribute("class");
  expect(classes).toContain("parchment-field");
});

Then("the background text should be displayed with handwritten font", async function () {
  const dom = new DOMHelpers(this.page);
  const textContent = dom.getByTestId("character-background");

  const fontFamily = await textContent.evaluate((el) => window.getComputedStyle(el).fontFamily);
  expect(fontFamily).toMatch(/Caveat|Patrick Hand|cursive/i);
});

Then("the notes container should have parchment styling", async function () {
  // Find the parchment-field div containing the notes textarea
  const container = this.page.locator('.parchment-field:has([data-testid="character-notes"])');
  await expect(container).toBeVisible();

  const classes = await container.getAttribute("class");
  expect(classes).toContain("parchment-field");
});

Then("the notes text should be displayed with handwritten font", async function () {
  const dom = new DOMHelpers(this.page);
  const textContent = dom.getByTestId("character-notes");

  const fontFamily = await textContent.evaluate((el) => window.getComputedStyle(el).fontFamily);
  expect(fontFamily).toMatch(/Caveat|Patrick Hand|cursive/i);
});

Then("the empty background message should be displayed", async function () {
  // With inline editing, empty state is just an empty textarea
  const textarea = this.page.locator('[data-testid="character-background"]');
  const value = await textarea.inputValue();
  expect(value).toBe("");
});

Then("the empty background container should have parchment styling", async function () {
  // Find the parchment-field div containing the background textarea
  const container = this.page.locator('.parchment-field:has([data-testid="character-background"])');
  const classes = await container.getAttribute("class");
  expect(classes).toContain("parchment-field");
});

Then("the empty notes message should be displayed", async function () {
  // With inline editing, empty state is just an empty textarea
  const textarea = this.page.locator('[data-testid="character-notes"]');
  const value = await textarea.inputValue();
  expect(value).toBe("");
});

Then("the empty notes container should have parchment styling", async function () {
  // Find the parchment-field div containing the notes textarea
  const container = this.page.locator('.parchment-field:has([data-testid="character-notes"])');
  const classes = await container.getAttribute("class");
  expect(classes).toContain("parchment-field");
});

Then("the background and notes containers should be in a two-column layout", async function () {
  const bottomFields = this.page.locator(".bottom-text-fields");
  await expect(bottomFields).toBeVisible();

  // Check for grid or flex layout
  const display = await bottomFields.evaluate((el: HTMLElement) => {
    return window.getComputedStyle(el).display;
  });
  expect(display).toMatch(/grid|flex/);
});
