import { Given, Then, type DataTable } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

Given(
  "the character has an ability {string} with:",
  async function (this: CustomWorld, abilityName: string, dataTable: DataTable) {
    await this.abilities.hasAbility(abilityName, Object.fromEntries(dataTable.rows()));
  }
);

Given(
  "the character has abilities with different pools:",
  async function (this: CustomWorld, dataTable: DataTable) {
    await this.abilities.hasAbilitiesWithPools(
      dataTable.hashes().map(({ Name, Pool }) => ({ name: Name, pool: Pool }))
    );
  }
);

Then("I should see the ability {string}", async function (this: CustomWorld, abilityName: string) {
  await this.abilities.expectAbility(abilityName);
});

Then(
  "the ability {string} should show cost {string}",
  async function (this: CustomWorld, abilityName: string, cost: string) {
    await this.abilities.expectCost(abilityName, cost);
  }
);

Then(
  "the ability {string} should show pool {string}",
  async function (this: CustomWorld, abilityName: string, pool: string) {
    await this.abilities.expectPool(abilityName, pool);
  }
);

Then(
  "the ability {string} should show action {string}",
  async function (this: CustomWorld, abilityName: string, action: string) {
    await this.abilities.expectAction(abilityName, action);
  }
);

Then(
  "the ability {string} should not show cost badge",
  async function (this: CustomWorld, abilityName: string) {
    await this.abilities.expectNoCost(abilityName);
  }
);

Then(
  "the ability {string} should not show pool indicator",
  async function (this: CustomWorld, abilityName: string) {
    await this.abilities.expectNoPool(abilityName);
  }
);

Then(
  "the ability {string} should not show action indicator",
  async function (this: CustomWorld, abilityName: string) {
    await this.abilities.expectNoAction(abilityName);
  }
);

Then(
  /^the ability "([^"]*)" should have (might|speed|intellect) pool styling$/,
  async function (this: CustomWorld, abilityName: string, pool: string) {
    await this.abilities.expectPoolStyled(abilityName, pool);
  }
);

Then("the empty state should use translation keys", async function (this: CustomWorld) {
  await this.abilities.expectEmptyStateTranslated();
});
