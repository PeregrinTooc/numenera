import type { Character, DamageTrack } from "@/types/character";
import type { HealthDriver } from "./healthDriver.js";
import type { SetupDsl } from "./setup.js";

type RecoveryRoll = "action" | "tenMinutes" | "oneHour" | "tenHours";

function rollKey(roll: string): RecoveryRoll {
  const [first, ...rest] = roll.toLowerCase().split(/\s+/);
  const capitalised = rest.map((word) => word[0].toUpperCase() + word.slice(1));
  return [first, ...capitalised].join("") as RecoveryRoll;
}

export class HealthDsl {
  constructor(
    private health: HealthDriver,
    private setup: SetupDsl
  ) {}

  async hasRecoveryUsed(roll: string): Promise<void> {
    await this.setup.updateCharacter((character: Character) => {
      character.recoveryRolls[rollKey(roll)] = true;
    });
  }

  async hasRecoveryModifier(modifier: number): Promise<void> {
    await this.setup.updateCharacter((character: Character) => {
      character.recoveryRolls.modifier = modifier;
    });
    await this.health.expectRecoveryModifierDisplays(`1d6 + ${modifier}`);
  }

  async hasImpairment(status: string): Promise<void> {
    await this.setup.updateCharacter((character: Character) => {
      character.damageTrack.impairment = status as DamageTrack["impairment"];
    });
    await this.health.expectDamageStatusSelected(status, true);
  }

  async expectSectionTitled(title: string): Promise<void> {
    await this.health.expectSectionTitled(title);
  }

  async expectRecoveryModifierDisplays(text: string): Promise<void> {
    await this.health.expectRecoveryModifierDisplays(text);
  }

  async expectRecoverySectionShows(text: string): Promise<void> {
    await this.health.expectRecoverySectionShows(text);
  }

  async expectRecoveryRollCount(count: number): Promise<void> {
    await this.health.expectRecoveryRollCount(count);
  }

  async expectRecoveryRollLabelled(roll: string, time: string): Promise<void> {
    await this.health.expectRecoveryRollLabelled(roll, time);
  }

  async expectRecoveryRollTicked(roll: string): Promise<void> {
    await this.health.expectRecoveryRollTicked(roll, true);
  }

  async expectRecoveryRollNotTicked(roll: string): Promise<void> {
    await this.health.expectRecoveryRollTicked(roll, false);
  }

  async expectNoRecoveryRollTicked(): Promise<void> {
    await this.health.expectNoRecoveryRollTicked();
  }

  async ticksRecoveryRoll(roll: string): Promise<void> {
    await this.health.tickRecoveryRoll(roll);
  }

  async expectRecoverySectionGreen(): Promise<void> {
    await this.health.expectRecoverySectionGreen();
  }

  async expectDamageOptionCount(count: number): Promise<void> {
    await this.health.expectDamageOptionCount(count);
  }

  async expectDamageOption(status: string, description?: string): Promise<void> {
    await this.health.expectDamageOptionShows(status, description);
  }

  async expectDamageStatusSelected(status: string): Promise<void> {
    await this.health.expectDamageStatusSelected(status, true);
  }

  async expectDamageStatusNotSelected(status: string): Promise<void> {
    await this.health.expectDamageStatusSelected(status, false);
  }

  async selectsDamageStatus(status: string): Promise<void> {
    await this.health.selectDamageStatus(status);
  }

  async expectDamageSectionRed(): Promise<void> {
    await this.health.expectDamageSectionRed();
  }
}
