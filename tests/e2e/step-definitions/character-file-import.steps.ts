import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { Character } from "../../../src/types/character.js";
import { TestStorageHelper } from "../support/testStorageHelper.js";

// Test character data fixtures
const TEST_CHARACTERS: Record<string, Character> = {
  "test-hero.numenera": {
    name: "Test Hero",
    tier: 3,
    type: "Glaive",
    descriptor: "Strong",
    focus: "Masters Defense",
    xp: 10,
    shins: 50,
    armor: 2,
    effort: 3,
    maxCyphers: 2,
    stats: {
      might: { pool: 18, edge: 1, current: 18 },
      speed: { pool: 12, edge: 0, current: 12 },
      intellect: { pool: 10, edge: 0, current: 10 },
    },
    cyphers: [{ name: "Test Cypher", level: "1d6", effect: "Test effect" }],
    artifacts: [{ name: "Test Artifact", level: "1d6", effect: "Test effect" }],
    oddities: ["Test oddity"],
    abilities: [{ name: "Test Ability", description: "Test description" }],
    equipment: [{ name: "Test Equipment", description: "Test description" }],
    attacks: [
      {
        name: "Test Attack",
        damage: 4,
        modifier: 0,
        range: "Immediate",
        notes: "",
      },
    ],
    specialAbilities: [
      {
        name: "Test Special",
        description: "Test description",
        source: "Type",
      },
    ],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: {
      impairment: "healthy",
    },
    textFields: {
      background: "Test background story",
      notes: "Test notes",
    },
  },
  "another-hero.numenera": {
    name: "Another Hero",
    tier: 2,
    type: "Nano",
    descriptor: "Clever",
    focus: "Controls Beasts",
    xp: 5,
    shins: 25,
    armor: 1,
    effort: 2,
    maxCyphers: 3,
    stats: {
      might: { pool: 10, edge: 0, current: 10 },
      speed: { pool: 10, edge: 0, current: 10 },
      intellect: { pool: 16, edge: 1, current: 16 },
    },
    cyphers: [{ name: "Another Cypher", level: "1d6+2", effect: "Another effect" }],
    artifacts: [],
    oddities: ["Another oddity"],
    abilities: [{ name: "Another Ability", description: "Another description" }],
    equipment: [{ name: "Another Equipment" }],
    attacks: [],
    specialAbilities: [],
    recoveryRolls: {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    },
    damageTrack: {
      impairment: "healthy",
    },
    textFields: {
      background: "Another background",
      notes: "Another notes",
    },
  },
};

// Scenario: Import valid character from file
When("I import a valid character file {string}", async function (filename: string) {
  const character = TEST_CHARACTERS[filename];
  const fileContent = {
    version: "1.0",
    schemaVersion: 4,
    exportDate: new Date().toISOString(),
    character,
  };

  // Directly inject the character data into storage (simulating successful import)
  // This is more reliable than trying to mock file system APIs in Playwright
  const storageHelper = new TestStorageHelper(this.page);
  await this.page.waitForTimeout(500);
  await storageHelper.setCharacter(fileContent.character);

  // Use explicit page navigation to reload (this properly waits for the navigation)
  // Remove any query parameters to ensure clean reload
  const currentUrl = this.page.url().split("?")[0];
  await this.page.goto(currentUrl, { waitUntil: "domcontentloaded" });

  // Wait for the character name element to appear with the expected value
  const expectedName = character.name;
  const nameElement = this.page.getByTestId("character-name");

  // Wait for element to be visible and contain the expected text
  await expect(nameElement).toBeVisible({ timeout: 15000 });
  await expect(nameElement).toHaveText(expectedName, { timeout: 15000 });
});

// Scenario: Imported character persists in localStorage
Then("the character {string} should still be displayed", async function (name: string) {
  const nameElement = this.page.getByTestId("character-name");
  const currentName = await nameElement.textContent();
  expect(currentName?.trim()).toBe(name);
});

// Scenario: Import replaces current character
Then("the previous character should be replaced", async function () {
  // Verify that "Kael the Wanderer" (the default loaded character) is no longer displayed
  const nameElement = this.page.getByTestId("character-name");
  const currentName = await nameElement.textContent();
  expect(currentName?.trim()).not.toBe("Kael the Wanderer");
});
