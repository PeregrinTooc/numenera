import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

// Given steps

Given("the character has no version history yet", async function (this: CustomWorld) {
  // Version history starts empty - no setup needed
  // The versionHistory manager will be initialized but empty
});

Given(
  "the character has {int} versions in history",
  async function (this: CustomWorld, versionCount: number) {
    // Create versions directly using the test helper to avoid timing issues
    // Get the current character as a base
    const baseCharacter = await this.storageHelper.getCharacter();

    for (let i = 1; i < versionCount; i++) {
      // Create a modified character for each version
      const versionCharacter = {
        ...baseCharacter,
        name: `Version ${i + 1}`,
      };

      // Create the version directly
      await this.storageHelper.createVersion(versionCharacter, `Changed name`);
    }

    // Wait a bit for the navigator to update
    await this.page.waitForTimeout(100);
  }
);

Given("I am viewing the latest version", async function (this: CustomWorld) {
  // Default state - no action needed
  // We're always at the latest version unless we navigate
});

Given("I am viewing version {int}", async function (this: CustomWorld, _versionNumber: number) {
  // TODO: Navigate to specific version
  throw new Error("Step not implemented yet");
});

Given("the character has a version with name change", async function (this: CustomWorld) {
  // TODO: Create version with specific change type
  throw new Error("Step not implemented yet");
});

Given(
  "the character has a version with multiple basic info changes",
  async function (this: CustomWorld) {
    // TODO: Create version with multiple basic info changes
    throw new Error("Step not implemented yet");
  }
);

Given(
  "the character has {int} versions with different data",
  async function (this: CustomWorld, _versionCount: number) {
    // TODO: Create versions with varied character data
    throw new Error("Step not implemented yet");
  }
);

Given(
  "the character has {int} versions with different names",
  async function (this: CustomWorld, _versionCount: number) {
    // TODO: Create versions with different names
    throw new Error("Step not implemented yet");
  }
);

Given("the character has a portrait image", async function (this: CustomWorld) {
  // TODO: Set portrait on character
  throw new Error("Step not implemented yet");
});

Given(
  "the character has a version from {int} minutes ago",
  async function (this: CustomWorld, _minutes: number) {
    // TODO: Create version with specific timestamp
    throw new Error("Step not implemented yet");
  }
);

// When steps

When("I view the character sheet", async function (this: CustomWorld) {
  // Already on character sheet from background - no action needed
});

// Note: "I edit the character name to {string}" already exists in auto-save-indicator.steps.ts
// and it already clicks the confirm button

When("I click the backward navigation arrow", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  // Wait a bit for navigation to complete
  await this.page.waitForTimeout(100);
});

When("I click the backward navigation arrow again", async function (this: CustomWorld) {
  // TODO: Click backward arrow button again
  throw new Error("Step not implemented yet");
});

When("I click the forward navigation arrow", async function (this: CustomWorld) {
  // TODO: Click forward arrow button
  throw new Error("Step not implemented yet");
});

When("I click the forward navigation arrow again", async function (this: CustomWorld) {
  // TODO: Click forward arrow button again
  throw new Error("Step not implemented yet");
});

When("I click the restore button in the warning banner", async function (this: CustomWorld) {
  // TODO: Click restore button
  throw new Error("Step not implemented yet");
});

When("I navigate to version {int}", async function (this: CustomWorld, _versionNumber: number) {
  // TODO: Navigate to specific version
  throw new Error("Step not implemented yet");
});

When("I navigate backward", async function (this: CustomWorld) {
  // TODO: Click backward arrow
  throw new Error("Step not implemented yet");
});

When("I navigate forward twice", async function (this: CustomWorld) {
  // TODO: Click forward arrow twice
  throw new Error("Step not implemented yet");
});

When("I view the version navigator", async function (this: CustomWorld) {
  // Already visible if versions exist - no action needed
});

When("I focus the backward arrow and press Enter", async function (this: CustomWorld) {
  // TODO: Focus and press Enter
  throw new Error("Step not implemented yet");
});

When("I focus the forward arrow and press Space", async function (this: CustomWorld) {
  // TODO: Focus and press Space
  throw new Error("Step not implemented yet");
});

When(
  "I rapidly click the backward arrow {int} times",
  async function (this: CustomWorld, _times: number) {
    // TODO: Click backward arrow multiple times rapidly
    throw new Error("Step not implemented yet");
  }
);

When("I refresh the browser", async function (this: CustomWorld) {
  // TODO: Refresh page
  throw new Error("Step not implemented yet");
});

When("I edit the character tier to {int}", async function (this: CustomWorld, _tier: number) {
  // TODO: Edit tier field
  throw new Error("Step not implemented yet");
});

When("I create a new version by editing the name", async function (this: CustomWorld) {
  // TODO: Edit name to create new version
  throw new Error("Step not implemented yet");
});

// Note: "I click the export button" already exists in character-file-export.steps.ts
// Note: "I edit the character name" can use the existing step with parameter

// Then steps

Then("the version navigator should not be visible", async function (this: CustomWorld) {
  // Check if version navigator element exists or is hidden
  const versionNavigator = await this.page.locator('[data-testid="version-navigator"]').count();
  expect(versionNavigator).toBe(0);
});

Then("all edit controls should be enabled", async function (this: CustomWorld) {
  // Verify edit controls are not disabled (read-only mode not active)
  const readOnlyIndicator = await this.page.locator('[data-readonly="true"]').count();
  expect(readOnlyIndicator).toBe(0);
});

Then("the version navigator should be visible", async function (this: CustomWorld) {
  const versionNavigator = this.page.locator('[data-testid="version-navigator"]');
  await expect(versionNavigator).toBeVisible();
});

Then(
  "the version counter should show {string}",
  async function (this: CustomWorld, counterText: string) {
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toHaveText(counterText);
  }
);

Then("the navigation arrows should both be disabled", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(backwardArrow).toBeDisabled();
  await expect(forwardArrow).toBeDisabled();
});

Then("no warning banner should be visible", async function (this: CustomWorld) {
  const warningBanner = await this.page.locator('[data-testid="version-warning-banner"]').count();
  expect(warningBanner).toBe(0);
});

Then("the backward arrow should be enabled", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await expect(backwardArrow).toBeEnabled();
});

Then("the forward arrow should be disabled", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(forwardArrow).toBeDisabled();
});

Then(
  "the character data should match version {int}",
  async function (this: CustomWorld, versionNumber: number) {
    // Get all versions from storage
    const versions = await this.storageHelper.getAllVersions();

    // Version number is 1-based, array is 0-based
    const expectedVersion = versions[versionNumber - 1];

    // Get the displayed character name
    const nameField = this.page.locator('[data-testid="character-name"]');
    const displayedName = await nameField.textContent();

    // Compare with expected version's character name
    expect(displayedName?.trim()).toBe(expectedVersion.character.name);
  }
);

Then("the change description should be displayed", async function (this: CustomWorld) {
  // The change description should be visible within the warning banner
  const changeDescription = this.page.locator('[data-testid="version-change-description"]');
  await expect(changeDescription).toBeVisible();
  // It should contain some text (not be empty)
  const text = await changeDescription.textContent();
  expect(text?.trim().length).toBeGreaterThan(0);
});

Then("the timestamp should be displayed", async function (this: CustomWorld) {
  // The timestamp should be visible within the warning banner
  const timestamp = this.page.locator('[data-testid="version-timestamp"]');
  await expect(timestamp).toBeVisible();
  // It should contain some text (not be empty)
  const text = await timestamp.textContent();
  expect(text?.trim().length).toBeGreaterThan(0);
});

Then("both navigation arrows should be enabled", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(backwardArrow).toBeEnabled();
  await expect(forwardArrow).toBeEnabled();
});

Then("the warning banner should be visible", async function (this: CustomWorld) {
  const warningBanner = this.page.locator('[data-testid="version-warning-banner"]');
  await expect(warningBanner).toBeVisible();
});

Then("all edit controls should be disabled", async function (this: CustomWorld) {
  // Check that the character sheet is in read-only mode
  // This will be implemented when we add the read-only mode attribute
  const readOnlyIndicator = this.page.locator('[data-readonly="true"]');
  await expect(readOnlyIndicator).toBeVisible();
});

Then("the backward arrow should be disabled", async function (this: CustomWorld) {
  // TODO: Assert backward arrow disabled
  throw new Error("Step not implemented yet");
});

Then("the forward arrow should be enabled", async function (this: CustomWorld) {
  // TODO: Assert forward arrow enabled
  throw new Error("Step not implemented yet");
});

Then("the character data should match the latest version", async function (this: CustomWorld) {
  // TODO: Assert character data matches latest version
  throw new Error("Step not implemented yet");
});

Then(
  "the warning banner should contain text {string}",
  async function (this: CustomWorld, _text: string) {
    // TODO: Assert warning banner contains specific text
    throw new Error("Step not implemented yet");
  }
);

Then("the warning banner should have a restore button", async function (this: CustomWorld) {
  // TODO: Assert restore button exists in banner
  throw new Error("Step not implemented yet");
});

Then("the edit field modal buttons should be disabled", async function (this: CustomWorld) {
  // TODO: Assert edit field buttons disabled
  throw new Error("Step not implemented yet");
});

Then("the card edit buttons should be disabled", async function (this: CustomWorld) {
  // TODO: Assert card edit buttons disabled
  throw new Error("Step not implemented yet");
});

Then("the stat pool edit controls should be disabled", async function (this: CustomWorld) {
  // TODO: Assert stat pool controls disabled
  throw new Error("Step not implemented yet");
});

Then("the recovery roll checkboxes should be disabled", async function (this: CustomWorld) {
  // TODO: Assert recovery checkboxes disabled
  throw new Error("Step not implemented yet");
});

Then("the export button should still be enabled", async function (this: CustomWorld) {
  // TODO: Assert export button enabled
  throw new Error("Step not implemented yet");
});

Then("the language selector should still be enabled", async function (this: CustomWorld) {
  // TODO: Assert language selector enabled
  throw new Error("Step not implemented yet");
});

Then("editable fields should have reduced opacity", async function (this: CustomWorld) {
  // TODO: Assert fields have reduced opacity
  throw new Error("Step not implemented yet");
});

Then(
  "the cursor should show {string} over edit controls",
  async function (this: CustomWorld, _cursorType: string) {
    // TODO: Assert cursor style
    throw new Error("Step not implemented yet");
  }
);

Then(
  "the character sheet should have a visual indicator of read-only mode",
  async function (this: CustomWorld) {
    // TODO: Assert visual indicator present
    throw new Error("Step not implemented yet");
  }
);

Then(
  "the version description should contain {string}",
  async function (this: CustomWorld, _text: string) {
    // TODO: Assert description contains text
    throw new Error("Step not implemented yet");
  }
);

Then("the timestamp should be in human-readable format", async function (this: CustomWorld) {
  // TODO: Assert timestamp format
  throw new Error("Step not implemented yet");
});

Then(
  "the timestamp should show a relative time like {string}",
  async function (this: CustomWorld, _example: string) {
    // TODO: Assert relative time format
    throw new Error("Step not implemented yet");
  }
);

Then(
  "the character name should match version {int} name",
  async function (this: CustomWorld, _versionNumber: number) {
    // TODO: Assert name matches specific version
    throw new Error("Step not implemented yet");
  }
);

Then(
  "the character stats should match version {int} stats",
  async function (this: CustomWorld, _versionNumber: number) {
    // TODO: Assert stats match specific version
    throw new Error("Step not implemented yet");
  }
);

Then(
  "the character equipment should match version {int} equipment",
  async function (this: CustomWorld, _versionNumber: number) {
    // TODO: Assert equipment matches specific version
    throw new Error("Step not implemented yet");
  }
);

Then("the portrait should remain unchanged", async function (this: CustomWorld) {
  // TODO: Assert portrait unchanged
  throw new Error("Step not implemented yet");
});

Then(
  "the exported file should contain version {int} data",
  async function (this: CustomWorld, _versionNumber: number) {
    // TODO: Assert exported file contains specific version data
    throw new Error("Step not implemented yet");
  }
);

Then("the exported file should not contain version history", async function (this: CustomWorld) {
  // TODO: Assert exported file doesn't have version history
  throw new Error("Step not implemented yet");
});

Then("the exported file should use the current portrait", async function (this: CustomWorld) {
  // TODO: Assert exported file has current portrait
  throw new Error("Step not implemented yet");
});

Then("a new version should be created", async function (this: CustomWorld) {
  // TODO: Assert new version exists
  throw new Error("Step not implemented yet");
});

Then("I should be viewing the latest version", async function (this: CustomWorld) {
  // TODO: Assert at latest version
  throw new Error("Step not implemented yet");
});

Then("the backward arrow should have an accessible label", async function (this: CustomWorld) {
  // TODO: Assert aria-label on backward arrow
  throw new Error("Step not implemented yet");
});

Then("the forward arrow should have an accessible label", async function (this: CustomWorld) {
  // TODO: Assert aria-label on forward arrow
  throw new Error("Step not implemented yet");
});

Then("the restore button should have an accessible label", async function (this: CustomWorld) {
  // TODO: Assert aria-label on restore button
  throw new Error("Step not implemented yet");
});

Then(
  "the version counter should be announced to screen readers",
  async function (this: CustomWorld) {
    // TODO: Assert aria-live or similar on counter
    throw new Error("Step not implemented yet");
  }
);

Then(
  "I should navigate to version {int}",
  async function (this: CustomWorld, _versionNumber: number) {
    // TODO: Assert navigated to specific version
    throw new Error("Step not implemented yet");
  }
);

Then(
  "the character data should be correct for version {int}",
  async function (this: CustomWorld, _versionNumber: number) {
    // TODO: Assert data matches version
    throw new Error("Step not implemented yet");
  }
);

Then("the UI should remain responsive", async function (this: CustomWorld) {
  // TODO: Assert UI didn't freeze/lag
  throw new Error("Step not implemented yet");
});

Then("the oldest version should have been removed", async function (this: CustomWorld) {
  // TODO: Assert oldest version no longer accessible
  throw new Error("Step not implemented yet");
});

Then(
  "I can still navigate to version {int} \\(which was previously version {int}\\)",
  async function (this: CustomWorld, _newVersionNum: number, _oldVersionNum: number) {
    // TODO: Assert FIFO shifted versions correctly
    throw new Error("Step not implemented yet");
  }
);
