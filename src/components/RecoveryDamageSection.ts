// RecoveryDamageSection component - Combines Recovery Rolls and Damage Track
// These are always displayed together as they represent related game mechanics

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { RecoveryRolls } from "./RecoveryRolls.js";
import { DamageTrack } from "./DamageTrack.js";
import { persistCharacterState } from "../storage/storageFactory.js";

export class RecoveryDamageSection {
  private recoveryRolls: RecoveryRolls;
  private damageTrack: DamageTrack;

  constructor(private character: Character) {
    // Create RecoveryRolls with field update handler
    this.recoveryRolls = new RecoveryRolls(this.character.recoveryRolls, (field, value) => {
      if (field === "recoveryModifier") {
        this.character.recoveryRolls.modifier = value as number;
      } else {
        this.character.recoveryRolls[field] = value as boolean;
      }
      this.notifyUpdated();
    });

    // Create DamageTrack with field update handler
    this.damageTrack = new DamageTrack(this.character.damageTrack, (impairment) => {
      this.character.damageTrack.impairment = impairment;
      this.notifyUpdated();
    });
  }

  private notifyUpdated(): void {
    persistCharacterState(this.character);
    const app = document.getElementById("app");
    if (app) {
      // Dispatch character-updated for auto-save
      app.dispatchEvent(new CustomEvent("character-updated"));
      // Dispatch recovery-updated to re-render the sheet (also covers
      // damage-track changes: its handler re-renders the full sheet)
      app.dispatchEvent(new CustomEvent("recovery-updated"));
    }
  }

  render(): TemplateResult {
    return html`
      <div data-testid="recovery-damage-section" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        ${this.recoveryRolls.render()} ${this.damageTrack.render()}
      </div>
    `;
  }
}
