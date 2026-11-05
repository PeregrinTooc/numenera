import { html, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { RecoveryRolls } from "./RecoveryRolls.js";
import { DamageTrack } from "./DamageTrack.js";
import { persistCharacterState } from "@/storage/storageFactory";

export class RecoveryDamageSection {
  private recoveryRolls: RecoveryRolls;
  private damageTrack: DamageTrack;

  constructor(private character: Character) {
    this.recoveryRolls = new RecoveryRolls(this.character.recoveryRolls, (field, value) => {
      if (field === "recoveryModifier") {
        this.character.recoveryRolls.modifier = value as number;
      } else {
        this.character.recoveryRolls[field] = value as boolean;
      }
      this.notifyUpdated();
    });

    this.damageTrack = new DamageTrack(this.character.damageTrack, (impairment) => {
      this.character.damageTrack.impairment = impairment;
      this.notifyUpdated();
    });
  }

  private notifyUpdated(): void {
    persistCharacterState(this.character);
    const app = document.getElementById("app");
    if (app) {
      app.dispatchEvent(new CustomEvent("character-updated"));
      // Dispatch recovery-updated to re-render the sheet (also covers
      // damage-track changes: its handler re-renders the full sheet)
      app.dispatchEvent(new CustomEvent("recovery-updated"));
    }
  }

  render(): TemplateResult {
    return html`
      <div
        data-testid="recovery-damage-section"
        class="section-box grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        ${this.recoveryRolls.render()} ${this.damageTrack.render()}
      </div>
    `;
  }
}
