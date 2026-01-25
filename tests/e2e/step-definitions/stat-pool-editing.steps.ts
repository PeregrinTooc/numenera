import { Given } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";

// ============================================================================
// GIVEN STEPS - Setup character state
// ============================================================================

Given("the character data is loaded", async function (this: CustomWorld) {
  // Just wait for the page to be loaded - character data is already in localStorage
  await this.page!.waitForLoadState("domcontentloaded");
});

// All other step definitions (When/Then) are now handled by common-steps.ts
// which provides parameterized steps for all stat pool fields
