// CharacterSheet component - Main container that composes all sections

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { Header } from "./Header.js";
import { BasicInfo } from "./BasicInfo.js";
import { Stats } from "./Stats.js";
import { RecoveryRolls } from "./RecoveryRolls.js";
import { DamageTrack } from "./DamageTrack.js";
import { Abilities } from "./Abilities.js";
import { SpecialAbilities } from "./SpecialAbilities.js";
import { Attacks } from "./Attacks.js";
import { CyphersBox } from "./CyphersBox.js";
import { ItemsBox } from "./ItemsBox.js";
import { BottomTextFields } from "./BottomTextFields.js";

export class CharacterSheet {
  private header: Header;
  private basicInfo: BasicInfo;
  private bottomTextFields: BottomTextFields | null = null;
  private bottomTextFieldsInitialized = false;

  constructor(
    private character: Character,
    private onLoad: () => void,
    private onNew: () => void,
    private onFieldUpdate: (field: string, value: string | number) => void
  ) {
    // Create stateful components once to preserve their state across re-renders
    this.header = new Header(this.onLoad, this.onNew);
    this.basicInfo = new BasicInfo(this.character, this.onFieldUpdate);
    // bottomTextFields will be created after container exists
  }

  render(): TemplateResult {
    // Create stateless components that don't need to preserve state
    const stats = new Stats(this.character);
    const recoveryRolls = new RecoveryRolls(this.character.recoveryRolls);
    const damageTrack = new DamageTrack(this.character.damageTrack);
    const abilities = new Abilities(this.character.abilities);
    const specialAbilities = new SpecialAbilities(this.character.specialAbilities);
    const attacks = new Attacks(this.character.attacks, this.character.armor);
    const cyphersBox = new CyphersBox(this.character.cyphers, this.character.maxCyphers);
    const itemsBox = new ItemsBox(
      this.character.equipment,
      this.character.artifacts,
      this.character.oddities,
      this.character.shins
    );

    // Initialize BottomTextFields after container exists (only once)
    if (!this.bottomTextFieldsInitialized) {
      this.bottomTextFieldsInitialized = true;
      setTimeout(() => {
        const container = document.querySelector('[data-testid="text-fields-section"]');
        if (container && !this.bottomTextFields) {
          this.bottomTextFields = new BottomTextFields(this.character, container as HTMLElement);
        }
      }, 0);
    }

    return html`
      <div class="min-h-screen p-4">
        <div class="max-w-6xl mx-auto shadow rounded-lg p-6 parchment-container">
          ${this.header.render()} ${this.basicInfo.render()} ${stats.render()}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            ${recoveryRolls.render()} ${damageTrack.render()}
          </div>
          ${abilities.render()}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${specialAbilities.render()} ${attacks.render()}
          </div>
          ${cyphersBox.render()} ${itemsBox.render()}
          <div data-testid="text-fields-section" class="mt-8">
            <!-- BottomTextFields will render itself here -->
          </div>
        </div>
      </div>
    `;
  }
}
