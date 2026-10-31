import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import type { CustomWorld } from "../support/world";
import { withFullHeightViewport } from "../support/sections.js";

interface CollectionSpec {
  itemTestId: string;
  sectionTestId: string;
  makeItem: (name: string) => unknown;
}

const COLLECTIONS: Record<string, CollectionSpec> = {
  attacks: {
    itemTestId: "attack-item",
    sectionTestId: "attacks-section",
    makeItem: (name) => ({ name, damage: 1, modifier: 0, range: "Immediate" }),
  },
  specialAbilities: {
    itemTestId: "special-ability-item",
    sectionTestId: "special-abilities-section",
    makeItem: (name) => ({ name, source: "Type", description: `About ${name}` }),
  },
  equipment: {
    itemTestId: "equipment-item",
    sectionTestId: "items-section",
    makeItem: (name) => ({ name, description: `About ${name}` }),
  },
  artifacts: {
    itemTestId: "artifact-item",
    sectionTestId: "items-section",
    makeItem: (name) => ({ name, level: "1d6", effect: `Effect of ${name}` }),
  },
  oddities: {
    itemTestId: "oddity-item",
    sectionTestId: "items-section",
    makeItem: (name) => name,
  },
};

function spec(collection: string): CollectionSpec {
  const found = COLLECTIONS[collection];
  if (!found) {
    throw new Error(`Unknown collection: ${collection}`);
  }
  return found;
}

function card(world: CustomWorld, collection: string, name: string): Locator {
  return world.page
    .locator(`[data-testid="${spec(collection).itemTestId}"]`)
    .filter({ hasText: name });
}

Given(
  "the {string} collection holds {string}",
  async function (this: CustomWorld, collection: string, namesList: string) {
    const { makeItem, sectionTestId } = spec(collection);
    const items = namesList.split(", ").map(makeItem);
    await this.setup.updateCharacter((character) => {
      (character as unknown as Record<string, unknown>)[collection] = items;
    });
    await this.page.waitForSelector(`[data-testid="${sectionTestId}"]`);
  }
);

When(
  "I drag {string} before {string} in the {string} collection",
  async function (this: CustomWorld, source: string, target: string, collection: string) {
    // Full-height viewport: on phones the stacked cards do not all fit on screen.
    await withFullHeightViewport(this.page, () =>
      card(this, collection, source).dragTo(card(this, collection, target), {
        targetPosition: { x: 10, y: 5 },
      })
    );
    await this.page.waitForTimeout(200);
  }
);

When(
  "I drag {string} after {string} in the {string} collection",
  async function (this: CustomWorld, source: string, target: string, collection: string) {
    const targetCard = card(this, collection, target);
    await withFullHeightViewport(this.page, async () => {
      const box = await targetCard.boundingBox();
      if (!box) {
        throw new Error(`Could not find card: ${target}`);
      }
      await card(this, collection, source).dragTo(targetCard, {
        targetPosition: { x: box.width / 2, y: box.height - 5 },
      });
    });
    await this.page.waitForTimeout(200);
  }
);

Then(
  "the {string} collection should be in order {string}",
  async function (this: CustomWorld, collection: string, namesList: string) {
    const expected = namesList.split(", ");
    const items = this.page.locator(`[data-testid="${spec(collection).itemTestId}"]`);
    await expect(items).toHaveCount(expected.length);
    for (let i = 0; i < expected.length; i++) {
      await expect(items.nth(i)).toContainText(expected[i]);
    }
  }
);
