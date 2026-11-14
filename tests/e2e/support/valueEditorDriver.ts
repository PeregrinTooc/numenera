import { expect, type Locator, type Page } from "@playwright/test";
import { getTestId } from "./fields.js";
import { waitForSaveComplete } from "./save.js";

/** The small editor that opens over the sheet to change a single value. */
export interface ValueEditorDriver {
  open(valueName: string): Promise<void>;
  setValue(value: string): Promise<void>;
  confirm(): Promise<void>;
  confirmWithEnter(): Promise<void>;
  cancel(): Promise<void>;
  dismissWithEscape(): Promise<void>;
  expectOpenShowing(value: string): Promise<void>;
  expectInputFocused(): Promise<void>;
  expectClosed(): Promise<void>;
  expectStillOpen(): Promise<void>;
  expectCannotConfirm(): Promise<void>;
  expectExplanation(): Promise<void>;
  dismissByClickingOutside(): Promise<void>;
  expectFocusStaysInside(): Promise<void>;
  expectNumericKeypad(): Promise<void>;
  expectButtonsHaveIcons(): Promise<void>;
  expectSheetDimmed(): Promise<void>;
  expectDialogSemantics(): Promise<void>;
  expectFitsScreen(): Promise<void>;
  expectTouchFriendlyControls(): Promise<void>;
  expectValueLooksClickable(valueName: string): Promise<void>;
  expectValueTouchFriendly(valueName: string): Promise<void>;
}

const TOUCH_TARGET_MIN_PX = 44;

export class PlaywrightValueEditorDriver implements ValueEditorDriver {
  constructor(private page: Page) {}

  private get editor(): Locator {
    return this.page.getByTestId("edit-modal");
  }

  private get input(): Locator {
    return this.page.getByTestId("edit-modal-input");
  }

  async open(valueName: string): Promise<void> {
    await this.page.getByTestId(getTestId(valueName)).click();
    await expect(this.editor).toBeVisible();
    await expect(this.input).toBeFocused();
  }

  async setValue(value: string): Promise<void> {
    if ((await this.input.getAttribute("type")) === "number" && !/^-?\d*$/.test(value)) {
      // A number field refuses fill(); typing is what a person does, and the field keeps what it accepts.
      await this.input.clear();
      await this.input.pressSequentially(value);
      return;
    }
    await this.input.fill(value);
    await expect(this.input).toHaveValue(value);
  }

  async confirm(): Promise<void> {
    await this.page.getByTestId("modal-confirm-button").click();
    await this.expectSaved();
  }

  async confirmWithEnter(): Promise<void> {
    await this.page.keyboard.press("Enter");
    await this.expectSaved();
  }

  async cancel(): Promise<void> {
    await this.page.getByTestId("modal-cancel-button").click();
    await this.expectClosed();
  }

  async dismissWithEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
    await this.expectClosed();
  }

  async expectOpenShowing(value: string): Promise<void> {
    await expect(this.editor).toBeVisible();
    await expect(this.input).toHaveValue(value);
  }

  async expectInputFocused(): Promise<void> {
    await expect(this.input).toBeFocused();
  }

  async expectClosed(): Promise<void> {
    await expect(this.editor).toBeHidden();
  }

  async expectStillOpen(): Promise<void> {
    await expect(this.editor).toBeVisible();
  }

  async expectCannotConfirm(): Promise<void> {
    await expect(this.page.getByTestId("modal-confirm-button")).toBeDisabled();
  }

  async expectExplanation(): Promise<void> {
    const explanation = this.page.locator(".edit-modal-error");
    await expect(explanation).toBeVisible();
    await expect(explanation).not.toHaveText(/^validation\./);
  }

  async dismissByClickingOutside(): Promise<void> {
    await this.page.click("body", { position: { x: 10, y: 10 } });
    await this.expectClosed();
  }

  async expectFocusStaysInside(): Promise<void> {
    const reached = new Set<string>();
    for (let press = 0; press < 4; press++) {
      await this.page.keyboard.press("Tab");
      const focused = this.editor.locator(":focus");
      await expect(focused).toHaveCount(1);
      reached.add((await focused.getAttribute("data-testid")) ?? "");
    }
    expect([...reached].sort()).toEqual(
      ["edit-modal-input", "modal-cancel-button", "modal-confirm-button"].sort()
    );
  }

  async expectNumericKeypad(): Promise<void> {
    await expect(this.input).toHaveAttribute("inputmode", "numeric");
  }

  async expectButtonsHaveIcons(): Promise<void> {
    await expect(this.page.getByTestId("modal-confirm-button").locator("svg")).toBeVisible();
    await expect(this.page.getByTestId("modal-cancel-button").locator("svg")).toBeVisible();
  }

  async expectSheetDimmed(): Promise<void> {
    const backdrop = this.page.getByTestId("modal-backdrop");
    await expect(backdrop).toBeVisible();
    const colour = await backdrop.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const alpha = /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/.exec(colour)?.[1];
    expect(Number(alpha ?? 1)).toBeGreaterThan(0);
    expect(Number(alpha ?? 1)).toBeLessThan(1);
  }

  async expectDialogSemantics(): Promise<void> {
    await expect(this.editor).toHaveAttribute("role", "dialog");
    await expect(this.page.getByTestId("modal-backdrop")).toHaveAttribute("aria-hidden", "true");
  }

  async expectFitsScreen(): Promise<void> {
    const box = await this.editor.boundingBox();
    const viewport = this.page.viewportSize();
    if (!box || !viewport) throw new Error("Cannot measure the value editor");
    expect(box.width).toBeGreaterThan(viewport.width * 0.8);
    expect(box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.height).toBeLessThanOrEqual(viewport.height);
  }

  async expectTouchFriendlyControls(): Promise<void> {
    for (const control of [
      this.page.getByTestId("modal-confirm-button"),
      this.page.getByTestId("modal-cancel-button"),
    ]) {
      await this.expectAtLeastTouchSize(control, "width");
      await this.expectAtLeastTouchSize(control, "height");
    }
    await this.expectAtLeastTouchSize(this.input, "height");
  }

  async expectValueLooksClickable(valueName: string): Promise<void> {
    await expect(this.page.getByTestId(getTestId(valueName))).toHaveCSS("cursor", "pointer");
  }

  async expectValueTouchFriendly(valueName: string): Promise<void> {
    await this.expectAtLeastTouchSize(this.page.getByTestId(getTestId(valueName)), "height");
  }

  private async expectAtLeastTouchSize(
    target: Locator,
    dimension: "width" | "height"
  ): Promise<void> {
    const box = await target.boundingBox();
    if (!box) throw new Error("Cannot measure the touch target");
    expect(box[dimension]).toBeGreaterThanOrEqual(TOUCH_TARGET_MIN_PX);
  }

  private async expectSaved(): Promise<void> {
    await this.expectClosed();
    await waitForSaveComplete(this.page);
  }
}
