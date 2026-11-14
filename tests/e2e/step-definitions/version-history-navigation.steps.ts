import { When } from "@cucumber/cucumber";
import type { CustomWorld } from "../support/world";
import { waitForCharacterSheetReady } from "../support/app-ready.js";
import { clickAndAwaitNavigation } from "../support/versionHistoryHelpers.js";

When("I click the backward navigation arrow", async function (this: CustomWorld) {
  await clickAndAwaitNavigation(this.page, "version-nav-backward");
});

When("I refresh the browser", async function (this: CustomWorld) {
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
});
