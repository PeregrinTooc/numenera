import { Given, When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";

function names(list: string): string[] {
  return list.split(", ");
}

function cypher(name: string): { collection: string; name: string } {
  return { collection: "cyphers", name };
}

Given(
  "the character has {int} cyphers named {string}",
  async function (this: CustomWorld, count: number, namesList: string) {
    await this.cardOrder.collectionHolds("cyphers", names(namesList).slice(0, count));
  }
);

When(
  "I drag cypher {string} before cypher {string}",
  async function (this: CustomWorld, source: string, target: string) {
    await this.cardOrder.dragBefore(cypher(source), cypher(target));
  }
);

When(
  "I drag cypher {string} after cypher {string}",
  async function (this: CustomWorld, source: string, target: string) {
    await this.cardOrder.dragAfter(cypher(source), cypher(target));
  }
);

When("I start dragging cypher {string}", async function (this: CustomWorld, name: string) {
  await this.cardOrder.startDragging(cypher(name));
});

When("I hover over cypher {string}", async function (this: CustomWorld, name: string) {
  await this.cardOrder.hoverOver(cypher(name));
});

Then(
  "the cyphers should be in order {string}",
  async function (this: CustomWorld, namesList: string) {
    await this.cardOrder.expectOrder("cyphers", names(namesList));
  }
);

Then(
  "the cypher {string} should have a dragging visual state",
  async function (this: CustomWorld, name: string) {
    await this.cardOrder.expectDragging(cypher(name));
  }
);

Then(
  "the cyphers should be visually in order {string}, {string}, {string}",
  async function (this: CustomWorld, name1: string, name2: string, name3: string) {
    await this.cardOrder.expectVisualOrder("cyphers", [name1, name2, name3]);
  }
);
