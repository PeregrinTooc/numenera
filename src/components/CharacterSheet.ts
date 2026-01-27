// CharacterSheet component - Main container that composes all sections
/* global CustomEvent */

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
import { saveCharacterState } from "../storage/localStorage.js";

export class CharacterSheet {
  private header: Header;
  private basicInfo: BasicInfo;
  private bottomTextFields: BottomTextFields;
  private itemsBox: ItemsBox;
  private attacks: Attacks;
  private cyphersBox: CyphersBox;
  private stats: Stats;

  constructor(
    private character: Character,
    private onLoad: () => void,
    private onNew: () => void,
    private onImport: () => void,
    private onFieldUpdate: (field: string, value: string | number) => void
  ) {
    // Create stateful components once to preserve their state across re-renders
    this.header = new Header(this.onLoad, this.onNew, this.onImport);
    this.basicInfo = new BasicInfo(this.character, this.onFieldUpdate);
    this.bottomTextFields = new BottomTextFields(this.character);
    this.itemsBox = new ItemsBox(this.character, this.onFieldUpdate);
    this.attacks = new Attacks(
      this.character,
      this.onFieldUpdate,
      (index, updated) => {
        this.character.attacks[index] = updated;
        saveCharacterState(this.character);
        const event = new CustomEvent("character-updated");
        document.getElementById("app")?.dispatchEvent(event);
      },
      (index) => {
        this.character.attacks = this.character.attacks.filter((_, i) => i !== index);
        saveCharacterState(this.character);
        const event = new CustomEvent("character-updated");
        document.getElementById("app")?.dispatchEvent(event);
      }
    );
    this.cyphersBox = new CyphersBox(this.character, this.onFieldUpdate);
    this.stats = new Stats(this.character, this.onFieldUpdate);
  }

  render(): TemplateResult {
    // Create stateless components that don't need to preserve state
    const recoveryRolls = new RecoveryRolls(this.character.recoveryRolls);
    const damageTrack = new DamageTrack(this.character.damageTrack);

    // Collection update handlers that save directly to localStorage
    const abilities = new Abilities(
      this.character.abilities,
      (index, updated) => {
        this.character.abilities[index] = updated;
        saveCharacterState(this.character);
        // Trigger re-render via character-updated event
        const event = new CustomEvent("character-updated");
        document.getElementById("app")?.dispatchEvent(event);
      },
      (index) => {
        this.character.abilities.splice(index, 1);
        saveCharacterState(this.character);
        // Trigger re-render via character-updated event
        const event = new CustomEvent("character-updated");
        document.getElementById("app")?.dispatchEvent(event);
      }
    );

    const specialAbilities = new SpecialAbilities(
      this.character.specialAbilities,
      (index, updated) => {
        this.character.specialAbilities[index] = updated;
        saveCharacterState(this.character);
        // Trigger re-render via character-updated event
        const event = new CustomEvent("character-updated");
        document.getElementById("app")?.dispatchEvent(event);
      },
      (index) => {
        this.character.specialAbilities.splice(index, 1);
        saveCharacterState(this.character);
        // Trigger re-render via character-updated event
        const event = new CustomEvent("character-updated");
        document.getElementById("app")?.dispatchEvent(event);
      }
    );

    return html`
      <div class="min-h-screen p-4">
        <div class="max-w-6xl mx-auto shadow rounded-lg p-6 parchment-container">
          ${this.header.render()} ${this.basicInfo.render()} ${this.stats.render()}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            ${recoveryRolls.render()} ${damageTrack.render()}
          </div>
          ${abilities.render()}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${specialAbilities.render()} ${this.attacks.render()}
          </div>
          ${this.cyphersBox.render()} ${this.itemsBox.render()}
          <div data-testid="text-fields-section" class="mt-8">
            ${this.bottomTextFields.render()}
          </div>
        </div>
      </div>
    `;
  }
}
