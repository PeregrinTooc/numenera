import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given(
  "my character has {int} {cardKind}",
  async function (this: CustomWorld, count: number, kind: string) {
    await this.character.hasCount(kind, count);
  }
);

When("I start a new {cardType}", async function (this: CustomWorld, kind: string) {
  await this.cardEditor.startNew(kind);
});

When(
  "I start editing the {cardType} {string}",
  async function (this: CustomWorld, kind: string, name: string) {
    await this.cardEditor.startEditing(kind, name);
  }
);

When(
  "I set its {word} to {string}",
  async function (this: CustomWorld, field: string, value: string) {
    await this.cardEditor.set(field, value);
  }
);

When("I save the card", async function (this: CustomWorld) {
  await this.cardEditor.save();
});

When("I cancel the card", async function (this: CustomWorld) {
  await this.cardEditor.cancel();
});

When("I open my character again", async function (this: CustomWorld) {
  await this.character.reopen();
});

Then(
  "the card editor opens with empty {cardType} fields",
  async function (this: CustomWorld, kind: string) {
    await this.cardEditor.expectOpenWithEmptyFields(kind);
  }
);

Then(
  "the add {cardType} button has a themed background colour",
  async function (this: CustomWorld, kind: string) {
    await this.character.expectAddControlThemed(kind);
  }
);

Then(
  "my character carries {int} {cardKind}",
  async function (this: CustomWorld, count: number, kind: string) {
    await this.character.expectCount(kind, count);
  }
);

Then(
  "my character carries the {cardType} {string}",
  async function (this: CustomWorld, kind: string, name: string) {
    await this.character.expectEntry(kind, name);
  }
);

Then(
  "the {cardType} {string} shows {string}",
  async function (this: CustomWorld, kind: string, name: string, value: string) {
    await this.character.expectEntryShows(kind, name, value);
  }
);
