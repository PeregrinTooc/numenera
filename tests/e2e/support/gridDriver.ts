import { expect, type Page } from "@playwright/test";
import { LAYOUT_STORAGE_KEY } from "@/storage/storageConstants";
import { DEFAULT_LAYOUT, type Layout } from "@/types/layout";
import { sectionBox, sectionId, sectionLocator, sectionOrder } from "./sections.js";

/** Sections paired side by side in a layout grid, and the layout saved for them. */
export interface GridDriver {
  expectPairedSideBySide(left: string, right: string): Promise<void>;
  expectSavedLayoutPairs(left: string, right: string): Promise<void>;
  expectSavedLayoutIsDefault(): Promise<void>;
  expectLastSection(name: string): Promise<void>;
  expectInOwnRow(name: string): Promise<void>;
}

export class PlaywrightGridDriver implements GridDriver {
  constructor(private page: Page) {}

  async expectPairedSideBySide(left: string, right: string): Promise<void> {
    await expect(
      this.page.getByTestId(`layout-grid-${sectionId(left)}-${sectionId(right)}`)
    ).toBeVisible();
    // Polled: right after a live preview the sections are still sliding there
    await expect
      .poll(
        async () => (await sectionBox(this.page, left)).x < (await sectionBox(this.page, right)).x
      )
      .toBe(true);
  }

  // Read from storage: a drop the browser lost leaves the live preview on screen
  async expectSavedLayoutPairs(left: string, right: string): Promise<void> {
    expect(await this.savedLayout()).toContainEqual({
      type: "grid",
      items: [sectionId(left), sectionId(right)],
    });
  }

  async expectSavedLayoutIsDefault(): Promise<void> {
    expect(await this.savedLayout()).toEqual(DEFAULT_LAYOUT);
  }

  async expectLastSection(name: string): Promise<void> {
    const ids = await sectionOrder(this.page);
    expect(ids[ids.length - 1]).toBe(sectionId(name));
  }

  async expectInOwnRow(name: string): Promise<void> {
    const section = sectionLocator(this.page, name);
    await expect(section).toHaveCount(1);
    expect(await section.evaluate((el) => el.closest(".layout-grid") === null)).toBe(true);
  }

  // Nothing saved means the app uses DEFAULT_LAYOUT.
  private async savedLayout(): Promise<Layout> {
    const stored = await this.page.evaluate((key) => localStorage.getItem(key), LAYOUT_STORAGE_KEY);
    return stored === null ? DEFAULT_LAYOUT : (JSON.parse(stored) as Layout);
  }
}
