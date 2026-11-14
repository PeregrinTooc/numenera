import { When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

When(
  "I write {string} as my {textarea}",
  async function (this: CustomWorld, text: string, field: string) {
    await this.additionalFields.write(field, text);
  }
);

When(
  "I write {int} characters as my {textarea}",
  async function (this: CustomWorld, length: number, field: string) {
    await this.additionalFields.writeCharacters(field, length);
  }
);

Then(
  "my {textarea} reads {string}",
  async function (this: CustomWorld, field: string, text: string) {
    await this.additionalFields.expectReads(field, text);
  }
);

Then(
  "my {textarea} holds all {int} characters",
  async function (this: CustomWorld, field: string, length: number) {
    await this.additionalFields.expectHoldsCharacters(field, length);
  }
);

Then(
  "my empty {textarea} invites me to write with {string}",
  async function (this: CustomWorld, field: string, invitation: string) {
    await this.additionalFields.expectInvitesEditing(field, invitation);
  }
);

When("I click my {textarea}", async function (this: CustomWorld, field: string) {
  await this.additionalFields.click(field);
});

When("I tap my {textarea}", async function (this: CustomWorld, field: string) {
  await this.additionalFields.tap(field);
});

When(
  "I type {string} in my {textarea}",
  async function (this: CustomWorld, text: string, field: string) {
    await this.additionalFields.type(field, text);
  }
);

When("I click away from my {textarea}", async function (this: CustomWorld, field: string) {
  await this.additionalFields.clickAway(field);
});

Then(
  "my {textarea} cannot be edited yet and looks clickable",
  async function (this: CustomWorld, field: string) {
    await this.additionalFields.expectReadOnlyAndClickable(field);
  }
);

Then("I can edit my {textarea}", async function (this: CustomWorld, field: string) {
  await this.additionalFields.expectEditing(field);
});

Then("I can still edit my {textarea}", async function (this: CustomWorld, field: string) {
  await this.additionalFields.expectEditable(field);
});

Then("the on-screen keyboard comes up", async function (this: CustomWorld) {
  await this.additionalFields.expectKeyboardRaised();
});
