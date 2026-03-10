// RecoveryDamageSection component - Combines Recovery Rolls and Damage Track
// These are always displayed together as they represent related game mechanics

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { RecoveryRolls } from "./RecoveryRolls.js";
import { DamageTrack } from "./DamageTrack.js";
import { saveCharacterState } from "../storage/localStorage.js";

export class RecoveryDamageSection {
  private recoveryRolls: RecoveryRolls;
  private damageTrack: DamageTrack;

  constructor(private character: Character) {
    // Create RecoveryRolls with field update handler
    this.recoveryRolls = new RecoveryRolls(this.character.recoveryRolls, (field, value) => {
      if (field === "recoveryModifier") {
        this.character.recoveryRolls.modifier = value;
        saveCharacterState(this.character);
        // Dispatch character-updated for auto-save
        const app = document.getElementById("app");
        if (app) {
          app.dispatchEvent(new CustomEvent("character-updated"));
          // Dispatch recovery-updated for targeted re-render
          app.dispatchEvent(new CustomEvent("recovery-updated"));
        }
      }
    });

    // Create DamageTrack
    this.damageTrack = new DamageTrack(this.character.damageTrack);
  }

  render(): TemplateResult {
    return html`
      <div data-testid="recovery-damage-section" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        ${this.recoveryRolls.render()} ${this.damageTrack.render()}
      </div>
    `;
  }
}
