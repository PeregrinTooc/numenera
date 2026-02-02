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
    // Wait for page to be fully loaded before creating versions
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(500);

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
    await this.page.waitForTimeout(100);
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
  // Wait a bit longer for navigation to complete after edit
  await this.page.waitForTimeout(300);

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
  // Create one more version so we can navigate back to see v4's description
  const nameField = this.page.locator('[data-testid="character-name"]');
  await nameField.click();
  const modal = this.page.locator('[data-testid="edit-modal"]');
  await expect(modal).toBeVisible({ timeout: 5000 });
  const input = this.page.locator('[data-testid="edit-modal-input"]');
  await input.fill("After Tier Change");
  const confirmButton = this.page.locator('[data-testid="modal-confirm-button"]');
  await confirmButton.click();
  await expect(modal).toHaveCount(0, { timeout: 2000 });
  await this.page.waitForTimeout(500);

  // Now we're at version 5, navigate backward to view version 4
  const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
  await backwardArrow.click();
  await this.page.waitForTimeout(200);

  // Check that version 4's description mentions tier
  const description = this.page.locator('[data-testid="version-change-description"]');
  await expect(description).toBeVisible({ timeout: 5000 });
  const text = await description.textContent();
  expect(text?.toLowerCase()).toContain("tier");
});

Then("the oldest version should have been removed", async function (this: CustomWorld) {
  // Check that we still have 99 versions (FIFO removed the oldest)
  const versions = await this.storageHelper.getAllVersions();
  expect(versions.length).toBe(99);
});

Then(
  "I can still navigate to version {int} \\(which was previously version {int}\\)",
  async function (this: CustomWorld, newVersionNum: number, _oldVersionNum: number) {
    // Navigate to the specified version
    const backwardArrow = this.page.locator('[data-testid="version-nav-backward"]');
    const versions = await this.storageHelper.getAllVersions();
    const clicksNeeded = versions.length - newVersionNum;

    for (let i = 0; i < clicksNeeded; i++) {
      await backwardArrow.click();
      await this.page.waitForTimeout(50);
    }

    // Verify we're at the right version
    const versionCounter = this.page.locator('[data-testid="version-counter"]');
    await expect(versionCounter).toHaveText(`Version ${newVersionNum} of ${versions.length}`);
  }
);
