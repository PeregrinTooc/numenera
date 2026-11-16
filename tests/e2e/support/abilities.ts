import type { AbilitiesDriver } from "./abilitiesDriver.js";
import type { SetupDsl } from "./setup.js";
import type { CharacterDsl } from "./character.js";

export interface AbilityPool {
  name: string;
  pool: string;
}

export class AbilitiesDsl {
  constructor(
    private abilities: AbilitiesDriver,
    private character: CharacterDsl,
    private setup: SetupDsl
  ) {}

  async hasAbility(name: string, properties: Record<string, string>): Promise<void> {
    const lowerCased = Object.fromEntries(
      Object.entries(properties).map(([property, value]) => [property.toLowerCase(), value])
    );
    await this.character.hasEntry("ability", name, lowerCased);
  }

  async hasAbilitiesWithPools(rows: AbilityPool[]): Promise<void> {
    await this.setup.newCharacter({ abilities: rows });
  }

  async expectAbility(name: string): Promise<void> {
    await this.abilities.expectAbility(name);
  }

  async expectCost(name: string, cost: string): Promise<void> {
    await this.abilities.expectPart(name, "cost", cost);
  }

  async expectPool(name: string, pool: string): Promise<void> {
    await this.abilities.expectPart(name, "pool", pool);
  }

  async expectAction(name: string, action: string): Promise<void> {
    await this.abilities.expectPart(name, "action", action);
  }

  async expectNoCost(name: string): Promise<void> {
    await this.abilities.expectNoPart(name, "cost");
  }

  async expectNoPool(name: string): Promise<void> {
    await this.abilities.expectNoPart(name, "pool");
  }

  async expectNoAction(name: string): Promise<void> {
    await this.abilities.expectNoPart(name, "action");
  }

  async expectPoolStyled(name: string, pool: string): Promise<void> {
    await this.abilities.expectPoolStyled(name, pool);
  }

  async expectEmptyStateTranslated(): Promise<void> {
    await this.abilities.expectEmptyStateTranslated();
  }
}
