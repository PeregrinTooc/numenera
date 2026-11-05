import { Given } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

Given("the character data is loaded", async function (this: CustomWorld) {
  await this.page.waitForLoadState("domcontentloaded");
});
