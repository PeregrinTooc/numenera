import type { SettingsDriver } from "./settingsDriver.js";

export class SettingsDsl {
  constructor(private driver: SettingsDriver) {}

  async openPanel(): Promise<void> {
    await this.driver.openPanel();
  }

  async resetLayout(): Promise<void> {
    await this.driver.clickResetLayout();
  }

  async expectOptionEnabled(option: string): Promise<void> {
    if (option !== "Reset Layout") throw new Error(`Unknown settings option: ${option}`);
    await this.driver.expectResetLayoutAvailable();
  }
}
