import { expect, type Locator, type Page } from "@playwright/test";
import { assertNoRawI18nKeys } from "./i18nKeys.js";

export type AbilityPart = "cost" | "pool" | "action";

/** How abilities are listed on the sheet. */
export interface AbilitiesDriver {
  expectAbility(name: string): Promise<void>;
  expectPart(name: string, part: AbilityPart, text: string): Promise<void>;
  expectNoPart(name: string, part: AbilityPart): Promise<void>;
  expectPoolStyled(name: string, pool: string): Promise<void>;
  expectEmptyStateTranslated(): Promise<void>;
}

function kebab(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export class PlaywrightAbilitiesDriver implements AbilitiesDriver {
  constructor(private page: Page) {}

  private part(name: string, part: AbilityPart): Locator {
    return this.page.getByTestId(`ability-${part}-${kebab(name)}`);
  }

  async expectAbility(name: string): Promise<void> {
    await expect(this.page.getByTestId(`ability-item-${kebab(name)}`)).toBeVisible();
  }

  async expectPart(name: string, part: AbilityPart, text: string): Promise<void> {
    await expect(this.part(name, part)).toBeVisible();
    await expect(this.part(name, part)).toContainText(text);
  }

  async expectNoPart(name: string, part: AbilityPart): Promise<void> {
    await expect(this.part(name, part)).not.toBeVisible();
  }

  async expectPoolStyled(name: string, pool: string): Promise<void> {
    await expect(this.part(name, "pool").first()).toHaveClass(new RegExp(`pool-${pool}`));
  }

  async expectEmptyStateTranslated(): Promise<void> {
    const emptyState = this.page.getByTestId("empty-abilities");
    await expect(emptyState).not.toBeEmpty();
    await assertNoRawI18nKeys(emptyState);
  }
}
