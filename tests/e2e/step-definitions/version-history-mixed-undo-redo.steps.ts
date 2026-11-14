import { When } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { forceSquash } from "../support/versionHistoryHelpers.js";

When("I wait for squash timer to complete", async function (this: CustomWorld) {
  await forceSquash(this.page);
});
