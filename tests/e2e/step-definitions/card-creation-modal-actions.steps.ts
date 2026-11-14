import { Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

Then("the card edit modal should be open", async function (this: CustomWorld) {
  await expect(this.page.locator('[data-testid="card-edit-modal"]')).toBeVisible();

  // openCardEditModal() defers its auto-focus via setTimeout(0)
  // (ModalContainer.focusElement in modalContainer.ts) so it doesn't fight
  // the click that opened the modal. The modal's own Escape/Tab handling
  // is a @keydown listener on its backdrop element, which only ever sees
  // the event if it bubbles up from something focused inside the modal.
  // A keyboard step run right after this one can otherwise race that
  // deferred focus and land on whatever was focused before the modal
  // opened, silently missing the modal's listener entirely.
  await this.page.waitForFunction(() => {
    const modal = document.querySelector('[data-testid="card-edit-modal"]');
    return !!modal && modal.contains(document.activeElement);
  });
});
