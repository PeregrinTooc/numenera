import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";

Given(
  "the {string} collection holds {string}",
  async function (this: CustomWorld, collection: string, namesList: string) {
    await this.cardOrder.collectionHolds(collection, namesList.split(", "));
  }
);

When(
  "I drag {string} before {string} in the {string} collection",
  async function (this: CustomWorld, source: string, target: string, collection: string) {
    await this.cardOrder.dragBefore({ collection, name: source }, { collection, name: target });
  }
);

When(
  "I drag {string} after {string} in the {string} collection",
  async function (this: CustomWorld, source: string, target: string, collection: string) {
    await this.cardOrder.dragAfter({ collection, name: source }, { collection, name: target });
  }
);

Then(
  "the {string} collection should be in order {string}",
  async function (this: CustomWorld, collection: string, namesList: string) {
    await this.cardOrder.expectOrder(collection, namesList.split(", "));
  }
);
