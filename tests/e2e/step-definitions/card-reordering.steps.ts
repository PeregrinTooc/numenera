import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";

// ============================================================================
// SETUP STEPS - Create cyphers for testing
// ============================================================================

Given(
  "the character has {int} cyphers named {string}, {string}, {string}",
  async function (this: CustomWorld, count: number, name1: string, name2: string, name3: string) {
    const names = [name1, name2, name3].slice(0, count);
    await setupCyphersWithNames(this, names);
  }
);

Given(
  "the character has {int} cyphers named {string}, {string}",
  async function (this: CustomWorld, count: number, name1: string, name2: string) {
    const names = [name1, name2].slice(0, count);
    await setupCyphersWithNames(this, names);
  }
);

async function setupCyphersWithNames(world: CustomWorld, names: string[]): Promise<void> {
  // Create cyphers with specific names
  const cyphers = names.map((name) => ({
    name,
    level: "1d6",
    effect: `Effect of ${name}`,
  }));

  // Use TestStorageHelper to interact with the app's actual storage (IndexedDB)
  // Get current character state and update cyphers
  const character = await world.storageHelper!.getCharacter();
  if (character) {
    character.cyphers = cyphers;
    await world.storageHelper!.setCharacter(character);
  }

  // Reload page to reflect changes
  await world.page!.reload();
  await world.page!.waitForLoadState("domcontentloaded");
  await world.page!.waitForSelector('[data-testid="cyphers-section"]');
}

// ============================================================================
// DRAG ACTION STEPS
// ============================================================================

When(
  "I drag cypher {string} before cypher {string}",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const sourceCard = this.page!.locator(`[data-testid="cypher-name-${sourceName}"]`).locator(
      "xpath=ancestor::div[@data-testid='cypher-item']"
    );
    const targetCard = this.page!.locator(`[data-testid="cypher-name-${targetName}"]`).locator(
      "xpath=ancestor::div[@data-testid='cypher-item']"
    );

    // Use Playwright's dragTo method which properly triggers HTML5 drag events
    await sourceCard.dragTo(targetCard, {
      targetPosition: { x: 10, y: 5 }, // Drop near top of target
    });

    // Wait for DOM update after reorder
    await this.page!.waitForTimeout(200);
  }
);

When(
  "I drag cypher {string} after cypher {string}",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const sourceCard = this.page!.locator(`[data-testid="cypher-name-${sourceName}"]`).locator(
      "xpath=ancestor::div[@data-testid='cypher-item']"
    );
    const targetCard = this.page!.locator(`[data-testid="cypher-name-${targetName}"]`).locator(
      "xpath=ancestor::div[@data-testid='cypher-item']"
    );

    // Get target bounding box to calculate bottom position
    const targetBBox = await targetCard.boundingBox();
    if (!targetBBox) {
      throw new Error(`Could not find cypher card: ${targetName}`);
    }

    // Use Playwright's dragTo method - drop at bottom of target
    await sourceCard.dragTo(targetCard, {
      targetPosition: { x: targetBBox.width / 2, y: targetBBox.height - 5 },
    });

    // Wait for DOM update after reorder
    await this.page!.waitForTimeout(200);
  }
);

When("I start dragging cypher {string}", async function (this: CustomWorld, cypherName: string) {
  const cypherCard = this.page!.locator(`[data-testid="cypher-name-${cypherName}"]`).locator(
    "xpath=ancestor::div[@data-testid='cypher-item']"
  );

  const bbox = await cypherCard.boundingBox();
  if (!bbox) {
    throw new Error(`Could not find cypher card: ${cypherName}`);
  }

  // Store the dragged card name for subsequent steps
  (this as any).draggedCypherName = cypherName;

  // Dispatch dragstart event from within the browser context
  // This is needed because mouse.down() doesn't trigger HTML5 drag events
  await cypherCard.evaluate((el) => {
    // eslint-disable-next-line no-undef
    const event = new DragEvent("dragstart", {
      bubbles: true,
      cancelable: true,
      // eslint-disable-next-line no-undef
      dataTransfer: new DataTransfer(),
    });
    el.dispatchEvent(event);
  });

  // Wait for drag state to be applied
  await this.page!.waitForTimeout(100);
});

When("I hover over cypher {string}", async function (this: CustomWorld, cypherName: string) {
  const cypherCard = this.page!.locator(`[data-testid="cypher-name-${cypherName}"]`).locator(
    "xpath=ancestor::div[@data-testid='cypher-item']"
  );

  const bbox = await cypherCard.boundingBox();
  if (!bbox) {
    throw new Error(`Could not find cypher card: ${cypherName}`);
  }

  // Dispatch dragover event from within the browser context
  await cypherCard.evaluate((el) => {
    // eslint-disable-next-line no-undef
    const event = new DragEvent("dragover", {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(event);
  });

  // Wait for visual reorder
  await this.page!.waitForTimeout(200);
});

// ============================================================================
// ASSERTION STEPS
// ============================================================================

Then(
  "the cyphers should be in order {string}, {string}, {string}",
  async function (this: CustomWorld, name1: string, name2: string, name3: string) {
    const expectedOrder = [name1, name2, name3];
    await verifyCypherOrder(this, expectedOrder);
  }
);

Then(
  "the cyphers should be in order {string}, {string}",
  async function (this: CustomWorld, name1: string, name2: string) {
    const expectedOrder = [name1, name2];
    await verifyCypherOrder(this, expectedOrder);
  }
);

async function verifyCypherOrder(world: CustomWorld, expectedOrder: string[]): Promise<void> {
  const cypherItems = world.page!.locator('[data-testid="cypher-item"]');
  const count = await cypherItems.count();

  expect(count).toBe(expectedOrder.length);

  for (let i = 0; i < expectedOrder.length; i++) {
    const cypherName = cypherItems.nth(i).locator('[data-testid^="cypher-name-"]');
    const nameText = await cypherName.textContent();
    // Remove the emoji prefix (⚡)
    const cleanName = nameText?.replace("⚡", "").trim();
    expect(cleanName).toBe(expectedOrder[i]);
  }
}

// ============================================================================
// VISUAL FEEDBACK STEPS
// ============================================================================

Then(
  "the cypher {string} should have a dragging visual state",
  async function (this: CustomWorld, cypherName: string) {
    const cypherCard = this.page!.locator(`[data-testid="cypher-name-${cypherName}"]`).locator(
      "xpath=ancestor::div[@data-testid='cypher-item']"
    );

    // Check for dragging class or visual state
    const hasDraggingClass = await cypherCard.evaluate((el) => {
      return (
        el.classList.contains("dragging") ||
        el.classList.contains("is-dragging") ||
        el.getAttribute("data-dragging") === "true"
      );
    });

    expect(hasDraggingClass).toBe(true);
  }
);

Then("I should see drop zone indicators", async function (this: CustomWorld) {
  const dropZones = this.page!.locator('[data-testid="drop-zone"]');
  const count = await dropZones.count();
  expect(count).toBeGreaterThan(0);
});

Then(
  "the cyphers should be visually in order {string}, {string}, {string}",
  async function (this: CustomWorld, name1: string, name2: string, name3: string) {
    const expectedOrder = [name1, name2, name3];
    await verifyVisualCypherOrder(this, expectedOrder);
  }
);

async function verifyVisualCypherOrder(world: CustomWorld, expectedOrder: string[]): Promise<void> {
  const cypherItems = world.page!.locator('[data-testid="cypher-item"]');
  const count = await cypherItems.count();

  expect(count).toBe(expectedOrder.length);

  // Get all items with their names and CSS order values
  const itemsWithOrder: { name: string; order: number }[] = [];
  for (let i = 0; i < count; i++) {
    const item = cypherItems.nth(i);
    const cypherName = item.locator('[data-testid^="cypher-name-"]');
    const nameText = await cypherName.textContent();
    const cleanName = nameText?.replace("⚡", "").trim() || "";

    // Get CSS order value (empty string means 0)
    const orderValue = await item.evaluate((el) => {
      const order = (el as HTMLElement).style.order;
      return order === "" ? 0 : parseInt(order, 10);
    });

    itemsWithOrder.push({ name: cleanName, order: orderValue });
  }

  // Sort by CSS order to get visual order
  itemsWithOrder.sort((a, b) => a.order - b.order);

  // Verify visual order matches expected
  for (let i = 0; i < expectedOrder.length; i++) {
    expect(itemsWithOrder[i].name).toBe(expectedOrder[i]);
  }
}

// ============================================================================
// ABILITY SETUP AND DRAG STEPS
// ============================================================================

Given(
  "the character has {int} abilities named {string}, {string}, {string}",
  async function (this: CustomWorld, count: number, name1: string, name2: string, name3: string) {
    const names = [name1, name2, name3].slice(0, count);
    await setupAbilitiesWithNames(this, names);
  }
);

Given(
  "the character has {int} abilities named {string}, {string}",
  async function (this: CustomWorld, count: number, name1: string, name2: string) {
    const names = [name1, name2].slice(0, count);
    await setupAbilitiesWithNames(this, names);
  }
);

async function setupAbilitiesWithNames(world: CustomWorld, names: string[]): Promise<void> {
  const abilities = names.map((name) => ({
    name,
    description: `Description of ${name}`,
    cost: 1,
    pool: "might" as const,
    action: "Action",
  }));

  const character = await world.storageHelper!.getCharacter();
  if (character) {
    character.abilities = abilities;
    await world.storageHelper!.setCharacter(character);
  }

  await world.page!.reload();
  await world.page!.waitForLoadState("domcontentloaded");
  await world.page!.waitForSelector('[data-testid="abilities-section"]');
}

When(
  "I drag ability {string} before ability {string}",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const sourceCard = this.page!.locator(`[data-testid="ability-name-${sourceName}"]`).locator(
      "xpath=ancestor::div[starts-with(@data-testid,'ability-item')]"
    );
    const targetCard = this.page!.locator(`[data-testid="ability-name-${targetName}"]`).locator(
      "xpath=ancestor::div[starts-with(@data-testid,'ability-item')]"
    );

    await sourceCard.dragTo(targetCard, {
      targetPosition: { x: 10, y: 5 },
    });

    await this.page!.waitForTimeout(200);
  }
);

Then(
  "the abilities should be in order {string}, {string}, {string}",
  async function (this: CustomWorld, name1: string, name2: string, name3: string) {
    const expectedOrder = [name1, name2, name3];
    await verifyAbilityOrder(this, expectedOrder);
  }
);

Then(
  "the abilities should be in order {string}, {string}",
  async function (this: CustomWorld, name1: string, name2: string) {
    const expectedOrder = [name1, name2];
    await verifyAbilityOrder(this, expectedOrder);
  }
);

async function verifyAbilityOrder(world: CustomWorld, expectedOrder: string[]): Promise<void> {
  const abilityItems = world.page!.locator('[data-testid^="ability-item"]');
  const count = await abilityItems.count();

  expect(count).toBe(expectedOrder.length);

  for (let i = 0; i < expectedOrder.length; i++) {
    const abilityName = abilityItems.nth(i).locator('[data-testid^="ability-name-"]');
    const nameText = await abilityName.textContent();
    expect(nameText?.trim()).toBe(expectedOrder[i]);
  }
}

// ============================================================================
// CROSS-SECTION DRAG PREVENTION
// ============================================================================

When(
  "I drag cypher {string} into the abilities section",
  async function (this: CustomWorld, cypherName: string) {
    const sourceCard = this.page!.locator(`[data-testid="cypher-name-${cypherName}"]`).locator(
      "xpath=ancestor::div[@data-testid='cypher-item']"
    );
    const abilitiesSection = this.page!.locator('[data-testid="abilities-section"]');

    // Attempt to drag cypher into abilities section
    await sourceCard.dragTo(abilitiesSection, {
      targetPosition: { x: 50, y: 50 },
    });

    await this.page!.waitForTimeout(200);
  }
);
