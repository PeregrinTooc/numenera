import { Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CustomWorld } from "../support/world.js";

// ============================================================================
// MODAL INTERACTION STEPS
// ============================================================================

When("I confirm the card edit modal", async function (this: CustomWorld) {
  await this.page.locator('[data-testid="card-modal-confirm"]').click();
  await this.page
    .waitForSelector('[data-testid="card-edit-modal"]', {
      state: "hidden",
      timeout: 2000,
    })
    .catch(() => {});
  await this.page.waitForTimeout(200);
});

When("I cancel the card edit modal", async function (this: CustomWorld) {
  await this.page.locator('[data-testid="card-modal-cancel"]').click();
  await this.page
    .waitForSelector('[data-testid="card-edit-modal"]', {
      state: "hidden",
      timeout: 2000,
    })
    .catch(() => {});
});

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

// ============================================================================
// EDIT EXISTING CARD STEPS
// ============================================================================

When(
  "I click the edit button on cypher {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("cypher", name);
  }
);

When(
  "I click the edit button on equipment {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("equipment", name);
  }
);

When(
  "I click the edit button on artifact {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("artifact", name);
  }
);

When(
  "I click the edit button on oddity {string}",
  async function (this: CustomWorld, text: string) {
    await this.cards.clickEditButton("oddity", text);
  }
);

When(
  "I click the edit button on attack {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("attack", name);
  }
);

When(
  "I click the edit button on ability {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("ability", name);
  }
);

When(
  "I click the edit button on special ability {string}",
  async function (this: CustomWorld, name: string) {
    await this.cards.clickEditButton("special-ability", name);
  }
);
