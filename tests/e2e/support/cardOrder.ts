import type { CardOrderDriver, CardRef } from "./cardOrderDriver.js";
import type { SetupDsl } from "./setup.js";

type MakeItem = (name: string) => unknown;

const ITEM_MAKERS: Record<string, MakeItem> = {
  cyphers: (name) => ({ name, level: "1d6", effect: `Effect of ${name}` }),
  abilities: (name) => ({
    name,
    description: `Description of ${name}`,
    cost: 1,
    pool: "might",
    action: "Action",
  }),
  attacks: (name) => ({ name, damage: 1, modifier: 0, range: "Immediate" }),
  specialAbilities: (name) => ({ name, source: "Type", description: `About ${name}` }),
  equipment: (name) => ({ name, description: `About ${name}` }),
  artifacts: (name) => ({ name, level: "1d6", effect: `Effect of ${name}` }),
  oddities: (name) => name,
};

function maker(collection: string): MakeItem {
  const found = ITEM_MAKERS[collection];
  if (!found) {
    throw new Error(`Unknown collection: ${collection}`);
  }
  return found;
}

export class CardOrderDsl {
  constructor(
    private cards: CardOrderDriver,
    private setup: SetupDsl
  ) {}

  async collectionHolds(collection: string, names: string[]): Promise<void> {
    const make = maker(collection);
    await this.setup.updateCharacter((character) => {
      (character as unknown as Record<string, unknown>)[collection] = names.map(make);
    });
    await this.cards.waitForSection(collection);
  }

  async dragBefore(source: CardRef, target: CardRef): Promise<void> {
    await this.cards.dragOnto(source, target, "before");
  }

  async dragAfter(source: CardRef, target: CardRef): Promise<void> {
    await this.cards.dragOnto(source, target, "after");
  }

  async dragIntoSectionOf(source: CardRef, collection: string): Promise<void> {
    await this.cards.dragIntoSectionOf(source, collection);
  }

  async startDragging(card: CardRef): Promise<void> {
    await this.cards.startDragging(card);
  }

  async hoverOver(card: CardRef): Promise<void> {
    await this.cards.hoverOver(card);
  }

  async expectDragging(card: CardRef): Promise<void> {
    await this.cards.expectDragging(card);
  }

  async expectOrder(collection: string, names: string[]): Promise<void> {
    await this.cards.expectOrder(collection, names);
  }

  async expectVisualOrder(collection: string, names: string[]): Promise<void> {
    await this.cards.expectVisualOrder(collection, names);
  }
}
