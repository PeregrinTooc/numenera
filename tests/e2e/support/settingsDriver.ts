import { expect, type Page } from "@playwright/test";

const testId = (id: string): string => `[data-testid="${id}"]`;

export type FlagLanguage = "de" | "en";

/** The settings panel behind the header gear. */
export interface SettingsDriver {
  expectGearVisible(): Promise<void>;
  clickGear(): Promise<void>;
  openPanel(): Promise<void>;
  expectPanelShown(): Promise<void>;
  expectPanelClosed(): Promise<void>;
  clickOutsidePanel(): Promise<void>;
  pressEscape(): Promise<void>;
  chooseLanguage(language: FlagLanguage): Promise<void>;
  clickResetLayout(): Promise<void>;
  expectResetLayoutAvailable(): Promise<void>;
  expectResetLayoutDisabled(): Promise<void>;
  reloadWithoutSecureOriginCryptography(): Promise<void>;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function contains(box: Box, point: { x: number; y: number }): boolean {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

export class PlaywrightSettingsDriver implements SettingsDriver {
  constructor(private page: Page) {}

  async expectGearVisible(): Promise<void> {
    await expect(this.page.locator(testId("settings-gear-button"))).toBeVisible();
  }

  async clickGear(): Promise<void> {
    await this.page.locator(testId("settings-gear-button")).click();
  }

  /**
   * Also waits for the panel's document click-outside listener, which is
   * attached with setTimeout(0); a zero-delay timer queued afterwards runs after
   * it, so a step immediately clicking outside the panel doesn't race it.
   */
  async openPanel(): Promise<void> {
    await this.clickGear();
    await this.expectPanelShown();
    await this.page.evaluate(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
  }

  async expectPanelShown(): Promise<void> {
    await expect(this.page.locator(testId("settings-panel"))).toBeVisible();
  }

  async expectPanelClosed(): Promise<void> {
    await expect(this.page.locator(testId("settings-panel"))).not.toBeVisible();
  }

  /**
   * Clicks the page title's top-left corner. On phones the title wraps and the
   * panel covers its centre, so a centre click would land on the panel itself.
   */
  async clickOutsidePanel(): Promise<void> {
    const title = this.page.locator(testId("page-title"));
    const titleBox = await title.boundingBox();
    const panelBox = await this.page.locator(testId("settings-panel")).boundingBox();
    if (!titleBox || !panelBox) {
      throw new Error("Page title or settings panel has no bounding box");
    }
    const offset = { x: 2, y: 2 };
    const point = { x: titleBox.x + offset.x, y: titleBox.y + offset.y };
    expect(contains(panelBox, point), "click point must be outside the settings panel").toBe(false);
    // locator.click also verifies the title (not the panel) receives the click.
    await title.click({ position: offset });
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press("Escape");
  }

  async chooseLanguage(language: FlagLanguage): Promise<void> {
    await this.page.locator(testId(`language-flag-${language}`)).click();
  }

  async clickResetLayout(): Promise<void> {
    await this.page.click(testId("settings-reset-layout"));
  }

  async expectResetLayoutAvailable(): Promise<void> {
    await expect(this.page.locator(testId("settings-reset-layout"))).toBeVisible();
  }

  async expectResetLayoutDisabled(): Promise<void> {
    await expect(this.page.locator(testId("settings-reset-layout"))).toBeDisabled();
  }

  /**
   * As on plain HTTP at a network address: the app is served from localhost,
   * which counts as secure, so the APIs are taken away before it boots again.
   */
  async reloadWithoutSecureOriginCryptography(): Promise<void> {
    await this.page.addInitScript(() => {
      const cryptoPrototype = Object.getPrototypeOf(crypto);
      Object.defineProperty(cryptoPrototype, "subtle", { get: () => undefined });
      Object.defineProperty(cryptoPrototype, "randomUUID", { value: undefined });
    });
    await this.page.reload();
    await this.page.waitForSelector(testId("character-header"));
  }
}
