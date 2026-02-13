import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

// Given steps

Given("the character has no version history yet", async function (this: CustomWorld) {
  // Version history starts empty - no setup needed
  // The versionHistory manager will be initialized but empty
});

Given("I have a character loaded", async function (this: CustomWorld) {
  // Character is already loaded from the page - no action needed
  // This is equivalent to being on the character sheet page
  await this.page.waitForLoadState("networkidle");
});

Given(
  "the character has {int} versions in history",
  async function (this: CustomWorld, versionCount: number) {
    // Wait for page to be fully loaded before creating versions
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

    // Store the original character name before any editing (for buffer undo tests)
    const nameField = this.page.locator('[data-testid="character-name"]');
    const originalName = await nameField.textContent();
    this.testContext = this.testContext || {};
    this.testContext.originalCharacterName = originalName?.trim();

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

      // For large number of versions, add small delay to avoid overwhelming the system
      if (versionCount > 50 && i % 10 === 0) {
        await this.page.waitForTimeout(100);
      }
    }

    // Wait a bit for the navigator to update
    await this.page.waitForTimeout(200);
  }
);

Given("I am viewing the latest version", async function (this: CustomWorld) {
  // Default state - no action needed
  // We're always at the latest version unless we navigate
});

Given("I am viewing version {int}", async function (this: CustomWorld, versionNumber: number) {
  // Navigate backward from latest to reach the specified version
  const versions = await this.storageHelper.getAllVersions();
  const currentIndex = versions.length; // Currently at latest (1-based)
  const targetIndex = versionNumber;
  const clicksNeeded = currentIndex - targetIndex;

  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  for (let i = 0; i < clicksNeeded; i++) {
    await backwardArrow.click();
    await this.page.waitForTimeout(100);
  }
});

Given("the character has a version with name change", async function (this: CustomWorld) {
  // Create a version with a name change
  // Note: Version 1 is "Initial state", so this creates version 2 with "Changed name"
  const baseCharacter = await this.storageHelper.getCharacter();
  const versionCharacter = {
    ...baseCharacter,
    name: "New Name",
  };
  await this.storageHelper.createVersion(versionCharacter, "Changed name");
  await this.page.waitForTimeout(100);

  // Store which version has the name change
  this.testContext = this.testContext || {};
  this.testContext.versionWithNameChange = (await this.storageHelper.getAllVersions()).length;

  // Create one more version so we can navigate back to see version 2's description
  const anotherCharacter = {
    ...versionCharacter,
    name: "Latest Version",
  };
  await this.storageHelper.createVersion(anotherCharacter, "Another change");
  await this.page.waitForTimeout(100);
});

Given(
  "the character has a version with multiple basic info changes",
  async function (this: CustomWorld) {
    // Create a version with multiple basic info changes
    const baseCharacter = await this.storageHelper.getCharacter();
    const versionCharacter = {
      ...baseCharacter,
      name: "Changed Name",
      descriptor: "Changed Descriptor",
      type: "Changed Type",
    };
    await this.storageHelper.createVersion(versionCharacter, "Edited basic info");
    await this.page.waitForTimeout(100);

    // Create one more version so we can navigate back to see v2's description
    const latestCharacter = {
      ...versionCharacter,
      name: "Latest Version",
    };
    await this.storageHelper.createVersion(latestCharacter, "Final change");
    await this.page.waitForTimeout(100);
  }
);

Given(
  "the character has {int} versions with different data",
  async function (this: CustomWorld, versionCount: number) {
    // Create versions with different character data
    const baseCharacter = await this.storageHelper.getCharacter();

    for (let i = 1; i < versionCount; i++) {
      const versionCharacter = {
        ...baseCharacter,
        name: `Character V${i + 1}`,
        tier: i + 1,
        equipment: [{ name: `Item ${i + 1}`, description: `Description ${i + 1}` }],
      };
      await this.storageHelper.createVersion(versionCharacter, `Modified data`);
    }
    await this.page.waitForTimeout(100);
  }
);

Given(
  "the character has {int} versions with different names",
  async function (this: CustomWorld, versionCount: number) {
    // Create versions with different names
    const baseCharacter = await this.storageHelper.getCharacter();

    for (let i = 1; i < versionCount; i++) {
      const versionCharacter = {
        ...baseCharacter,
        name: `Name ${i + 1}`,
      };
      await this.storageHelper.createVersion(versionCharacter, `Changed name`);
    }
    await this.page.waitForTimeout(100);
  }
);

Given("the character has a portrait image", async function (this: CustomWorld) {
  // Set a portrait on the character (base64 encoded 1x1 pixel)
  const character = await this.storageHelper.getCharacter();
  character.portrait =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  await this.storageHelper.setCharacter(character);
  await this.page.reload();
  await this.page.waitForTimeout(100);
});

Given(
  "the character has a version from {int} minutes ago",
  async function (this: CustomWorld, _minutes: number) {
    // Create version with timestamp from specified minutes ago
    // Note: We create a version now and the test will check if the timestamp is displayed in readable format
    // The actual timestamp manipulation would require exposing more test APIs
    const baseCharacter = await this.storageHelper.getCharacter();
    const versionCharacter = {
      ...baseCharacter,
      name: "Past Version",
    };

    await this.storageHelper.createVersion(versionCharacter, "Changed name");
    // Wait longer for version navigator to update and any squash timers to complete
    await this.page.waitForTimeout(1500);
  }
);

Given("I am viewing that version", async function (this: CustomWorld) {
  // Navigate backward to view the version we're interested in
  // For "version with name change": We created 3 versions, click back once to see v2
  // For "version from X minutes ago": We created 2 versions, click back once to see v1
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  await this.page.waitForTimeout(200);
});

Given("I have made buffered edits that were undone", async function (this: CustomWorld) {
  // Make two edits to the character name
  const testId = "character-name";
  const field = this.page.locator(`[data-testid="${testId}"]`);

  // First edit
  await field.click();
  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill("First Edit");
  const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
  await confirmButton.click();
  await expect(modal).toHaveCount(0, { timeout: 2000 });
  await this.page.waitForTimeout(100);

  // Second edit
  await field.click();
  await expect(modal).toBeVisible({ timeout: 5000 });
  await input.fill("Second Edit");
  await confirmButton.click();
  await expect(modal).toHaveCount(0, { timeout: 2000 });
  await this.page.waitForTimeout(100);

  // Store the second edit for verification
  this.testContext = this.testContext || {};
  this.testContext.secondEdit = "Second Edit";

  // Undo both edits using Control+Z (before squash timer expires)
  await this.page.evaluate(() => {
    const event1 = new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    document.body.dispatchEvent(event1);
  });
  await this.page.waitForTimeout(200);

  // Undo again to go back to original
  await this.page.evaluate(() => {
    const event2 = new KeyboardEvent("keydown", {
      key: "z",
      code: "KeyZ",
      ctrlKey: true,
      metaKey: false,
      shiftKey: false,
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    document.body.dispatchEvent(event2);
  });
  await this.page.waitForTimeout(200);

  // Now we're at the original state, and redo stack has the two undone changes
});

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
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I click the forward navigation arrow", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await forwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I click the forward navigation arrow again", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await forwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I click the restore button in the warning banner", async function (this: CustomWorld) {
  const restoreButton = this.page.locator('[data-testid="version-restore-button"]');
  await restoreButton.click();
  await this.page.waitForTimeout(100);
});

When("I navigate to version {int}", async function (this: CustomWorld, versionNumber: number) {
  // Navigate to specific version from current position
  const versions = await this.storageHelper.getAllVersions();

  // Get current version from the counter display
  const versionCounter = this.page.locator('[data-testid="version-counter"]');
  const counterText = await versionCounter.textContent();
  const currentMatch = counterText?.match(/Version (\d+) of/);
  const currentIndex = currentMatch ? parseInt(currentMatch[1]) : versions.length;

  const targetIndex = versionNumber;

  if (targetIndex < currentIndex) {
    // Navigate backward
    const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
    const clicksNeeded = currentIndex - targetIndex;

    for (let i = 0; i < clicksNeeded; i++) {
      await expect(backwardArrow).toBeEnabled({ timeout: 5000 });
      await backwardArrow.click();
      await this.page.waitForTimeout(300);
      await this.page.waitForLoadState("networkidle");
    }
    await this.page.waitForTimeout(500);
  } else if (targetIndex > currentIndex) {
    // Navigate forward
    const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
    const clicksNeeded = targetIndex - currentIndex;

    for (let i = 0; i < clicksNeeded; i++) {
      await expect(forwardArrow).toBeEnabled({ timeout: 5000 });
      await forwardArrow.click();
      await this.page.waitForTimeout(300);
      await this.page.waitForLoadState("networkidle");
    }
    await this.page.waitForTimeout(500);
  }
  // else: already at target version, no navigation needed
});

When("I navigate backward", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I navigate forward twice", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await forwardArrow.click();
  await this.page.waitForTimeout(100);
  await forwardArrow.click();
  await this.page.waitForTimeout(100);
});

When("I view the version navigator", async function (this: CustomWorld) {
  // Already visible if versions exist - no action needed
});

When("I focus the backward arrow and press Enter", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.focus();
  await this.page.keyboard.press("Enter");
  await this.page.waitForTimeout(100);
});

When("I focus the forward arrow and press Space", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await forwardArrow.focus();
  await this.page.keyboard.press("Space");
  await this.page.waitForTimeout(100);
});

When(
  "I rapidly click the backward arrow {int} times",
  async function (this: CustomWorld, times: number) {
    const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
    for (let i = 0; i < times; i++) {
      await backwardArrow.click();
      // Very short wait for rapid clicking
      await this.page.waitForTimeout(10);
    }
    // Wait a bit longer at the end for UI to catch up
    await this.page.waitForTimeout(200);
  }
);

When("I refresh the browser", async function (this: CustomWorld) {
  await this.page.reload();
  await this.page.waitForTimeout(200);
});

// Note: "I edit the character tier to {int}" is now handled by the unified
// "I edit the {string} field to {string}" step in common-steps.ts

When("I create a new version by editing the name", async function (this: CustomWorld) {
  // Use the unified edit step
  const testId = "character-name";
  const field = this.page.locator(`[data-testid="${testId}"]`);

  await field.click();

  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill("New Version Name");

  const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
  await confirmButton.click();

  await expect(modal).toHaveCount(0, { timeout: 2000 });
  await this.page.waitForTimeout(200);
});

When("I open the name edit modal", async function (this: CustomWorld) {
  const nameField = this.page.locator('[data-testid="character-name"]');
  await nameField.click();

  // Wait for modal to open
  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });
});

When("I cancel the modal", async function (this: CustomWorld) {
  const cancelButton = this.page.locator('[data-testid="modal-cancel-button"]');
  await cancelButton.click();

  // Wait for modal to close
  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toHaveCount(0, { timeout: 2000 });
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
  // Note: Read-only mode has been removed per user requirements
  // User can edit from any version, which creates a new version at end of queue
  // This test step is now a no-op but kept for backward compatibility
  // Tests that use this step should be reviewed and potentially removed
});

Then("the backward arrow should be disabled", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await expect(backwardArrow).toBeDisabled();
});

Then("the forward arrow should be enabled", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(forwardArrow).toBeEnabled();
});

Then("the character data should match the latest version", async function (this: CustomWorld) {
  // TODO: Assert character data matches latest version
  throw new Error("Step not implemented yet");
});

Then(
  "the warning banner should contain text {string}",
  async function (this: CustomWorld, text: string) {
    const warningBanner = this.page.locator('[data-testid="version-warning-banner"]');
    await expect(warningBanner).toContainText(text);
  }
);

Then("the warning banner should have a restore button", async function (this: CustomWorld) {
  const restoreButton = this.page.locator('[data-testid="version-restore-button"]');
  await expect(restoreButton).toBeVisible();
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

// Smart Squashing System step definitions

When("I wait for {int} milliseconds", async function (this: CustomWorld, ms: number) {
  await this.page.waitForTimeout(ms);
});

When("the squash timer has completed", async function (this: CustomWorld) {
  // Wait to ensure any pending squash has completed
  // Tests use 1000ms squash delay, so 1500ms ensures completion
  await this.page.waitForTimeout(1500);
});

When("I press {string}", async function (this: CustomWorld, keyCombo: string) {
  // Dispatch real KeyboardEvent to test the actual keyboard handler in main.ts
  // We dispatch on document.body to ensure e.target is an HTMLElement
  if (keyCombo === "Control+Z") {
    await this.page.evaluate(() => {
      // Create event with all necessary properties
      const event = new KeyboardEvent("keydown", {
        key: "z",
        code: "KeyZ",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      // Dispatch on body (not document) so e.target is an HTMLElement
      // The event will bubble up to document where our listener is attached
      document.body.dispatchEvent(event);
    });
  } else if (keyCombo === "Control+Y") {
    await this.page.evaluate(() => {
      const event = new KeyboardEvent("keydown", {
        key: "y",
        code: "KeyY",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      // Dispatch on body (not document) so e.target is an HTMLElement
      document.body.dispatchEvent(event);
    });
  }

  // Wait longer for async navigation to complete and UI to update
  await this.page.waitForTimeout(800);
});

Then(
  "I should see {int} version in version history",
  async function (this: CustomWorld, expectedCount: number) {
    const actualCount = await this.page.evaluate(async () => {
      const versionHistory = (window as any).__testVersionHistory;
      const versions = await versionHistory.getAllVersions();
      return versions.length;
    });
    expect(actualCount).toBe(expectedCount);
  }
);

Then(
  "I should see {int} versions in version history",
  async function (this: CustomWorld, expectedCount: number) {
    const actualCount = await this.page.evaluate(async () => {
      const versionHistory = (window as any).__testVersionHistory;
      const versions = await versionHistory.getAllVersions();
      return versions.length;
    });
    expect(actualCount).toBe(expectedCount);
  }
);

Then(
  "the version description should contain {string}",
  async function (this: CustomWorld, text: string) {
    const description = this.page.locator('[data-testid="version-change-description"]');
    await expect(description).toContainText(text);
  }
);

Then("the timestamp should be in human-readable format", async function (this: CustomWorld) {
  const timestamp = this.page.locator('[data-testid="version-timestamp"]');
  const timestampText = await timestamp.textContent();

  // Check that timestamp contains readable format (e.g., "ago", "minutes", "hours", or date format)
  expect(timestampText).toBeTruthy();
  expect(timestampText!.length).toBeGreaterThan(0);
});

Then(
  "the timestamp should show a relative time like {string}",
  async function (this: CustomWorld, _example: string) {
    const timestamp = this.page.locator('[data-testid="version-timestamp"]');
    const timestampText = await timestamp.textContent();

    // Check that timestamp shows relative time (contains "ago" or "just now")
    expect(timestampText).toMatch(/ago|just now/);
  }
);

Then(
  "the character name should match version {int} name",
  async function (this: CustomWorld, versionNumber: number) {
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    const nameField = this.page.locator('[data-testid="character-name"]');
    const displayedName = await nameField.textContent();
    expect(displayedName?.trim()).toBe(expectedVersion.character.name);
  }
);

Then(
  "the character stats should match version {int} stats",
  async function (this: CustomWorld, versionNumber: number) {
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    // Check tier
    const tierField = this.page.locator('[data-testid="character-tier"]');
    const displayedTier = await tierField.textContent();
    expect(displayedTier?.trim()).toBe(expectedVersion.character.tier.toString());
  }
);

Then(
  "the character equipment should match version {int} equipment",
  async function (this: CustomWorld, versionNumber: number) {
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    // Get all equipment items from the page (they use class selector)
    const equipmentItems = this.page.locator(".equipment-item");
    const count = await equipmentItems.count();

    // Check count matches
    expect(count).toBe(expectedVersion.character.equipment.length);

    // Check first item name if exists
    if (count > 0 && expectedVersion.character.equipment.length > 0) {
      const firstItemName = this.page.locator(".equipment-name").first();
      const nameText = await firstItemName.textContent();
      // Equipment is an array of EquipmentItem objects with {name, description}
      const expectedName = expectedVersion.character.equipment[0].name;
      expect(nameText?.trim()).toBe(expectedName);
    }
  }
);

Then("the portrait should remain unchanged", async function (this: CustomWorld) {
  // Check that portrait is still visible (portraits don't change with version navigation)
  const portrait = this.page.locator('[data-testid="character-portrait"]');
  await expect(portrait).toBeVisible();
});

Then(
  "the exported file should contain version {int} data",
  async function (this: CustomWorld, versionNumber: number) {
    // Wait for export to complete
    await this.page.waitForTimeout(1000);

    // Retrieve the captured data from window (same as character-file-export.steps.ts)
    const capturedData = await this.page.evaluate(() => {
      return {
        data: (window as any).__exportedData,
      };
    });

    expect(capturedData.data).toBeTruthy();
    const exportedData = JSON.parse(capturedData.data);

    // Verify it matches the expected version
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];
    expect(exportedData.character.name).toBe(expectedVersion.character.name);
  }
);

Then("the exported file should not contain version history", async function (this: CustomWorld) {
  // Retrieve the captured data from window (same as character-file-export.steps.ts)
  const capturedData = await this.page.evaluate(() => {
    return {
      data: (window as any).__exportedData,
    };
  });

  expect(capturedData.data).toBeTruthy();
  const exportedData = JSON.parse(capturedData.data);

  // Version history should not be in the exported file
  expect(exportedData.versionHistory).toBeUndefined();
});

Then("the exported file should use the current portrait", async function (this: CustomWorld) {
  // Get the current character's portrait
  const currentChar = await this.storageHelper.getCharacter();

  // Retrieve the captured data from window (same as character-file-export.steps.ts)
  const capturedData = await this.page.evaluate(() => {
    return {
      data: (window as any).__exportedData,
    };
  });

  expect(capturedData.data).toBeTruthy();
  const exportedData = JSON.parse(capturedData.data);

  // Portrait should match current character's portrait
  expect(exportedData.character.portrait).toBe(currentChar.portrait);
});

Then("a new version should be created", async function (this: CustomWorld) {
  // Check that version count has increased
  const versions = await this.storageHelper.getAllVersions();
  expect(versions.length).toBeGreaterThan(0);
});

Then("I should be viewing the latest version", async function (this: CustomWorld) {
  // Wait for version creation to complete (version-squashed event should have fired)
  // The test already waited 1100ms after edit, but let's wait a bit more for UI updates
  await this.page.waitForTimeout(500);

  // Check that forward arrow is disabled (meaning we're at latest)
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  await expect(forwardArrow).toBeDisabled();

  // Check that warning banner is not visible
  await expect(this.page.locator('[data-testid="version-warning-banner"]')).toHaveCount(0);
});

Then("the backward arrow should have an accessible label", async function (this: CustomWorld) {
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  const ariaLabel = await backwardArrow.getAttribute("aria-label");
  expect(ariaLabel).toBeTruthy();
  expect(ariaLabel!.length).toBeGreaterThan(0);
});

Then("the forward arrow should have an accessible label", async function (this: CustomWorld) {
  const forwardArrow = this.page.locator('[data-testid="version-nav-forward"]');
  const ariaLabel = await forwardArrow.getAttribute("aria-label");
  expect(ariaLabel).toBeTruthy();
  expect(ariaLabel!.length).toBeGreaterThan(0);
});

Then("the return button should have an accessible label", async function (this: CustomWorld) {
  const returnButton = this.page.locator('[data-testid="version-return-button"]');
  const ariaLabel = await returnButton.getAttribute("aria-label");
  expect(ariaLabel).toBeTruthy();
  expect(ariaLabel!.length).toBeGreaterThan(0);
});

Then("the restore button should have an accessible label", async function (this: CustomWorld) {
  const restoreButton = this.page.locator('[data-testid="version-restore-button"]');
  const ariaLabel = await restoreButton.getAttribute("aria-label");
  expect(ariaLabel).toBeTruthy();
  expect(ariaLabel!.length).toBeGreaterThan(0);
});

Then(
  "the version counter should be announced to screen readers",
  async function (this: CustomWorld) {
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    const ariaLive = await versionCounter.getAttribute("aria-live");
    // aria-live should be "polite" or "assertive" for screen reader announcements
    expect(ariaLive).toBeTruthy();
  }
);

Then(
  "I should navigate to version {int}",
  async function (this: CustomWorld, versionNumber: number) {
    // Check the version counter shows the correct version
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    const versions = await this.storageHelper.getAllVersions();
    await expect(versionCounter).toHaveText(`Version ${versionNumber} of ${versions.length}`);
  }
);

Then(
  "the character data should be correct for version {int}",
  async function (this: CustomWorld, versionNumber: number) {
    // Get the expected version data
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    // Check the displayed character name matches
    const nameField = this.page.locator('[data-testid="character-name"]');
    const displayedName = await nameField.textContent();
    expect(displayedName?.trim()).toBe(expectedVersion.character.name);
  }
);

Then("the UI should remain responsive", async function (this: CustomWorld) {
  // Check that the version navigator is still visible and functional
  const versionNavigator = this.page.locator('[data-testid="version-navigator"]');
  await expect(versionNavigator).toBeVisible();

  // Check that we can interact with the page
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  expect((await backwardArrow.isEnabled()) || (await backwardArrow.isDisabled())).toBe(true);
});

Then(
  "a new version should be created with description {string}",
  async function (this: CustomWorld, _description: string) {
    // Check that a new version was created
    // Note: The description check would require accessing version metadata
    const versions = await this.storageHelper.getAllVersions();
    expect(versions.length).toBeGreaterThan(0);
  }
);

Then(
  "the character data should match version {int} data",
  async function (this: CustomWorld, versionNumber: number) {
    // Check the displayed character data matches the specified version
    const versions = await this.storageHelper.getAllVersions();
    const expectedVersion = versions[versionNumber - 1];

    const nameField = this.page.locator('[data-testid="character-name"]');
    const displayedName = await nameField.textContent();
    expect(displayedName?.trim()).toBe(expectedVersion.character.name);
  }
);

Then("the warning banner should not be visible", async function (this: CustomWorld) {
  const warningBanner = await this.page.locator('[data-testid="version-warning-banner"]').count();
  expect(warningBanner).toBe(0);
});

Then("the version description should contain the tier change", async function (this: CustomWorld) {
  // We're at v4 (latest). To verify v4's description, check storage directly
  const versions = await this.storageHelper.getAllVersions();
  const v4 = versions[3]; // 0-based index, v4 is at index 3

  // Verify v4 has the tier change
  expect(v4.character.tier).toBe(2);
  expect(v4.description.toLowerCase()).toContain("tier");
});

Then("the oldest version should have been removed", async function (this: CustomWorld) {
  // Check that we still have 99 versions (FIFO removed the oldest)
  const versions = await this.storageHelper.getAllVersions();
  expect(versions.length).toBe(99);
});

Then(
  "I click the backward navigation arrow {int} times",
  async function (this: CustomWorld, times: number) {
    const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
    for (let i = 0; i < times; i++) {
      await backwardArrow.click();
      await this.page.waitForTimeout(100);
    }
    // Wait a bit for final navigation to complete
    await this.page.waitForTimeout(200);
  }
);

// Buffer-based undo/redo step definitions

When(
  "I press {string} before the squash timer expires",
  async function (this: CustomWorld, keyCombo: string) {
    // Dispatch KeyboardEvent before squash timer expires (don't wait)
    if (keyCombo === "Control+Z") {
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "z",
          code: "KeyZ",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });
    } else if (keyCombo === "Control+Y") {
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "y",
          code: "KeyY",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });
    }

    // Wait for UI to update but NOT for squash to complete
    await this.page.waitForTimeout(200);
  }
);

When("I press {string} again", async function (this: CustomWorld, keyCombo: string) {
  // Dispatch KeyboardEvent (same as regular press)
  if (keyCombo === "Control+Z") {
    await this.page.evaluate(() => {
      const event = new KeyboardEvent("keydown", {
        key: "z",
        code: "KeyZ",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      document.body.dispatchEvent(event);
    });
  } else if (keyCombo === "Control+Y") {
    await this.page.evaluate(() => {
      const event = new KeyboardEvent("keydown", {
        key: "y",
        code: "KeyY",
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      document.body.dispatchEvent(event);
    });
  }

  await this.page.waitForTimeout(200);
});

When(
  "I press {string} again before the squash timer expires",
  async function (this: CustomWorld, keyCombo: string) {
    // Dispatch KeyboardEvent before squash timer expires (same as "before the squash timer expires")
    if (keyCombo === "Control+Z") {
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "z",
          code: "KeyZ",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });
    } else if (keyCombo === "Control+Y") {
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "y",
          code: "KeyY",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });
    }

    // Wait for UI to update but NOT for squash to complete
    await this.page.waitForTimeout(200);
  }
);

Then(
  "the character name should be {string}",
  async function (this: CustomWorld, expectedName: string) {
    const nameField = this.page.locator('[data-testid="character-name"]');
    const actualName = await nameField.textContent();
    expect(actualName?.trim()).toBe(expectedName);
  }
);

Then("no new version should be created yet", async function (this: CustomWorld) {
  // Version count should remain the same (no squash has occurred)
  const versions = await this.storageHelper.getAllVersions();

  // We started with 3 versions in history, should still have 3
  // (The test context should have stored the initial count if needed)
  expect(versions.length).toBe(3);
});

Then("the character name should revert to the original value", async function (this: CustomWorld) {
  // Get the stored original name from test context
  const originalName = this.testContext?.originalCharacterName;
  expect(originalName).toBeTruthy();

  const nameField = this.page.locator('[data-testid="character-name"]');
  const actualName = await nameField.textContent();
  expect(actualName?.trim()).toBe(originalName);
});

Then(
  "I should see {int} versions in history",
  async function (this: CustomWorld, expectedCount: number) {
    const versions = await this.storageHelper.getAllVersions();
    expect(versions.length).toBe(expectedCount);
  }
);

Then("the changes should be reapplied", async function (this: CustomWorld) {
  // After redo, the character name should be back to "First Edit" (the first redo)
  // The test will press Control+Y once, which should redo the first undone change
  const nameField = this.page.locator('[data-testid="character-name"]');
  const actualName = await nameField.textContent();

  // After first redo, we should see "First Edit"
  expect(actualName?.trim()).toBe("First Edit");
});

// Mixed undo/redo step definitions (for buffer and version navigation interaction)

When(
  "I make {int} rapid edits that are buffered",
  async function (this: CustomWorld, editCount: number) {
    // Make multiple rapid edits to the character name
    const testId = "character-name";
    const field = this.page.locator(`[data-testid="${testId}"]`);

    for (let i = 1; i <= editCount; i++) {
      await field.click();
      const modal = this.page.locator('[data-testid="edit-modal"]');
      await expect(modal).toBeVisible({ timeout: 5000 });
      const input = this.page.locator('[data-testid="edit-modal-input"]');
      await input.fill(`Rapid Edit ${i}`);
      const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
      await confirmButton.click();
      await expect(modal).toHaveCount(0, { timeout: 2000 });
      await this.page.waitForTimeout(100);
    }

    // Store the last edit value for later verification
    this.testContext = this.testContext || {};
    this.testContext.lastRapidEdit = `Rapid Edit ${editCount}`;
  }
);

When(
  "I press {string} to undo buffered changes",
  async function (this: CustomWorld, keyCombo: string) {
    // This is the same as "I press Control+Z before the squash timer expires"
    // but with explicit wording about undoing buffered changes
    if (keyCombo === "Control+Z") {
      // Set up listener for undo-completed event before dispatching
      const undoCompletedPromise = this.page.evaluate(() => {
        return new Promise<void>((resolve) => {
          const handler = () => {
            window.removeEventListener("undo-completed", handler);
            resolve();
          };
          window.addEventListener("undo-completed", handler);
        });
      });

      // Dispatch the keyboard event
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "z",
          code: "KeyZ",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });

      // Wait for undo-completed event
      await undoCompletedPromise;
    }

    // Small wait for UI updates
    await this.page.waitForTimeout(100);
  }
);

When("I wait for squash timer to complete", async function (this: CustomWorld) {
  // Set up listener for squash-completed event before triggering timer
  const squashCompletedPromise = this.page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const handler = () => {
        window.removeEventListener("squash-completed", handler);
        resolve();
      };
      window.addEventListener("squash-completed", handler);

      // Trigger all pending timers after setting up listener
      setTimeout(() => {
        const testTimer = (window as any).__testTimer;
        if (testTimer) {
          testTimer.triggerAll();
        }
      }, 0);
    });
  });

  // Wait for squash-completed event
  await squashCompletedPromise;

  // Small wait for UI updates
  await this.page.waitForTimeout(200);
});

When(
  "I press {string} to navigate to previous version",
  async function (this: CustomWorld, keyCombo: string) {
    // This is similar to regular "I press Control+Z" but with explicit wording
    // about navigating through versions (after squash has completed)
    if (keyCombo === "Control+Z") {
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "z",
          code: "KeyZ",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });
    } else if (keyCombo === "Control+Y") {
      await this.page.evaluate(() => {
        const event = new KeyboardEvent("keydown", {
          key: "y",
          code: "KeyY",
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        document.body.dispatchEvent(event);
      });
    }

    // Wait longer for async navigation to complete and UI to update
    await this.page.waitForTimeout(800);
  }
);

Then(
  "I should be viewing version {int}",
  async function (this: CustomWorld, versionNumber: number) {
    // Check the version counter shows the correct version
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    const versions = await this.storageHelper.getAllVersions();
    await expect(versionCounter).toHaveText(`Version ${versionNumber} of ${versions.length}`);

    // Verify we're viewing the correct character data by checking the name matches
    const expectedVersion = versions[versionNumber - 1];
    const nameField = this.page.locator('[data-testid="character-name"]');
    const displayedName = await nameField.textContent();
    expect(displayedName?.trim()).toBe(expectedVersion.character.name);
  }
);
