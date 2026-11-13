import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { withFullHeightViewport } from "../support/sections.js";

Given(
  "the character has {int} cyphers named {string}",
  async function (this: CustomWorld, count: number, namesList: string) {
    const names = namesList.split(", ").slice(0, count);
    await setupCyphersWithNames(this, names);
  }
);

async function setupCyphersWithNames(world: CustomWorld, names: string[]): Promise<void> {
  const cyphers = names.map((name) => ({ name, level: "1d6", effect: `Effect of ${name}` }));
  await world.setup.updateCharacter((character) => {
    character.cyphers = cyphers;
  });
  await world.page.waitForSelector('[data-testid="cyphers-section"]');
}

When(
  "I drag cypher {string} before cypher {string}",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const sourceCard = this.page
      .locator(`[data-testid="cypher-name-${sourceName}"]`)
      .locator("xpath=ancestor::div[@data-testid='cypher-item']");
    const targetCard = this.page
      .locator(`[data-testid="cypher-name-${targetName}"]`)
      .locator("xpath=ancestor::div[@data-testid='cypher-item']");

    // Full-height viewport: on phones the stacked cards don't all fit on screen.
    await withFullHeightViewport(this.page, () =>
      sourceCard.dragTo(targetCard, {
        targetPosition: { x: 10, y: 5 }, // Drop near top of target
      })
    );
    await expect(sourceCard).not.toHaveAttribute("data-dragging", "true");
  }
);

When(
  "I drag cypher {string} after cypher {string}",
  async function (this: CustomWorld, sourceName: string, targetName: string) {
    const sourceCard = this.page
      .locator(`[data-testid="cypher-name-${sourceName}"]`)
      .locator("xpath=ancestor::div[@data-testid='cypher-item']");
    const targetCard = this.page
      .locator(`[data-testid="cypher-name-${targetName}"]`)
      .locator("xpath=ancestor::div[@data-testid='cypher-item']");

    // Full-height viewport: on phones the stacked cards don't all fit on screen.
    await withFullHeightViewport(this.page, async () => {
      const targetBBox = await targetCard.boundingBox();
      if (!targetBBox) {
        throw new Error(`Could not find cypher card: ${targetName}`);
      }

      await sourceCard.dragTo(targetCard, {
        targetPosition: { x: targetBBox.width / 2, y: targetBBox.height - 5 },
      });
    });
    await expect(sourceCard).not.toHaveAttribute("data-dragging", "true");
  }
);

When("I start dragging cypher {string}", async function (this: CustomWorld, cypherName: string) {
  const cypherCard = this.page
    .locator(`[data-testid="cypher-name-${cypherName}"]`)
    .locator("xpath=ancestor::div[@data-testid='cypher-item']");

  const bbox = await cypherCard.boundingBox();
  if (!bbox) {
    throw new Error(`Could not find cypher card: ${cypherName}`);
  }

  this.draggedCypherName = cypherName;

  // Dispatch dragstart event from within the browser context
  // This is needed because mouse.down() doesn't trigger HTML5 drag events
  await cypherCard.evaluate((el) => {
    const event = new DragEvent("dragstart", {
      bubbles: true,
      cancelable: true,
      // eslint-disable-next-line no-undef
      dataTransfer: new DataTransfer(),
    });
    el.dispatchEvent(event);
  });
});

When("I hover over cypher {string}", async function (this: CustomWorld, cypherName: string) {
  const cypherCard = this.page
    .locator(`[data-testid="cypher-name-${cypherName}"]`)
    .locator("xpath=ancestor::div[@data-testid='cypher-item']");

  const bbox = await cypherCard.boundingBox();
  if (!bbox) {
    throw new Error(`Could not find cypher card: ${cypherName}`);
  }

  await cypherCard.evaluate((el) => {
    const event = new DragEvent("dragover", {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(event);
  });
});

Then(
  "the cyphers should be in order {string}",
  async function (this: CustomWorld, namesList: string) {
    const expectedOrder = namesList.split(", ");
    await verifyCypherOrder(this, expectedOrder);
  }
);

async function verifyCypherOrder(world: CustomWorld, expectedOrder: string[]): Promise<void> {
  const cypherNames = world.page.locator(
    '[data-testid="cypher-item"] [data-testid^="cypher-name-"]'
  );
  await expect(cypherNames).toHaveText(
    expectedOrder.map((name) => new RegExp(`^\\W*${name}\\W*$`))
  );
}

Then(
  "the cypher {string} should have a dragging visual state",
  async function (this: CustomWorld, cypherName: string) {
    const cypherCard = this.page
      .locator(`[data-testid="cypher-name-${cypherName}"]`)
      .locator("xpath=ancestor::div[@data-testid='cypher-item']");

    await expect(cypherCard).toHaveAttribute("data-dragging", "true");
  }
);

Then(
  "the cyphers should be visually in order {string}, {string}, {string}",
  async function (this: CustomWorld, name1: string, name2: string, name3: string) {
    const expectedOrder = [name1, name2, name3];
    await verifyVisualCypherOrder(this, expectedOrder);
  }
);

async function verifyVisualCypherOrder(world: CustomWorld, expectedOrder: string[]): Promise<void> {
  const cypherItems = world.page.locator('[data-testid="cypher-item"]');
  await expect(cypherItems).toHaveCount(expectedOrder.length);

  await expect
    .poll(async () => {
      const items = await cypherItems.evaluateAll((els) =>
        els.map((el) => ({
          name: (el.querySelector('[data-testid^="cypher-name-"]')?.textContent ?? "")
            .replace("⚡", "")
            .trim(),
          order:
            (el as HTMLElement).style.order === ""
              ? 0
              : parseInt((el as HTMLElement).style.order, 10),
        }))
      );
      return items.sort((a, b) => a.order - b.order).map((item) => item.name);
    })
    .toEqual(expectedOrder);
}
