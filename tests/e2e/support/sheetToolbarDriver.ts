import { expect, type Page } from "@playwright/test";

export type ToolbarControl = "version navigator" | "edit layout button";

const CONTROL_SELECTORS: Record<ToolbarControl, string> = {
  "version navigator": '[data-testid="version-navigator"]',
  "edit layout button": '[data-testid="edit-layout-button"]',
};

const SHEET = ".parchment-container";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function intersects(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

/** The controls kept in the toolbar above the sheet. */
export interface SheetToolbarDriver {
  scrollToBottom(): Promise<void>;
  expectNotOverlappingSheet(control: ToolbarControl): Promise<void>;
  expectInView(control: ToolbarControl): Promise<void>;
}

export class PlaywrightSheetToolbarDriver implements SheetToolbarDriver {
  constructor(private page: Page) {}

  /**
   * Scrolls again on every poll: the page can still grow after the first scroll
   * (late-rendered sections, web fonts), which would otherwise move the bottom
   * away and time out. The 1px slack absorbs WebKit's sub-pixel scroll offsets.
   */
  async scrollToBottom(): Promise<void> {
    await this.page.waitForFunction(() => {
      const bottom = document.documentElement.scrollHeight;
      window.scrollTo(0, bottom);
      return Math.ceil(window.scrollY + window.innerHeight) >= bottom - 1;
    });
  }

  /** Compares viewport boxes at the current scroll position: a control floating over the sheet intersects it. */
  async expectNotOverlappingSheet(control: ToolbarControl): Promise<void> {
    const selector = CONTROL_SELECTORS[control];
    const controlBox = await this.page.locator(selector).boundingBox();
    const sheetBox = await this.page.locator(SHEET).boundingBox();
    if (!controlBox || !sheetBox) {
      throw new Error(`Expected both the ${control} and the character sheet to be rendered`);
    }
    expect(intersects(controlBox, sheetBox)).toBe(false);
  }

  async expectInView(control: ToolbarControl): Promise<void> {
    await expect(this.page.locator(CONTROL_SELECTORS[control])).toBeInViewport({ ratio: 1 });
  }
}
