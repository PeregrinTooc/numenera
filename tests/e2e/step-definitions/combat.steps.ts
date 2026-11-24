import { Given, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

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
  "my character's {cardKind} section says it is empty",
  async function (this: CustomWorld, kind: string) {
    await this.character.expectEmptySection(kind);
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
