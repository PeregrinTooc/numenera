import { Given, Then, type DataTable } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { waitForCharacterSheetReady, startNewCharacter } from "../support/app-ready.js";
import type { CustomWorld } from "../support/world.js";
import type { Character } from "../../../src/types/character.js";
import { sectionId } from "../support/sections.js";
import { RAW_I18N_KEY } from "../support/i18nKeys.js";
import { intCell, lowerCaseHashes, propertyTable } from "../support/tableRows.js";

Given(
  "a character exists with the following data:",
  async function (this: CustomWorld, table: DataTable) {
    const data = propertyTable(table);
    const overrides: Partial<Character> = {};
    if (data.name !== undefined) overrides.name = data.name;
    if (data.tier !== undefined) overrides.tier = intCell(data.tier, "Tier");
    if (data.type !== undefined) overrides.type = data.type;
    if (data.descriptor !== undefined) overrides.descriptor = data.descriptor;
    if (data.focus !== undefined) overrides.focus = data.focus;
    await this.setup.character(overrides);
  }
);

Given("I am on the character sheet page", async function () {
  await this.page.goto(this.getBaseUrl() + "");
  await waitForCharacterSheetReady(this.page);
});

Then("I should see the character name {string}", async function (name: string) {
  await expect(this.dom.getByTestId("character-name")).toHaveText(name);
});

Then("I should see tier {string} displayed", async function (tier: string) {
  await expect(this.dom.getByTestId("character-tier")).toContainText(tier);
});

Then("I should see type {string} displayed", async function (type: string) {
  // Type is now displayed as a dropdown, check the selected value
  const select = this.page.locator('[data-testid="character-type-select"]');
  await expect(select).toHaveValue(type);
});

Then("I should see descriptor {string} displayed", async function (descriptor: string) {
  await expect(this.dom.getByTestId("character-descriptor")).toContainText(descriptor);
});

Then("I should see focus {string} displayed", async function (focus: string) {
  await expect(this.dom.getByTestId("character-focus")).toContainText(focus);
});

Then("no untranslated text keys should be visible", async function (this: CustomWorld) {
  const text = await this.page.locator("body").innerText();
  expect(text).not.toMatch(RAW_I18N_KEY);
});

// Scenario 2: View character stat pools
Given(
  "the character has the following stats:",
  async function (this: CustomWorld, table: DataTable) {
    const rows = lowerCaseHashes(table);
    await this.setup.updateCharacter((character) => {
      for (const row of rows) {
        const key = row.stat.toLowerCase() as keyof Character["stats"];
        if (!(key in character.stats)) throw new Error(`Unknown stat: ${row.stat}`);
        character.stats[key] = {
          pool: intCell(row.pool, `${row.stat} pool`),
          edge: intCell(row.edge, `${row.stat} edge`),
          current: intCell(row.current, `${row.stat} current`),
        };
      }
    });
  }
);

Then(
  "I should see the {string} stat with pool {string}, edge {string}, and current {string}",
  async function (statName: string, pool: string, edge: string, current: string) {
    const statNameLower = statName.toLowerCase();

    await expect(this.dom.getByTestId(`stat-${statNameLower}-pool`)).toContainText(pool);
    await expect(this.dom.getByTestId(`stat-${statNameLower}-edge`)).toContainText(edge);
    await expect(this.dom.getByTestId(`stat-${statNameLower}-current`)).toContainText(current);
  }
);

// Scenario 3: View character items - Cyphers
Given(
  "the character has the following cyphers:",
  async function (this: CustomWorld, table: DataTable) {
    const cyphers = lowerCaseHashes(table).map(({ name, level, effect }) => ({
      name,
      level,
      effect,
    }));
    await this.setup.updateCharacter((character) => {
      character.cyphers = cyphers;
    });
  }
);

Then("I should see {int} cyphers displayed", async function (count: number) {
  const actualCount = await this.dom.count("cypher-item");
  expect(actualCount).toBe(count);
});

Then(
  "I should see cypher {string} with level {string}",
  async function (name: string, level: string) {
    await expect(this.dom.getByTestId(`cypher-name-${name}`)).toContainText(name);
    await expect(this.dom.getByTestId(`cypher-level-${name}`)).toContainText(level);
  }
);

// Scenario 4: View character items - Artifacts and Oddities
Given(
  "the character has the following artifacts:",
  async function (this: CustomWorld, table: DataTable) {
    const artifacts = lowerCaseHashes(table).map(({ name, level, effect }) => ({
      name,
      level,
      effect,
    }));
    await this.setup.updateCharacter((character) => {
      character.artifacts = artifacts;
    });
  }
);

Given(
  "the character has the following oddities:",
  async function (this: CustomWorld, table: DataTable) {
    const oddities = lowerCaseHashes(table).map(({ description }) => description);
    await this.setup.updateCharacter((character) => {
      character.oddities = oddities;
    });
  }
);

Then("I should see {int} artifact displayed", async function (count: number) {
  const actualCount = await this.dom.count("artifact-item");
  expect(actualCount).toBe(count);
});

Then(
  "I should see artifact {string} with level {string}",
  async function (name: string, level: string) {
    await expect(this.dom.getByTestId(`artifact-name-${name}`)).toContainText(name);
    await expect(this.dom.getByTestId(`artifact-level-${name}`)).toContainText(level);
  }
);

Then("I should see {int} oddities displayed", async function (count: number) {
  const actualCount = await this.dom.count("oddity-item");
  expect(actualCount).toBe(count);
});

Then("I should see oddity {string}", async function (description: string) {
  await expect(this.dom.getByTestId(`oddity-${description}`)).toContainText(description);
});

// Scenario 5: View character text fields — see "the character has the following text:" below
Given("the character has no {cardTypes}", async function (this: CustomWorld, _emptyTestId: string) {
  await startNewCharacter(this.page, this.getBaseUrl());
});

Then(
  "I should see an empty {cardTypes} section",
  async function (this: CustomWorld, emptyTestId: string) {
    await expect(this.dom.getByTestId(emptyTestId)).toBeVisible();
  }
);

// Scenario 7: View empty character text fields
Given("the character has empty text fields", async function () {
  // Click the "New" button to start with empty character
  await startNewCharacter(this.page, this.getBaseUrl());
});

Then("I should see empty state for background", async function () {
  // Background textarea should be visible and empty
  const textarea = this.page.locator('[data-testid="character-background"]');
  await expect(textarea).toBeVisible();
  const value = await textarea.inputValue();
  expect(value).toBe("");
});

Then("I should see empty state for notes", async function () {
  // Notes textarea should be visible and empty
  const textarea = this.page.locator('[data-testid="character-notes"]');
  await expect(textarea).toBeVisible();
  const value = await textarea.inputValue();
  expect(value).toBe("");
});

Then("I should see empty state for equipment", async function () {
  await expect(this.dom.getByTestId("empty-equipment")).toBeVisible();
});

Then("I should see empty state for abilities", async function () {
  await expect(this.dom.getByTestId("empty-abilities")).toBeVisible();
});

// Scenario: Text with quotes, ampersands and angle brackets is shown verbatim
type TextRow = { Field: string; Content: string };

const TEXT_FIELD_SETTERS: Record<string, (character: Character, value: string) => void> = {
  Name: (character, value) => {
    character.name = value;
  },
  Background: (character, value) => {
    character.textFields.background = value;
  },
  Notes: (character, value) => {
    character.textFields.notes = value;
  },
};

Given(
  "the character has the following text:",
  async function (this: CustomWorld, table: DataTable) {
    const rows = table.hashes() as TextRow[];
    await this.setup.updateCharacter((character) => {
      for (const { Field, Content } of rows) {
        const set = TEXT_FIELD_SETTERS[Field];
        if (!set) throw new Error(`Unknown text field: ${Field}`);
        set(character, Content);
      }
    });
  }
);

Then(
  "the character text should read exactly:",
  async function (this: CustomWorld, table: DataTable) {
    for (const { Field, Content } of table.hashes() as TextRow[]) {
      if (Field === "Name") {
        await expect(this.dom.getByTestId("character-name")).toHaveText(Content);
      } else if (Field === "Background") {
        // Background renders as a <textarea>, so its text is the element's value.
        await expect(this.dom.getByTestId("character-background")).toHaveValue(Content);
      } else if (Field === "Notes") {
        await expect(this.dom.getByTestId("character-notes")).toHaveValue(Content);
      } else {
        throw new Error(`Unknown text field: ${Field}`);
      }
    }
  }
);

Then("no markup from the text should be rendered as HTML", async function (this: CustomWorld) {
  // The name binding is a text node; any child element means user text was parsed as HTML.
  await expect(this.dom.getByTestId("character-name").locator("*")).toHaveCount(0);
});

// Scenario Outline: Long unbroken text does not make the sheet scroll sideways
Given(
  "the character has a {int}-character name without spaces",
  async function (this: CustomWorld, length: number) {
    await this.setup.updateCharacter((character) => {
      character.name = "W".repeat(length);
    });
  }
);

Then("the page should not scroll horizontally", async function (this: CustomWorld) {
  const { scrollWidth, clientWidth } = await this.page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

// Scenario: Sections appear in the default layout order
Then("I should see sections in this order:", async function (this: CustomWorld, table: DataTable) {
  const expected = table.raw().map(([name]) => sectionId(name));
  const actual = await this.page
    .locator("[data-section-id]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-section-id")));
  expect(actual).toEqual(expected);
});
