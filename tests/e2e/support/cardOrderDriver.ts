import { expect, type Locator, type Page } from "@playwright/test";
import type { ViewportDriver } from "./viewportDriver.js";

export interface CardRef {
  collection: string;
  name: string;
}

export type DropEdge = "before" | "after";

/** How cards are dragged around and listed on the sheet. */
export interface CardOrderDriver {
  waitForSection(collection: string): Promise<void>;
  dragOnto(source: CardRef, target: CardRef, edge: DropEdge): Promise<void>;
  dragIntoSectionOf(source: CardRef, collection: string): Promise<void>;
  startDragging(card: CardRef): Promise<void>;
  hoverOver(card: CardRef): Promise<void>;
  expectDragging(card: CardRef): Promise<void>;
  expectOrder(collection: string, names: string[]): Promise<void>;
  expectVisualOrder(collection: string, names: string[]): Promise<void>;
}

interface CollectionLocators {
  itemSelector: string;
  nameSelector: string;
  sectionTestId: string;
}

const COLLECTIONS: Record<string, CollectionLocators> = {
  cyphers: {
    itemSelector: '[data-testid="cypher-item"]',
    nameSelector: '[data-testid^="cypher-name-"]',
    sectionTestId: "cyphers-section",
  },
  abilities: {
    itemSelector: '[data-testid^="ability-item"]',
    nameSelector: '[data-testid^="ability-name-"]',
    sectionTestId: "abilities-section",
  },
  attacks: {
    itemSelector: '[data-testid="attack-item"]',
    nameSelector: '[data-testid^="attack-name-"]',
    sectionTestId: "attacks-section",
  },
  specialAbilities: {
    itemSelector: '[data-testid="special-ability-item"]',
    nameSelector: '[data-testid^="special-ability-name-"]',
    sectionTestId: "special-abilities-section",
  },
  equipment: {
    itemSelector: '[data-testid="equipment-item"]',
    nameSelector: ".equipment-name",
    sectionTestId: "items-section",
  },
  artifacts: {
    itemSelector: '[data-testid="artifact-item"]',
    nameSelector: '[data-testid^="artifact-name-"]',
    sectionTestId: "items-section",
  },
  oddities: {
    itemSelector: '[data-testid="oddity-item"]',
    nameSelector: ".oddity-text",
    sectionTestId: "items-section",
  },
};

const NEAR_EDGE_PX = 5;
const NEAR_LEFT_PX = 10;

/** The whole name, ignoring decoration around it such as an icon. */
function exactly(name: string): RegExp {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^\\W*${escaped}\\W*$`);
}

function locators(collection: string): CollectionLocators {
  const found = COLLECTIONS[collection];
  if (!found) {
    throw new Error(`Unknown collection: ${collection}`);
  }
  return found;
}

export class PlaywrightCardOrderDriver implements CardOrderDriver {
  constructor(
    private page: Page,
    private viewport: ViewportDriver
  ) {}

  private items(collection: string): Locator {
    return this.page.locator(locators(collection).itemSelector);
  }

  private card({ collection, name }: CardRef): Locator {
    const hasName = this.page.locator(locators(collection).nameSelector, {
      hasText: exactly(name),
    });
    return this.items(collection).filter({ has: hasName });
  }

  async waitForSection(collection: string): Promise<void> {
    await this.page.getByTestId(locators(collection).sectionTestId).waitFor();
  }

  async dragOnto(source: CardRef, target: CardRef, edge: DropEdge): Promise<void> {
    const sourceCard = this.card(source);
    const targetCard = this.card(target);
    // Full-height viewport: on phones the stacked cards don't all fit on screen.
    await this.viewport.withFullHeight(async () => {
      await sourceCard.dragTo(targetCard, { targetPosition: await dropPoint(targetCard, edge) });
    });
    await expect(sourceCard).not.toHaveAttribute("data-dragging", "true");
  }

  async dragIntoSectionOf(source: CardRef, collection: string): Promise<void> {
    const sourceCard = this.card(source);
    await sourceCard.dragTo(this.page.getByTestId(locators(collection).sectionTestId), {
      targetPosition: { x: 50, y: 50 },
    });
    await expect(sourceCard).not.toHaveAttribute("data-dragging", "true");
  }

  // mouse.down() does not trigger HTML5 drag events, so they are dispatched from within the page.
  async startDragging(card: CardRef): Promise<void> {
    await this.card(card).evaluate((el) => {
      el.dispatchEvent(
        new DragEvent("dragstart", {
          bubbles: true,
          cancelable: true,
          // eslint-disable-next-line no-undef
          dataTransfer: new DataTransfer(),
        })
      );
    });
  }

  async hoverOver(card: CardRef): Promise<void> {
    await this.card(card).evaluate((el) => {
      el.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
    });
  }

  async expectDragging(card: CardRef): Promise<void> {
    await expect(this.card(card)).toHaveAttribute("data-dragging", "true");
  }

  async expectOrder(collection: string, names: string[]): Promise<void> {
    const shownNames = this.items(collection).locator(locators(collection).nameSelector);
    await expect(shownNames).toHaveText(names.map(exactly));
  }

  async expectVisualOrder(collection: string, names: string[]): Promise<void> {
    const { nameSelector } = locators(collection);
    const items = this.items(collection);
    await expect(items).toHaveCount(names.length);
    await expect
      .poll(async () => {
        const shown = await items.evaluateAll(
          (els, selector) =>
            els.map((el) => ({
              name: el.querySelector(selector)?.textContent ?? "",
              order:
                (el as HTMLElement).style.order === ""
                  ? 0
                  : Number((el as HTMLElement).style.order),
            })),
          nameSelector
        );
        return shown
          .sort((a, b) => a.order - b.order)
          .map(({ name }) => name.replace(/^\W+|\W+$/g, ""));
      })
      .toEqual(names);
  }
}

async function dropPoint(card: Locator, edge: DropEdge): Promise<{ x: number; y: number }> {
  if (edge === "before") {
    return { x: NEAR_LEFT_PX, y: NEAR_EDGE_PX };
  }
  const box = await card.boundingBox();
  if (!box) {
    throw new Error("Could not find the card to drop onto");
  }
  return { x: box.width / 2, y: box.height - NEAR_EDGE_PX };
}
