import { expect, type Page } from "@playwright/test";

const EDIT_BUTTON = '[data-testid="edit-layout-button"]';
const CONTAINER = ".parchment-container";
const MIN_TOUCH_TARGET_PX = 44;

/** Entering and leaving layout edit mode, and what the sheet shows while in it. */
export interface LayoutEditDriver {
  toggleEditMode(): Promise<void>;
  expectEditModeActive(): Promise<void>;
  expectEditModeInactive(): Promise<void>;
  expectSectionsMarkedRearrangeable(): Promise<void>;
  expectEditButtonVisible(): Promise<void>;
  expectEditButtonTouchFriendly(): Promise<void>;
  expectNoSavedLayout(): Promise<void>;
}

export class PlaywrightLayoutEditDriver implements LayoutEditDriver {
  constructor(private page: Page) {}

  async toggleEditMode(): Promise<void> {
    await this.page.click(EDIT_BUTTON);
  }

  async expectEditModeActive(): Promise<void> {
    await expect(this.page.locator(EDIT_BUTTON)).toHaveClass(/edit-layout-button--active/);
    await expect(this.page.locator(CONTAINER)).toHaveClass(/layout-edit-mode/);
  }

  async expectEditModeInactive(): Promise<void> {
    await expect(this.page.locator(EDIT_BUTTON)).not.toHaveClass(/edit-layout-button--active/);
    await expect(this.page.locator(CONTAINER)).not.toHaveClass(/layout-edit-mode/);
  }

  async expectSectionsMarkedRearrangeable(): Promise<void> {
    expect(await this.page.locator(".layout-draggable").count()).toBeGreaterThan(0);
  }

  async expectEditButtonVisible(): Promise<void> {
    await expect(this.page.locator(EDIT_BUTTON)).toBeVisible();
  }

  async expectEditButtonTouchFriendly(): Promise<void> {
    const box = await this.page.locator(EDIT_BUTTON).boundingBox();
    if (!box) throw new Error("The Edit Layout button has no bounding box (not visible?)");
    expect(box.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
    expect(box.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET_PX);
  }

  async expectNoSavedLayout(): Promise<void> {
    const saved = await this.page.evaluate(() => localStorage.getItem("numenera-layout"));
    expect(saved).toBeNull();
  }
}
