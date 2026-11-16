import { expect, type Locator, type Page } from "@playwright/test";
import { waitForSaveComplete } from "./save.js";

const RECOVERY_CHECKBOXES = "input[type=checkbox][data-recovery-roll]";

/** The recovery rolls and damage track sections of the sheet. */
export interface HealthDriver {
  expectSectionTitled(title: string): Promise<void>;
  expectRecoveryModifierDisplays(text: string): Promise<void>;
  expectRecoverySectionShows(text: string): Promise<void>;
  expectRecoveryRollCount(count: number): Promise<void>;
  expectRecoveryRollLabelled(roll: string, time: string): Promise<void>;
  expectRecoveryRollTicked(roll: string, ticked: boolean): Promise<void>;
  expectNoRecoveryRollTicked(): Promise<void>;
  tickRecoveryRoll(roll: string): Promise<void>;
  expectRecoverySectionGreen(): Promise<void>;
  expectDamageOptionCount(count: number): Promise<void>;
  expectDamageOptionShows(status: string, description?: string): Promise<void>;
  expectDamageStatusSelected(status: string, selected: boolean): Promise<void>;
  selectDamageStatus(status: string): Promise<void>;
  expectDamageSectionRed(): Promise<void>;
}

function kebab(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export class PlaywrightHealthDriver implements HealthDriver {
  constructor(private page: Page) {}

  private get recovery(): Locator {
    return this.page.getByTestId("recovery-rolls-section");
  }

  private get damage(): Locator {
    return this.page.getByTestId("damage-track-section");
  }

  private recoveryRoll(roll: string): Locator {
    return this.page.getByTestId(`recovery-${kebab(roll)}`);
  }

  private damageStatus(status: string): Locator {
    return this.page.getByTestId(`damage-${kebab(status)}`);
  }

  async expectSectionTitled(title: string): Promise<void> {
    await expect(this.page.getByRole("heading", { name: title })).toBeVisible();
  }

  async expectRecoveryModifierDisplays(text: string): Promise<void> {
    const display = this.page.getByTestId("recovery-modifier-display");
    await expect(display).toBeVisible();
    await expect(display).toContainText(text);
  }

  async expectRecoverySectionShows(text: string): Promise<void> {
    await expect(this.recovery).toContainText(text);
  }

  async expectRecoveryRollCount(count: number): Promise<void> {
    await expect(this.page.locator(RECOVERY_CHECKBOXES)).toHaveCount(count);
  }

  async expectRecoveryRollLabelled(roll: string, time: string): Promise<void> {
    const label = this.recovery.locator("label").filter({ hasText: roll });
    await expect(label).toContainText(time);
  }

  async expectRecoveryRollTicked(roll: string, ticked: boolean): Promise<void> {
    if (ticked) await expect(this.recoveryRoll(roll)).toBeChecked();
    else await expect(this.recoveryRoll(roll)).not.toBeChecked();
  }

  async expectNoRecoveryRollTicked(): Promise<void> {
    const checkboxes = this.page.locator(RECOVERY_CHECKBOXES);
    await expect(checkboxes.first()).toBeVisible();
    for (const checkbox of await checkboxes.all()) await expect(checkbox).not.toBeChecked();
  }

  async tickRecoveryRoll(roll: string): Promise<void> {
    await this.recoveryRoll(roll).click();
    await waitForSaveComplete(this.page);
  }

  async expectRecoverySectionGreen(): Promise<void> {
    await expect(this.recovery).toBeVisible();
    await expect(this.recovery).toHaveClass(/from-green-50/);
  }

  async expectDamageOptionCount(count: number): Promise<void> {
    await expect(this.page.locator("input[type=radio][name=damage-track]")).toHaveCount(count);
  }

  async expectDamageOptionShows(status: string, description?: string): Promise<void> {
    const option = this.damage.locator("label").filter({ hasText: status });
    await expect(option).toBeVisible();
    if (description !== undefined) await expect(option).toContainText(description);
  }

  async expectDamageStatusSelected(status: string, selected: boolean): Promise<void> {
    if (selected) await expect(this.damageStatus(status)).toBeChecked();
    else await expect(this.damageStatus(status)).not.toBeChecked();
  }

  async selectDamageStatus(status: string): Promise<void> {
    await this.damageStatus(status).click();
    await waitForSaveComplete(this.page);
  }

  async expectDamageSectionRed(): Promise<void> {
    await expect(this.damage).toBeVisible();
    await expect(this.damage).toHaveClass(/from-red-50/);
  }
}
