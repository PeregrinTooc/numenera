// CharacterSheet component - Main container that composes all sections

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { Header } from "./Header.js";
import { BasicInfo } from "./BasicInfo.js";
import { Stats } from "./Stats.js";
import { Abilities } from "./Abilities.js";
import { SpecialAbilities } from "./SpecialAbilities.js";
import { Attacks } from "./Attacks.js";
import { CyphersBox } from "./CyphersBox.js";
import { ItemsBox } from "./ItemsBox.js";
import { BottomTextFields } from "./BottomTextFields.js";

export class CharacterSheet {
  constructor(
    private character: Character,
    private onLoad: () => void,
    private onNew: () => void
  ) {}

  render(): TemplateResult {
    const header = new Header(this.onLoad, this.onNew);
    const basicInfo = new BasicInfo(this.character);
    const stats = new Stats(this.character);
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
    const bottomTextFields = new BottomTextFields(this.character);

    return html`
      <div class="min-h-screen p-4">
        <div class="max-w-6xl mx-auto shadow rounded-lg p-6 parchment-container">
          ${header.render()} ${basicInfo.render()} ${stats.render()} ${abilities.render()}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${specialAbilities.render()} ${attacks.render()}
          </div>
          ${cyphersBox.render()} ${itemsBox.render()} ${bottomTextFields.render()}
        </div>
      </div>
    `;
  }
}
