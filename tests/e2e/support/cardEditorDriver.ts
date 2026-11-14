import { expect, type Locator, type Page } from "@playwright/test";
import { CARD_CONFIGS } from "./cardTestFixtures.js";

export interface CardEditorDriver {
  startNew(kind: string): Promise<void>;
  startEditing(kind: string, name: string): Promise<void>;
  setField(kind: string, field: string, value: string): Promise<void>;
  save(): Promise<void>;
  cancel(): Promise<void>;
  expectEmptyFields(kind: string): Promise<void>;
  pressTab(times: number): Promise<void>;
  pressShiftTab(times: number): Promise<void>;
  pressEscape(): Promise<void>;
  expectClosed(): Promise<void>;
  expectFocusWithin(): Promise<void>;
  expectFirstFieldFocused(): Promise<void>;
  expectLastControlFocused(): Promise<void>;
  expectFieldFocused(kind: string, field: string): Promise<void>;
}

// What a freshly opened editor holds for fields that do not start blank.
const INITIAL_VALUES: Record<string, Record<string, string>> = {
  attack: { damage: "0", modifier: "0" },
};

// Domain field names that the editor labels differently.
const FIELD_ALIASES: Record<string, Record<string, string>> = {
  oddity: { text: "oddity" },
};

// The controls the app's focus trap cycles through (src/services/focusTrappingBehavior.ts).
const FOCUSABLE_CONTROLS =
  'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export class PlaywrightCardEditorDriver implements CardEditorDriver {
  constructor(private page: Page) {}

  private get editor(): Locator {
    return this.page.getByTestId("card-edit-modal");
  }

  private field(kind: string, field: string): Locator {
    const key = FIELD_ALIASES[kind]?.[field] ?? field;
    const testId = CARD_CONFIGS[kind].fieldTestIds[key];
    if (testId === undefined) throw new Error(`A ${kind} has no field "${field}"`);
    return this.page.locator(testId);
  }

  private async expectOpened(): Promise<void> {
    await expect(this.editor).toBeVisible();
    // The editor moves focus into itself in a deferred call; keyboard input
    // sent before that lands outside the editor.
    await expect(this.editor.locator(":focus")).toHaveCount(1);
  }

  async startNew(kind: string): Promise<void> {
    await this.page.locator(CARD_CONFIGS[kind].addButtonTestId).click();
    await this.expectOpened();
  }

  async startEditing(kind: string, name: string): Promise<void> {
    const config = CARD_CONFIGS[kind];
    const card = this.page.locator(config.itemTestId).filter({ hasText: name });
    await card.locator(`[data-testid^="${config.editButtonPrefix}"]`).click();
    await this.expectOpened();
  }

  async setField(kind: string, field: string, value: string): Promise<void> {
    const input = this.field(kind, field);
    if (field === "pool") {
      await input.selectOption(value.toLowerCase());
    } else {
      await input.fill(value);
    }
  }

  async save(): Promise<void> {
    await this.page.getByTestId("card-modal-confirm").click();
    await expect(this.editor).toBeHidden();
  }

  async cancel(): Promise<void> {
    await this.page.getByTestId("card-modal-cancel").click();
    await expect(this.editor).toBeHidden();
  }

  async expectEmptyFields(kind: string): Promise<void> {
    await expect(this.editor).toBeVisible();
    for (const [field, testId] of Object.entries(CARD_CONFIGS[kind].fieldTestIds)) {
      const input = this.page.locator(testId);
      await expect(input).toBeVisible();
      await expect(input).toHaveValue(INITIAL_VALUES[kind]?.[field] ?? "");
    }
  }

  async pressTab(times: number): Promise<void> {
    for (let i = 0; i < times; i++) await this.page.keyboard.press("Tab");
  }

  async pressShiftTab(times: number): Promise<void> {
    for (let i = 0; i < times; i++) await this.page.keyboard.press("Shift+Tab");
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  async expectClosed(): Promise<void> {
    await expect(this.editor).toBeHidden();
  }

  async expectFocusWithin(): Promise<void> {
    await expect(this.editor.locator(":focus")).toHaveCount(1);
  }

  async expectFirstFieldFocused(): Promise<void> {
    await expect(this.editor.locator(FOCUSABLE_CONTROLS).first()).toBeFocused();
  }

  async expectLastControlFocused(): Promise<void> {
    await expect(this.editor.locator(FOCUSABLE_CONTROLS).last()).toBeFocused();
  }

  async expectFieldFocused(kind: string, field: string): Promise<void> {
    await expect(this.field(kind, field)).toBeFocused();
  }
}
