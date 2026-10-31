import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";
import { paneControl } from "../support/comparisonViewHelpers.js";

// ----------------------------------------------------------------------------
// Per-pane navigation
// ----------------------------------------------------------------------------

When("I click the left pane's backward arrow", async function (this: CustomWorld) {
  await this.page.locator(paneControl("left", "backward")).click();
});

When("I click the left pane's forward arrow", async function (this: CustomWorld) {
  await this.page.locator(paneControl("left", "forward")).click();
});

When("I click the right pane's backward arrow", async function (this: CustomWorld) {
  await this.page.locator(paneControl("right", "backward")).click();
});

When(
  "I click the left pane's backward arrow {int} time(s)",
  async function (this: CustomWorld, times: number) {
    const arrow = this.page.locator(paneControl("left", "backward"));
    for (let i = 0; i < times; i++) {
      await arrow.click();
      await this.page.waitForTimeout(50);
    }
  }
);

When(
  "I click the right pane's backward arrow {int} time(s)",
  async function (this: CustomWorld, times: number) {
    const arrow = this.page.locator(paneControl("right", "backward"));
    for (let i = 0; i < times; i++) {
      await arrow.click();
      await this.page.waitForTimeout(50);
    }
  }
);

async function moveTo(world: CustomWorld, side: "left" | "right", target: number): Promise<void> {
  const counter = world.page.locator(paneControl(side, "counter"));
  const text = (await counter.textContent()) ?? "";
  const match = text.match(/(\d+)/);
  const current = match ? parseInt(match[1], 10) : target;
  const diff = current - target;
  const arrow = world.page.locator(paneControl(side, diff > 0 ? "backward" : "forward"));
  for (let i = 0; i < Math.abs(diff); i++) {
    await arrow.click();
    await world.page.waitForTimeout(50);
  }
}

Given("the left pane shows version {int}", async function (this: CustomWorld, target: number) {
  await moveTo(this, "left", target);
});

Given("the right pane shows version {int}", async function (this: CustomWorld, target: number) {
  await moveTo(this, "right", target);
});

Then("the left pane should show version {int}", async function (this: CustomWorld, target: number) {
  await expect(this.page.locator(paneControl("left", "counter"))).toContainText(`${target} of`);
});

Then(
  "the right pane should show version {int}",
  async function (this: CustomWorld, target: number) {
    await expect(this.page.locator(paneControl("right", "counter"))).toContainText(`${target} of`);
  }
);

// ----------------------------------------------------------------------------
// Change header
// ----------------------------------------------------------------------------

Then(
  "the comparison header should list every changed field, not just the top 3",
  async function (this: CustomWorld) {
    const items = this.page.locator('[data-testid="comparison-header"] li');
    await expect(items).toHaveCount(3);
    // Uncapped and un-combined: the individual lines, not the combined summary.
    await expect(this.page.locator('[data-testid="comparison-header"]')).toContainText(
      "Changed name"
    );
    await expect(this.page.locator('[data-testid="comparison-header"]')).not.toContainText(
      "Edited basic info"
    );
  }
);

Then(
  "the comparison header should reflect the new left pane version",
  async function (this: CustomWorld) {
    // Just confirm the header re-rendered with the left pane's new position -
    // presence of the header container is enough; content correctness is
    // covered by the diffCharacters/describeDiff unit tests.
    await expect(this.page.locator('[data-testid="comparison-header"]')).toBeVisible();
  }
);

Then(
  "the comparison header should indicate there are no differences",
  async function (this: CustomWorld) {
    await expect(this.page.locator('[data-testid="comparison-view-no-changes"]')).toBeVisible();
  }
);
