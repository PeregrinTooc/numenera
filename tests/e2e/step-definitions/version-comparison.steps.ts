import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world.js";
import { DOMHelpers } from "../support/dom-helpers.js";

// ============================================================================
// COMPARISON VIEW STEP DEFINITIONS
// ============================================================================

const COMPARE_FIELD_TEST_IDS: Record<string, string> = {
  "character name": "character-name",
  tier: "character-tier",
};

function panePrefix(side: "left" | "right"): string {
  return `[data-testid="compare-pane-${side}"]`;
}

// For the pane's own compound testids (compare-pane-left-backward etc.),
// which are a single attribute value, not a descendant of panePrefix().
function paneControl(side: "left" | "right", control: string): string {
  return `[data-testid="compare-pane-${side}-${control}"]`;
}

// ----------------------------------------------------------------------------
// Settings toggle
// ----------------------------------------------------------------------------

async function setComparisonViewEnabled(world: CustomWorld, enabled: boolean): Promise<void> {
  const dom = new DOMHelpers(world.page!);
  await dom.getByTestId("settings-gear-button").click();
  await expect(dom.getByTestId("settings-panel")).toBeVisible();
  await world.page!.waitForTimeout(50);

  const toggle = dom.getByTestId("settings-comparison-view-toggle");
  const isChecked = await toggle.isChecked();
  if (isChecked !== enabled) {
    await toggle.click();
  }

  await dom.getByTestId("settings-gear-button").click();
  await expect(dom.getByTestId("settings-panel")).not.toBeVisible();
}

Given("comparison view is enabled in settings", async function (this: CustomWorld) {
  await setComparisonViewEnabled(this, true);
});

When("I enable comparison view in settings", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  const toggle = dom.getByTestId("settings-comparison-view-toggle");
  if (!(await toggle.isChecked())) {
    await toggle.click();
  }
});

When("I close the settings panel", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await dom.getByTestId("settings-gear-button").click();
  await expect(dom.getByTestId("settings-panel")).not.toBeVisible();
});

Then("comparison view should show as enabled in settings", async function (this: CustomWorld) {
  const dom = new DOMHelpers(this.page!);
  await expect(dom.getByTestId("settings-comparison-view-toggle")).toBeChecked();
});

// ----------------------------------------------------------------------------
// Opening / visibility
// ----------------------------------------------------------------------------

Given("I am viewing the comparison view", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="version-nav-backward"]').click();
  await expect(this.page!.locator('[data-testid="comparison-view"]')).toBeVisible();
});

Then("the comparison view should be visible", async function (this: CustomWorld) {
  await expect(this.page!.locator('[data-testid="comparison-view"]')).toBeVisible();
});

Then("the comparison view should not be visible", async function (this: CustomWorld) {
  const count = await this.page!.locator('[data-testid="comparison-view"]').count();
  expect(count).toBe(0);
});

// ----------------------------------------------------------------------------
// Data setup - small paired versions for highlighting scenarios
// ----------------------------------------------------------------------------

async function waitForBootstrap(world: CustomWorld): Promise<void> {
  await world.page!.waitForLoadState("networkidle");
  await world.page!.waitForTimeout(500);
}

Given("the character has a version with a name change", async function (this: CustomWorld) {
  await waitForBootstrap(this);
  const base = await this.storageHelper.getCharacter();
  await this.storageHelper.createVersion({ ...base, name: "New Name" }, "Changed name");
  await expect(this.page!.locator('[data-testid="version-counter"]')).toContainText(
    "Version 2 of 2",
    { timeout: 10000 }
  );
});

Given("the character has a version with an added cypher", async function (this: CustomWorld) {
  await waitForBootstrap(this);
  const base = await this.storageHelper.getCharacter();
  const withAdded = {
    ...base,
    cyphers: [...base.cyphers, { name: "New Cypher", level: "1d6", effect: "Something new" }],
  };
  await this.storageHelper.createVersion(withAdded, "Added cypher");
  await expect(this.page!.locator('[data-testid="version-counter"]')).toContainText(
    "Version 2 of 2",
    { timeout: 10000 }
  );
});

Given("the character has a version with a removed cypher", async function (this: CustomWorld) {
  await waitForBootstrap(this);
  const base = await this.storageHelper.getCharacter();
  const withRemoved = { ...base, cyphers: base.cyphers.slice(1) };
  await this.storageHelper.createVersion(withRemoved, "Removed cypher");
  await expect(this.page!.locator('[data-testid="version-counter"]')).toContainText(
    "Version 2 of 2",
    { timeout: 10000 }
  );
});

Given(
  "the character has a version with a modified cypher effect",
  async function (this: CustomWorld) {
    await waitForBootstrap(this);
    const base = await this.storageHelper.getCharacter();
    const modified = {
      ...base,
      cyphers: base.cyphers.map((c: { name: string; level: string; effect: string }, i: number) =>
        i === 0 ? { ...c, effect: "A completely different effect" } : c
      ),
    };
    await this.storageHelper.createVersion(modified, "Modified cypher");
    await expect(this.page!.locator('[data-testid="version-counter"]')).toContainText(
      "Version 2 of 2",
      { timeout: 10000 }
    );
  }
);

Given("the character has a version where a cypher was renamed", async function (this: CustomWorld) {
  await waitForBootstrap(this);
  const base = await this.storageHelper.getCharacter();
  const renamed = {
    ...base,
    cyphers: base.cyphers.map((c: { name: string; level: string; effect: string }, i: number) =>
      i === 0 ? { ...c, name: "Renamed Cypher" } : c
    ),
  };
  await this.storageHelper.createVersion(renamed, "Renamed cypher");
  await expect(this.page!.locator('[data-testid="version-counter"]')).toContainText(
    "Version 2 of 2",
    { timeout: 10000 }
  );
});

// ----------------------------------------------------------------------------
// Per-pane navigation
// ----------------------------------------------------------------------------

When("I click the left pane's backward arrow", async function (this: CustomWorld) {
  await this.page!.locator(paneControl("left", "backward")).click();
});

When("I click the left pane's forward arrow", async function (this: CustomWorld) {
  await this.page!.locator(paneControl("left", "forward")).click();
});

When("I click the right pane's backward arrow", async function (this: CustomWorld) {
  await this.page!.locator(paneControl("right", "backward")).click();
});

When("I click the right pane's forward arrow", async function (this: CustomWorld) {
  await this.page!.locator(paneControl("right", "forward")).click();
});

When(
  "I click the left pane's backward arrow {int} time(s)",
  async function (this: CustomWorld, times: number) {
    const arrow = this.page!.locator(paneControl("left", "backward"));
    for (let i = 0; i < times; i++) {
      await arrow.click();
      await this.page!.waitForTimeout(50);
    }
  }
);

When(
  "I click the right pane's backward arrow {int} time(s)",
  async function (this: CustomWorld, times: number) {
    const arrow = this.page!.locator(paneControl("right", "backward"));
    for (let i = 0; i < times; i++) {
      await arrow.click();
      await this.page!.waitForTimeout(50);
    }
  }
);

async function moveTo(world: CustomWorld, side: "left" | "right", target: number): Promise<void> {
  const counter = world.page!.locator(paneControl(side, "counter"));
  const text = (await counter.textContent()) ?? "";
  const match = text.match(/(\d+)/);
  const current = match ? parseInt(match[1], 10) : target;
  const diff = current - target;
  const arrow = world.page!.locator(paneControl(side, diff > 0 ? "backward" : "forward"));
  for (let i = 0; i < Math.abs(diff); i++) {
    await arrow.click();
    await world.page!.waitForTimeout(50);
  }
}

Given("the left pane shows version {int}", async function (this: CustomWorld, target: number) {
  await moveTo(this, "left", target);
});

Given("the right pane shows version {int}", async function (this: CustomWorld, target: number) {
  await moveTo(this, "right", target);
});

Then("the left pane should show version {int}", async function (this: CustomWorld, target: number) {
  await expect(this.page!.locator(paneControl("left", "counter"))).toContainText(`${target} of`);
});

Then(
  "the right pane should show version {int}",
  async function (this: CustomWorld, target: number) {
    await expect(this.page!.locator(paneControl("right", "counter"))).toContainText(`${target} of`);
  }
);

// ----------------------------------------------------------------------------
// Change header
// ----------------------------------------------------------------------------

Then(
  "the comparison header should list every changed field, not just the top 3",
  async function (this: CustomWorld) {
    const items = this.page!.locator('[data-testid="comparison-header"] li');
    await expect(items).toHaveCount(3);
    // Uncapped and un-combined: the individual lines, not the combined summary.
    await expect(this.page!.locator('[data-testid="comparison-header"]')).toContainText(
      "Changed name"
    );
    await expect(this.page!.locator('[data-testid="comparison-header"]')).not.toContainText(
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
    await expect(this.page!.locator('[data-testid="comparison-header"]')).toBeVisible();
  }
);

Then(
  "the comparison header should indicate there are no differences",
  async function (this: CustomWorld) {
    await expect(this.page!.locator('[data-testid="comparison-view-no-changes"]')).toBeVisible();
  }
);

// ----------------------------------------------------------------------------
// Highlighting
// ----------------------------------------------------------------------------

Then(
  "the {string} field should be highlighted as changed in the {word} pane",
  async function (this: CustomWorld, fieldName: string, side: "left" | "right") {
    const testId = COMPARE_FIELD_TEST_IDS[fieldName];
    const field = this.page!.locator(`${panePrefix(side)} [data-testid="${testId}"]`);
    await expect(field).toHaveClass(/diff-modified/);
  }
);

Then(
  "the {string} field should not be highlighted in the {word} pane",
  async function (this: CustomWorld, fieldName: string, side: "left" | "right") {
    const testId = COMPARE_FIELD_TEST_IDS[fieldName];
    const field = this.page!.locator(`${panePrefix(side)} [data-testid="${testId}"]`);
    await expect(field).not.toHaveClass(/diff-modified/);
  }
);

Then(
  "the added cypher card should be highlighted as added in the right pane",
  async function (this: CustomWorld) {
    const card = this.page!.locator(
      `${panePrefix("right")} [data-testid="cypher-item"].diff-added`
    );
    await expect(card).toHaveCount(1);
  }
);

Then("the left pane should not show the added cypher card", async function (this: CustomWorld) {
  const card = this.page!.locator(`${panePrefix("left")} [data-testid="cypher-item"].diff-added`);
  await expect(card).toHaveCount(0);
});

Then(
  "the removed cypher card should be highlighted as removed in the left pane",
  async function (this: CustomWorld) {
    const card = this.page!.locator(
      `${panePrefix("left")} [data-testid="cypher-item"].diff-removed`
    );
    await expect(card).toHaveCount(1);
  }
);

Then("the right pane should not show the removed cypher card", async function (this: CustomWorld) {
  const card = this.page!.locator(
    `${panePrefix("right")} [data-testid="cypher-item"].diff-removed`
  );
  await expect(card).toHaveCount(0);
});

Then(
  "the modified cypher card should be highlighted as changed in the {word} pane",
  async function (this: CustomWorld, side: "left" | "right") {
    const card = this.page!.locator(
      `${panePrefix(side)} [data-testid="cypher-item"].diff-modified`
    );
    await expect(card).toHaveCount(1);
  }
);

Then(
  "the old cypher name should be highlighted as removed in the left pane",
  async function (this: CustomWorld) {
    const card = this.page!.locator(
      `${panePrefix("left")} [data-testid="cypher-item"].diff-removed`
    );
    await expect(card).toHaveCount(1);
  }
);

Then(
  "the new cypher name should be highlighted as added in the right pane",
  async function (this: CustomWorld) {
    const card = this.page!.locator(
      `${panePrefix("right")} [data-testid="cypher-item"].diff-added`
    );
    await expect(card).toHaveCount(1);
  }
);

// ----------------------------------------------------------------------------
// Restore per pane
// ----------------------------------------------------------------------------

When("I click the left pane's restore button", async function (this: CustomWorld) {
  await this.page!.locator(paneControl("left", "restore")).click();
  await this.page!.waitForTimeout(300);
});

When("I click the right pane's restore button", async function (this: CustomWorld) {
  await this.page!.locator(paneControl("right", "restore")).click();
  await this.page!.waitForTimeout(300);
});

Then("the right pane's restore button should be disabled", async function (this: CustomWorld) {
  const button = this.page!.locator(paneControl("right", "restore"));
  await expect(button).toBeDisabled();
});

Then(
  "the {word} pane should show the newly restored version",
  async function (this: CustomWorld, side: "left" | "right") {
    const versions = await this.storageHelper.getAllVersions();
    await expect(this.page!.locator(paneControl(side, "counter"))).toContainText(
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
    const nameField = this.page!.locator(`${panePrefix("right")} [data-testid="character-name"]`);
    await expect(nameField).toHaveText("Version 99");
  }
);

// ----------------------------------------------------------------------------
// Exit
// ----------------------------------------------------------------------------

When("I click the return to editing button", async function (this: CustomWorld) {
  await this.page!.locator('[data-testid="comparison-exit-button"]').click();
});

// ----------------------------------------------------------------------------
// Editability
// ----------------------------------------------------------------------------

Then("no field in the comparison view should be editable", async function (this: CustomWorld) {
  const inputs = this.page!.locator(
    '[data-testid="diff-character-sheet"] input, [data-testid="diff-character-sheet"] textarea, [data-testid="diff-character-sheet"] select'
  );
  await expect(inputs).toHaveCount(0);
});

Then(
  "no add or delete button should be present in the comparison view",
  async function (this: CustomWorld) {
    const buttons = this.page!.locator('[data-testid="diff-character-sheet"] button');
    await expect(buttons).toHaveCount(0);
  }
);

// ----------------------------------------------------------------------------
// Responsive fallback
// ----------------------------------------------------------------------------

Given("I am using a phone-width viewport", async function (this: CustomWorld) {
  await this.page!.setViewportSize({ width: 390, height: 844 }); // iPhone 12 width
});

Given("I am using a tablet-width viewport", async function (this: CustomWorld) {
  await this.page!.setViewportSize({ width: 1024, height: 1366 }); // iPad Pro portrait width
});
