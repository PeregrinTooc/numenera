import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

When("I click the delete button on the first cypher", async function (this: CustomWorld) {
  await this.cards.clickDeleteButton("cypher");
});

Given(
  "my character has the {cardKind} {string} and {string}",
  async function (this: CustomWorld, kind: string, first: string, second: string) {
    await this.character.has(kind, [first, second]);
  }
);

When("I discard {string}", async function (this: CustomWorld, name: string) {
  await this.character.discard(name);
});

Then(
  "my character's {cardKind} are only {string}",
  async function (this: CustomWorld, kind: string, name: string) {
    await this.character.carriesOnly(kind, [name]);
  }
);

Then(
  "{string} is still gone the next time I open my character",
  async function (this: CustomWorld, name: string) {
    await this.character.expectGoneAfterReopening(name);
  }
);

Then("it was discarded without my being asked to confirm", async function (this: CustomWorld) {
  await this.character.expectDiscardedWithoutConfirmation();
});

Then(
  "the discard control of {string} is in the top-left corner of its entry",
  async function (this: CustomWorld, name: string) {
    await this.character.expectDiscardControlInTopLeftCorner(name);
  }
);
