import { expect, type Locator, type Page } from "@playwright/test";
import { waitForSaveComplete } from "./save.js";

/**
 * The character type dropdown and the background and notes text fields.
 * A text field is read-only until it is clicked, and saves when it loses focus.
 */
export interface InlineFieldsDriver {
  chooseType(type: string): Promise<void>;
  expectTypeShows(type: string): Promise<void>;
  expectTypeChoices(types: string[]): Promise<void>;
  expectTypeLabelled(label: string): Promise<void>;
  startEditing(field: string): Promise<void>;
  tapToEdit(field: string): Promise<void>;
  type(field: string, text: string): Promise<void>;
  finishEditing(field: string): Promise<void>;
  expectReadOnly(field: string): Promise<void>;
  expectEditable(field: string): Promise<void>;
  expectEditing(field: string): Promise<void>;
  expectLooksClickable(field: string): Promise<void>;
  expectReads(field: string, text: string): Promise<void>;
  expectPlaceholder(field: string, text: string): Promise<void>;
  expectKeyboardRaised(): Promise<void>;
}

const TEXT_FIELD_TEST_IDS: Record<string, string> = {
  background: "character-background",
  notes: "character-notes",
};

// iOS and iPadOS decide whether to raise the on-screen keyboard at the moment
// a field takes focus: a field that is readonly then gets no keyboard, even if
// it turns editable straight after. Headless browsers have no on-screen
// keyboard, so the tap records that precondition for the keyboard check.
interface KeyboardProbeWindow {
  editableWhenFocused?: boolean;
}

export class PlaywrightInlineFieldsDriver implements InlineFieldsDriver {
  private tapped?: string;

  constructor(private page: Page) {}

  private get typeSelect(): Locator {
    return this.page.getByTestId("character-type-select");
  }

  private textField(field: string): Locator {
    return this.page.getByTestId(TEXT_FIELD_TEST_IDS[field]);
  }

  async chooseType(type: string): Promise<void> {
    await this.typeSelect.selectOption(type);
    await expect(this.typeSelect).toHaveValue(type);
    await waitForSaveComplete(this.page);
  }

  async expectTypeShows(type: string): Promise<void> {
    await expect(this.typeSelect).toHaveValue(type);
  }

  async expectTypeChoices(types: string[]): Promise<void> {
    await expect(this.typeSelect.locator("option")).toHaveText(types);
  }

  async expectTypeLabelled(label: string): Promise<void> {
    await expect(this.typeSelect).toHaveAttribute("aria-label", label);
  }

  async startEditing(field: string): Promise<void> {
    await this.textField(field).click();
    await this.expectEditing(field);
  }

  async tapToEdit(field: string): Promise<void> {
    const textarea = this.textField(field);
    await textarea.evaluate((el: HTMLTextAreaElement) => {
      el.addEventListener(
        "focus",
        () => {
          (window as KeyboardProbeWindow).editableWhenFocused = !el.readOnly;
        },
        { once: true }
      );
    });
    this.tapped = field;
    await textarea.tap();
    await this.expectEditing(field);
  }

  async type(field: string, text: string): Promise<void> {
    await this.textField(field).fill(text);
    await expect(this.textField(field)).toHaveValue(text);
  }

  async finishEditing(field: string): Promise<void> {
    await this.textField(field).blur();
    await expect(this.textField(field)).toHaveAttribute("readonly", "");
    await waitForSaveComplete(this.page);
  }

  async expectReadOnly(field: string): Promise<void> {
    await expect(this.textField(field)).toHaveAttribute("readonly", "");
  }

  async expectEditable(field: string): Promise<void> {
    const textarea = this.textField(field);
    await expect(textarea).not.toHaveAttribute("readonly", { timeout: 10000 });
    await expect(textarea).toBeEnabled();
  }

  async expectEditing(field: string): Promise<void> {
    await this.expectEditable(field);
    await expect(this.textField(field)).toBeFocused();
  }

  async expectLooksClickable(field: string): Promise<void> {
    await expect(this.textField(field)).toHaveCSS("cursor", "pointer");
  }

  async expectReads(field: string, text: string): Promise<void> {
    await expect(this.textField(field)).toHaveValue(text);
  }

  async expectPlaceholder(field: string, text: string): Promise<void> {
    await expect(this.textField(field)).toHaveAttribute("placeholder", text);
  }

  async expectKeyboardRaised(): Promise<void> {
    if (!this.tapped) throw new Error("No text field was tapped before checking the keyboard");
    await expect(this.textField(this.tapped)).toBeFocused();
    const editableWhenFocused = await this.page.evaluate(
      () => (window as KeyboardProbeWindow).editableWhenFocused
    );
    expect(
      editableWhenFocused,
      `the ${this.tapped} field was readonly when the tap focused it, so iOS shows no keyboard`
    ).toBe(true);
  }
}
