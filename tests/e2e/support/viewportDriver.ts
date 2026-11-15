import { expect, type Page } from "@playwright/test";

/** The size of the browser window the app is shown in. */
export interface ViewportDriver {
  /** Set the window width, at the default height, and wait until the page has it. */
  resizeTo(width: number): Promise<void>;
  /**
   * Grow the window to the page's full height (width unchanged), scrolled to
   * the top. Not restored: use it when a drag stays held across steps, where
   * restoring would reflow the page under the pointer mid-drag.
   */
  growToFullHeight(): Promise<void>;
  /**
   * Run `action` with the window grown to the page's full height, then
   * restore the size.
   *
   * Why: `locator.dragTo()` scrolls the target into view while the mouse
   * button is held. When source and target aren't both on screen, the page
   * moves under the cursor and Chromium starts the drag on whatever is there
   * instead. With everything on screen, nothing scrolls.
   */
  withFullHeight<T>(action: () => Promise<T>): Promise<T>;
  expectNoSidewaysScroll(): Promise<void>;
}

const DEFAULT_HEIGHT = 800;

export class PlaywrightViewportDriver implements ViewportDriver {
  constructor(private page: Page) {}

  async resizeTo(width: number): Promise<void> {
    const innerWidth = (): Promise<number> => this.page.evaluate(() => window.innerWidth);
    const before = await innerWidth();
    await this.page.setViewportSize({ width, height: DEFAULT_HEIGHT });
    // A page wider than the window (a mobile browser widens its layout
    // viewport to fit) reports more than `width`, so wait for the change,
    // not for the exact number.
    if (before !== width) {
      await expect.poll(innerWidth).not.toBe(before);
    }
  }

  async growToFullHeight(): Promise<void> {
    await this.grow();
  }

  async withFullHeight<T>(action: () => Promise<T>): Promise<T> {
    const original = await this.grow();
    try {
      return await action();
    } finally {
      await this.page.setViewportSize(original);
    }
  }

  async expectNoSidewaysScroll(): Promise<void> {
    await expect
      .poll(() =>
        this.page.evaluate(
          () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
        )
      )
      .toBe(true);
  }

  private async grow(): Promise<{ width: number; height: number }> {
    const original = this.page.viewportSize();
    if (!original) {
      throw new Error("Growing the viewport needs a page with a fixed viewport");
    }
    const fullHeight = await this.page.evaluate(() => document.documentElement.scrollHeight);
    await this.page.setViewportSize({
      width: original.width,
      height: Math.max(original.height, fullHeight),
    });
    await this.page.evaluate(() => window.scrollTo(0, 0));
    return original;
  }
}
