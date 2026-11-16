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
  sectionTestId: string;
}

const COLLECTIONS: Record<string, CollectionLocators> = {
  cyphers: { itemSelector: '[data-testid="cypher-item"]', sectionTestId: "cyphers-section" },
  abilities: {
    itemSelector: '[data-testid^="ability-item"]',
    sectionTestId: "abilities-section",
  },
  attacks: { itemSelector: '[data-testid="attack-item"]', sectionTestId: "attacks-section" },
  specialAbilities: {
    itemSelector: '[data-testid="special-ability-item"]',
    sectionTestId: "special-abilities-section",
  },
  equipment: { itemSelector: '[data-testid="equipment-item"]', sectionTestId: "items-section" },
  artifacts: { itemSelector: '[data-testid="artifact-item"]', sectionTestId: "items-section" },
  oddities: { itemSelector: '[data-testid="oddity-item"]', sectionTestId: "items-section" },
};

const NEAR_EDGE_PX = 5;
const NEAR_LEFT_PX = 10;

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
    return this.items(collection).filter({ hasText: name });
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
    const items = this.items(collection);
    await expect(items).toHaveCount(names.length);
    for (const [index, name] of names.entries()) {
      await expect(items.nth(index)).toContainText(name);
    }
  }

  async expectVisualOrder(collection: string, names: string[]): Promise<void> {
    const items = this.items(collection);
    await expect(items).toHaveCount(names.length);
    await expect
      .poll(async () => {
        const shown = await items.evaluateAll((els) =>
          els.map((el) => ({
            text: el.textContent ?? "",
            order:
              (el as HTMLElement).style.order === "" ? 0 : Number((el as HTMLElement).style.order),
          }))
        );
        return shown
          .sort((a, b) => a.order - b.order)
          .map(({ text }) => names.find((name) => text.includes(name)));
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
