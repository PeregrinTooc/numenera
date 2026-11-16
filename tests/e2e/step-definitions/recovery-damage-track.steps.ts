import { Given, Then, When } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Then("I should see a section titled {string}", async function (this: CustomWorld, title: string) {
  await this.health.expectSectionTitled(title);
});

Then(
  "I should see the recovery modifier display {string}",
  async function (this: CustomWorld, display: string) {
    await this.health.expectRecoveryModifierDisplays(display);
  }
);

Then(
  "I should see {int} recovery roll checkboxes",
  async function (this: CustomWorld, count: number) {
    await this.health.expectRecoveryRollCount(count);
  }
);

Then(
  "I should see recovery roll {string} with time {string}",
  async function (this: CustomWorld, rollName: string, timeText: string) {
    await this.health.expectRecoveryRollLabelled(rollName, timeText);
  }
);

Given(
  "the character has {string} recovery used",
  async function (this: CustomWorld, rollType: string) {
    await this.health.hasRecoveryUsed(rollType);
  }
);

Then(
  "the {string} recovery checkbox should be checked",
  async function (this: CustomWorld, rollType: string) {
    await this.health.expectRecoveryRollTicked(rollType);
  }
);

Then(
  "the {string} recovery checkbox should be unchecked",
  async function (this: CustomWorld, rollType: string) {
    await this.health.expectRecoveryRollNotTicked(rollType);
  }
);

Then("I should see {int} damage status options", async function (this: CustomWorld, count: number) {
  await this.health.expectDamageOptionCount(count);
});

Then("I should see damage status {string}", async function (this: CustomWorld, status: string) {
  await this.health.expectDamageOption(status);
});

Then(
  "I should see damage status {string} with description {string}",
  async function (this: CustomWorld, status: string, description: string) {
    await this.health.expectDamageOption(status, description);
  }
);

Given("the character is {string}", async function (this: CustomWorld, impairmentStatus: string) {
  await this.health.hasImpairment(impairmentStatus);
});

Then(
  "the {string} radio button should be selected",
  async function (this: CustomWorld, status: string) {
    await this.health.expectDamageStatusSelected(status);
  }
);

Then(
  "the {string} radio button should not be selected",
  async function (this: CustomWorld, status: string) {
    await this.health.expectDamageStatusNotSelected(status);
  }
);

Then("the recovery rolls section should have green styling", async function (this: CustomWorld) {
  await this.health.expectRecoverySectionGreen();
});

Then("the damage track section should have red styling", async function (this: CustomWorld) {
  await this.health.expectDamageSectionRed();
});

Given(
  "the character has recovery modifier {int}",
  async function (this: CustomWorld, modifier: number) {
    await this.health.hasRecoveryModifier(modifier);
  }
);

Then(
  "I should see {string} in the recovery section",
  async function (this: CustomWorld, text: string) {
    await this.health.expectRecoverySectionShows(text);
  }
);

Given("the character is new", async function (this: CustomWorld) {
  await this.character.startsWithEmptySheet();
});

Then("all recovery checkboxes should be unchecked", async function (this: CustomWorld) {
  await this.health.expectNoRecoveryRollTicked();
});

When("I change my recovery modifier to {int}", async function (this: CustomWorld, value: number) {
  await this.character.change("recovery modifier", String(value));
});

When(
  "I click the {string} recovery checkbox",
  async function (this: CustomWorld, rollType: string) {
    await this.health.ticksRecoveryRoll(rollType);
  }
);

When("I select the {string} damage status", async function (this: CustomWorld, status: string) {
  await this.health.selectsDamageStatus(status);
});
