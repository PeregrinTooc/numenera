import { Given, Then, type DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";
import { lowerCaseHashes, propertyTable } from "../support/tableRows.js";
import type { StatRow } from "../support/character.js";

function statRows(table: DataTable): StatRow[] {
  return lowerCaseHashes(table).map(({ stat, pool, edge, current }) => ({
    stat,
    pool,
    edge,
    current,
  }));
}

Given("I am on the character sheet page", async function (this: CustomWorld) {
  await this.character.openSheet();
});

Given(
  "my character has this basic information:",
  async function (this: CustomWorld, table: DataTable) {
    await this.character.hasBasicInformation(propertyTable(table));
  }
);

Given("my character has these stats:", async function (this: CustomWorld, table: DataTable) {
  await this.character.hasStats(statRows(table));
});

Given(
  "my character's name is {int} characters long without spaces",
  async function (this: CustomWorld, length: number) {
    await this.character.hasNameWithoutSpaces(length);
  }
);

Then("my character sheet shows these stats:", async function (this: CustomWorld, table: DataTable) {
  await this.character.expectStatsShow(statRows(table));
});

Then("my character sheet shows no untranslated text", async function (this: CustomWorld) {
  await this.character.expectNoUntranslatedText();
});

Then(
  "my character sheet's editable values and add controls have translated accessible labels",
  async function (this: CustomWorld) {
    await this.character.expectControlsAccessiblyLabelled();
  }
);

Then(
  "my character's name is shown as plain text, not as markup",
  async function (this: CustomWorld) {
    await this.character.expectBasicInfoIsPlainText("name");
  }
);

Then(
  "my character sheet lists its sections in this order:",
  async function (this: CustomWorld, table: DataTable) {
    await this.character.expectSectionsInOrder(table.raw().map(([name]) => name));
  }
);
