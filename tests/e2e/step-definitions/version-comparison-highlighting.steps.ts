import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";
import {
  COMPARE_FIELD_TEST_IDS,
  panePrefix,
  paneControl,
} from "../support/comparisonViewHelpers.js";

// ----------------------------------------------------------------------------
// Highlighting
// ----------------------------------------------------------------------------

Then(
  "the {string} field should be highlighted as changed in the {word} pane",
  async function (this: CustomWorld, fieldName: string, side: "left" | "right") {
    const testId = COMPARE_FIELD_TEST_IDS[fieldName];
    const field = this.page.locator(`${panePrefix(side)} [data-testid="${testId}"]`);
    await expect(field).toHaveClass(/diff-modified/);
  }
);

Then(
  "the {string} field should not be highlighted in the {word} pane",
  async function (this: CustomWorld, fieldName: string, side: "left" | "right") {
    const testId = COMPARE_FIELD_TEST_IDS[fieldName];
    const field = this.page.locator(`${panePrefix(side)} [data-testid="${testId}"]`);
    await expect(field).not.toHaveClass(/diff-modified/);
  }
);

Then(
  "the added cypher card should be highlighted as added in the right pane",
  async function (this: CustomWorld) {
    const card = this.page.locator(`${panePrefix("right")} [data-testid="cypher-item"].diff-added`);
    await expect(card).toHaveCount(1);
  }
);

Then("the left pane should not show the added cypher card", async function (this: CustomWorld) {
  const card = this.page.locator(`${panePrefix("left")} [data-testid="cypher-item"].diff-added`);
  await expect(card).toHaveCount(0);
});

Then(
  "the removed cypher card should be highlighted as removed in the left pane",
  async function (this: CustomWorld) {
    const card = this.page.locator(
      `${panePrefix("left")} [data-testid="cypher-item"].diff-removed`
    );
    await expect(card).toHaveCount(1);
  }
);

Then("the right pane should not show the removed cypher card", async function (this: CustomWorld) {
  const card = this.page.locator(`${panePrefix("right")} [data-testid="cypher-item"].diff-removed`);
  await expect(card).toHaveCount(0);
});

Then(
  "the modified cypher card should be highlighted as changed in the {word} pane",
  async function (this: CustomWorld, side: "left" | "right") {
    const card = this.page.locator(`${panePrefix(side)} [data-testid="cypher-item"].diff-modified`);
    await expect(card).toHaveCount(1);
  }
);

Then(
  "the old cypher name should be highlighted as removed in the left pane",
  async function (this: CustomWorld) {
    const card = this.page.locator(
      `${panePrefix("left")} [data-testid="cypher-item"].diff-removed`
    );
    await expect(card).toHaveCount(1);
  }
);

Then(
  "the new cypher name should be highlighted as added in the right pane",
  async function (this: CustomWorld) {
    const card = this.page.locator(`${panePrefix("right")} [data-testid="cypher-item"].diff-added`);
    await expect(card).toHaveCount(1);
  }
);

// ----------------------------------------------------------------------------
// Restore per pane
// ----------------------------------------------------------------------------

When("I click the left pane's restore button", async function (this: CustomWorld) {
  await this.page.locator(paneControl("left", "restore")).click();
  await this.page.waitForTimeout(300);
});

When("I click the right pane's restore button", async function (this: CustomWorld) {
  await this.page.locator(paneControl("right", "restore")).click();
  await this.page.waitForTimeout(300);
});

Then("the right pane's restore button should be disabled", async function (this: CustomWorld) {
  const button = this.page.locator(paneControl("right", "restore"));
  await expect(button).toBeDisabled();
});

Then(
  "the {word} pane should show the newly restored version",
  async function (this: CustomWorld, side: "left" | "right") {
    const versions = await this.storageHelper.getAllVersions();
    await expect(this.page.locator(paneControl(side, "counter"))).toContainText(
      `${versions.length} of ${versions.length}`
    );
  }
);

Then(
  "the right pane should still show the same character name as before the restore",
  async function (this: CustomWorld) {
    // Right pane was untouched and originally showed the true latest version
    // ("Version 99", per "the character has {int} versions in history").
    // Restoring the left pane appends a new version, which - under the
    // 99-version FIFO cap - evicts the oldest and shifts every remaining
    // index down by one, so the right pane's *number* legitimately changes
    // (e.g. "Version 99" -> "Version 98 of 99"), but it must still resolve
    // to the same underlying version by stable id, not a different one.
    const nameField = this.page.locator(`${panePrefix("right")} [data-testid="character-name"]`);
    await expect(nameField).toHaveText("Version 99");
  }
);

// ----------------------------------------------------------------------------
// Exit
// ----------------------------------------------------------------------------

When("I click the return to editing button", async function (this: CustomWorld) {
  await this.page.locator('[data-testid="comparison-exit-button"]').click();
});

// ----------------------------------------------------------------------------
// Editability
// ----------------------------------------------------------------------------

Then("no field in the comparison view should be editable", async function (this: CustomWorld) {
  const inputs = this.page.locator(
    '[data-testid="diff-character-sheet"] input, [data-testid="diff-character-sheet"] textarea, [data-testid="diff-character-sheet"] select'
  );
  await expect(inputs).toHaveCount(0);
});

Then(
  "no add or delete button should be present in the comparison view",
  async function (this: CustomWorld) {
    const buttons = this.page.locator('[data-testid="diff-character-sheet"] button');
    await expect(buttons).toHaveCount(0);
  }
);

// ----------------------------------------------------------------------------
// Responsive fallback
// ----------------------------------------------------------------------------
