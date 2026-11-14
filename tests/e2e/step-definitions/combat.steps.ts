import { Given, Then, type DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";
import type { CardTheme } from "../support/sheetDriver.js";
import { propertyTable } from "../support/tableRows.js";

Given(
  "my character has the {cardType} {string} with:",
  async function (this: CustomWorld, kind: string, name: string, table: DataTable) {
    await this.character.hasEntry(kind, name, propertyTable(table));
  }
);

Given(
  "my character has the {cardType} {string}",
  async function (this: CustomWorld, kind: string, name: string) {
    await this.character.has(kind, [name]);
  }
);

Given(
  "my character has an attack whose name is {int} characters long without spaces",
  async function (this: CustomWorld, length: number) {
    await this.character.hasEntryWithUnbrokenName("attack", length);
  }
);

Given("I view my character on a wide screen", async function (this: CustomWorld) {
  await this.screen.viewOn("wide screen");
});

Given("I view my character on a phone", async function (this: CustomWorld) {
  await this.screen.viewOn("phone");
});

Then(
  "the {cardType} {string} shows {word} {string}",
  async function (this: CustomWorld, kind: string, name: string, field: string, value: string) {
    await this.character.expectEntryField(kind, name, field, value);
  }
);

Then(
  "the {cardType} {string} shows no {word}",
  async function (this: CustomWorld, kind: string, name: string, field: string) {
    await this.character.expectEntryWithoutField(kind, name, field);
  }
);

Then(
  "the {cardType} {string} is themed {word}",
  async function (this: CustomWorld, kind: string, name: string, theme: string) {
    await this.character.expectEntryThemed(kind, name, theme as CardTheme);
  }
);

Then(
  "my character's {cardKind} section says it is empty",
  async function (this: CustomWorld, kind: string) {
    await this.character.expectEmptySection(kind);
  }
);

Then(
  "the attacks section shows my character's armor of {int}",
  async function (this: CustomWorld, armor: number) {
    await this.character.expectArmorBesideAttacks(armor);
  }
);

Then(
  "the {cardKind} section sits left of the {cardKind} section",
  async function (this: CustomWorld, kind: string, other: string) {
    await this.character.expectSectionLeftOf(kind, other);
  }
);

Then(
  "the {cardKind} section sits above the {cardKind} section",
  async function (this: CustomWorld, kind: string, other: string) {
    await this.character.expectSectionAbove(kind, other);
  }
);

Then(
  "my character's attack keeps its badges at the right edge of its card",
  async function (this: CustomWorld) {
    await this.character.expectBadgesAtRightEdge("attack");
  }
);
