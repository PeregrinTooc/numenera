import { expect, type Page } from "@playwright/test";

const testId = (id: string): string => `[data-testid="${id}"]`;

/** The settings panel behind the header gear. */
export interface SettingsDriver {
  openPanel(): Promise<void>;
  clickResetLayout(): Promise<void>;
  expectResetLayoutAvailable(): Promise<void>;
}

export class PlaywrightSettingsDriver implements SettingsDriver {
  constructor(private page: Page) {}

  /**
   * Also waits for the panel's document click-outside listener, which is
   * attached with setTimeout(0); a zero-delay timer queued afterwards runs after
   * it, so a step immediately clicking outside the panel doesn't race it.
   */
  async openPanel(): Promise<void> {
    await this.page.locator(testId("settings-gear-button")).click();
    await expect(this.page.locator(testId("settings-panel"))).toBeVisible();
    await this.page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
  }

  async clickResetLayout(): Promise<void> {
    await this.page.click(testId("settings-reset-layout"));
  }

  async expectResetLayoutAvailable(): Promise<void> {
    await expect(this.page.locator(testId("settings-reset-layout"))).toBeVisible();
  }
}
