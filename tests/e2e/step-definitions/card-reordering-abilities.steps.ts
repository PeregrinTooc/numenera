import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";

Given(
  "the character has {int} abilities named {string}",
  async function (this: CustomWorld, count: number, namesList: string) {
    await this.cardOrder.collectionHolds("abilities", namesList.split(", ").slice(0, count));
  }
);

When(
  "I drag ability {string} before ability {string}",
  async function (this: CustomWorld, source: string, target: string) {
    await this.cardOrder.dragBefore(
      { collection: "abilities", name: source },
      { collection: "abilities", name: target }
    );
  }
);

Then(
  "the abilities should be in order {string}",
  async function (this: CustomWorld, namesList: string) {
    await this.cardOrder.expectOrder("abilities", namesList.split(", "));
  }
);

When(
  "I drag cypher {string} into the abilities section",
  async function (this: CustomWorld, name: string) {
    await this.cardOrder.dragIntoSectionOf({ collection: "cyphers", name }, "abilities");
  }
);

When(
  "I drag ability {string} onto cypher {string}",
  async function (this: CustomWorld, ability: string, cypher: string) {
    await this.cardOrder.dragBefore(
      { collection: "abilities", name: ability },
      { collection: "cyphers", name: cypher }
    );
  }
);
