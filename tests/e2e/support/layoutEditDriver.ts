import { expect, type Page } from "@playwright/test";
import { LAYOUT_STORAGE_KEY } from "@/storage/storageConstants";
import { SINGLE_ONLY_SECTIONS } from "@/types/layout";
import { sectionId, sectionOrder } from "./sections.js";

const EDIT_BUTTON = '[data-testid="edit-layout-button"]';
const CONTAINER = ".parchment-container";
const MIN_TOUCH_TARGET_PX = 44;

/** Entering and leaving layout edit mode, what the sheet shows while in it, and the layout it keeps. */
export interface LayoutEditDriver {
  toggleEditMode(): Promise<void>;
  expectEditModeActive(): Promise<void>;
  expectEditModeInactive(): Promise<void>;
  expectSectionsMarkedRearrangeable(): Promise<void>;
  expectEditButtonVisible(): Promise<void>;
  expectEditButtonTouchFriendly(): Promise<void>;
  expectNoSavedLayout(): Promise<void>;
  expectSectionBefore(first: string, second: string): Promise<void>;
  expectFirstRearrangeable(name: string): Promise<void>;
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
    expect(await this.savedLayout()).toBeNull();
  }

  async expectSectionBefore(first: string, second: string): Promise<void> {
    const [firstId, secondId] = [sectionId(first), sectionId(second)];
    await expect
      .poll(async () => {
        const order = await sectionOrder(this.page);
        const [firstPos, secondPos] = [order.indexOf(firstId), order.indexOf(secondId)];
        return firstPos >= 0 && firstPos < secondPos;
      })
      .toBe(true);
  }

  async expectFirstRearrangeable(name: string): Promise<void> {
    const fixed: string[] = [...SINGLE_ONLY_SECTIONS];
    const order = await sectionOrder(this.page);
    expect(order.filter((id) => !fixed.includes(id))[0]).toBe(sectionId(name));
  }

  private savedLayout(): Promise<string | null> {
    return this.page.evaluate((key) => localStorage.getItem(key), LAYOUT_STORAGE_KEY);
  }
}
