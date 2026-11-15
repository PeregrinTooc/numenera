import { When } from "@cucumber/cucumber";
import { CustomWorld } from "../support/world.js";
import { waitForSaveComplete } from "../support/save.js";
import { waitForCharacterSheetReady, waitForNewCharacterPersisted } from "../support/app-ready.js";

When('I click the "New" button', async function (this: CustomWorld) {
  await this.page.locator('[data-testid="new-button"]').click();
  await waitForNewCharacterPersisted(this.page);
});

When("I press the Escape key", async function (this: CustomWorld) {
  await this.page.keyboard.press("Escape");
});

When("I reload the page", async function (this: CustomWorld) {
  // The save indicator can't tell us whether a save is pending: it stays hidden
  // until the first auto-save has completed. Flush instead, so a queued save
  // lands before the reload.
  await waitForSaveComplete(this.page);

  await this.page.reload();
  // Wait for both the rendered DOM and the app's own bootstrap persist to
  // land, so callers checking rendered/persisted state right after don't
  // race the app's async bootstrap (see waitForCharacterSheetReady).
  await waitForCharacterSheetReady(this.page);
});

When("I reload the page immediately", async function (this: CustomWorld) {
  // Deliberately does NOT wait out the 300ms auto-save debounce: this exercises
  // an edit that is still pending when the page unloads.
  await this.page.reload();
  await waitForCharacterSheetReady(this.page);
});
