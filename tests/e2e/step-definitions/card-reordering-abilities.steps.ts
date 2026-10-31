import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { withFullHeightViewport } from "../support/sections.js";

// ============================================================================
// ABILITY SETUP AND DRAG STEPS
// ============================================================================

Given(
  "the character has {int} abilities named {string}",
  async function (this: CustomWorld, count: number, namesList: string) {
    const names = namesList.split(", ").slice(0, count);
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

  await world.setup.updateCharacter((character) => {
    character.abilities = abilities;
  });
  await world.page.waitForSelector('[data-testid="abilities-section"]');
}

When(
  "I drag ability {string} before ability {string}",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const sourceCard = this.page
      .locator(`[data-testid="ability-name-${sourceName}"]`)
      .locator("xpath=ancestor::div[starts-with(@data-testid,'ability-item')]");
    const targetCard = this.page
      .locator(`[data-testid="ability-name-${targetName}"]`)
      .locator("xpath=ancestor::div[starts-with(@data-testid,'ability-item')]");

    // Full-height viewport: on phones the stacked cards don't all fit on screen.
    await withFullHeightViewport(this.page, () =>
      sourceCard.dragTo(targetCard, {
        targetPosition: { x: 10, y: 5 },
      })
    );

    await this.page.waitForTimeout(200);
  }
);

Then(
  "the abilities should be in order {string}",
  async function (this: CustomWorld, namesList: string) {
    const expectedOrder = namesList.split(", ");
    await verifyAbilityOrder(this, expectedOrder);
  }
);

async function verifyAbilityOrder(world: CustomWorld, expectedOrder: string[]): Promise<void> {
  const abilityItems = world.page.locator('[data-testid^="ability-item"]');
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
    const sourceCard = this.page
      .locator(`[data-testid="cypher-name-${cypherName}"]`)
      .locator("xpath=ancestor::div[@data-testid='cypher-item']");
    const abilitiesSection = this.page.locator('[data-testid="abilities-section"]');

    // Attempt to drag cypher into abilities section
    await sourceCard.dragTo(abilitiesSection, {
      targetPosition: { x: 50, y: 50 },
    });

    await this.page.waitForTimeout(200);
  }
);

When(
  "I drag ability {string} onto cypher {string}",
  async function (this: CustomWorld, abilityName: string, cypherName: string) {
    const sourceCard = this.page
      .locator(`[data-testid="ability-name-${abilityName}"]`)
      .locator("xpath=ancestor::div[starts-with(@data-testid,'ability-item')]");
    const targetCard = this.page
      .locator(`[data-testid="cypher-name-${cypherName}"]`)
      .locator("xpath=ancestor::div[@data-testid='cypher-item']");

    // Full-height viewport: on phones the two sections don't both fit on screen.
    await withFullHeightViewport(this.page, () =>
      sourceCard.dragTo(targetCard, {
        targetPosition: { x: 10, y: 5 },
      })
    );

    await this.page.waitForTimeout(200);
  }
);
