import { When, Then } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world.js";

When("I open the character sheet and watch its requests", async function (this: CustomWorld) {
  await this.requests.opensTheSheetAndWatchesRequests();
});

Then("nothing should have been requested from another site", function (this: CustomWorld) {
  this.requests.expectNothingRequestedFromAnotherSite();
});

Then(
  "the {string} and {string} fonts should be loaded",
  async function (this: CustomWorld, first: string, second: string) {
    await this.requests.expectFontsLoaded(first, second);
  }
);
