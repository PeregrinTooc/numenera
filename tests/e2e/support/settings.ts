import type { LanguageDsl } from "./language.js";
import type { SettingsDriver } from "./settingsDriver.js";

const RESET_LAYOUT = "Reset Layout";

function onlyResetLayout(option: string): void {
  if (option !== RESET_LAYOUT) throw new Error(`Unknown settings option: ${option}`);
}

export class SettingsDsl {
  constructor(
    private driver: SettingsDriver,
    private language: LanguageDsl
  ) {}

  async expectGearVisible(): Promise<void> {
    await this.driver.expectGearVisible();
  }

  async clicksGear(): Promise<void> {
    await this.driver.clickGear();
  }

  async openPanel(): Promise<void> {
    await this.driver.openPanel();
  }

  async expectPanelShown(): Promise<void> {
    await this.driver.expectPanelShown();
  }

  async expectPanelClosed(): Promise<void> {
    await this.driver.expectPanelClosed();
  }

  async clicksOutsidePanel(): Promise<void> {
    await this.driver.clickOutsidePanel();
  }

  async pressesEscape(): Promise<void> {
    await this.driver.pressEscape();
  }

  async choosesGerman(): Promise<void> {
    await this.driver.chooseLanguage("de");
  }

  async switchesToGerman(): Promise<void> {
    await this.openPanel();
    await this.choosesGerman();
    await this.language.expectTitleInGerman();
  }

  async choosesEnglish(): Promise<void> {
    await this.driver.chooseLanguage("en");
  }

  async isInGermanWithPanelOpen(): Promise<void> {
    await this.choosesGerman();
    await this.language.expectTitleInGerman();
    await this.driver.clickGear();
    await this.driver.expectPanelShown();
  }

  async reloadsWithoutSecureOriginCryptography(): Promise<void> {
    await this.driver.reloadWithoutSecureOriginCryptography();
  }

  async resetLayout(): Promise<void> {
    await this.driver.clickResetLayout();
  }

  async expectOptionShown(option: string): Promise<void> {
    onlyResetLayout(option);
    await this.driver.expectResetLayoutAvailable();
  }

  async expectOptionDisabled(option: string): Promise<void> {
    onlyResetLayout(option);
    await this.driver.expectResetLayoutDisabled();
  }
}
