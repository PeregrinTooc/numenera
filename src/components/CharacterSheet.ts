// CharacterSheet component - Main container that composes all sections

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { Header } from "./Header.js";
import { BasicInfo } from "./BasicInfo.js";
import { Stats } from "./Stats.js";
import { Abilities } from "./Abilities.js";
import { ItemsSection } from "./ItemsSection.js";
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
    const itemsSection = new ItemsSection(
      this.character.equipment,
      this.character.cyphers,
      this.character.artifacts,
      this.character.oddities
    );
    const bottomTextFields = new BottomTextFields(this.character);

    return html`
      <div class="min-h-screen p-4">
        <div class="max-w-6xl mx-auto shadow rounded-lg p-6 parchment-container">
          ${header.render()} ${basicInfo.render()} ${stats.render()} ${abilities.render()}
          ${itemsSection.render()} ${bottomTextFields.render()}
        </div>
      </div>
    `;
  }
}
