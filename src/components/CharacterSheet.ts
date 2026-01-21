// CharacterSheet component - Main container that composes all sections

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { Header } from "./Header.js";
import { BasicInfo } from "./BasicInfo.js";
import { Stats } from "./Stats.js";
import { Cyphers } from "./Cyphers.js";
import { Artifacts } from "./Artifacts.js";
import { Oddities } from "./Oddities.js";
import { TextFields } from "./TextFields.js";

export class CharacterSheet {
  constructor(
    private character: Character,
    private onLoad: () => void,
    private onClear: () => void
  ) {}

  render(): TemplateResult {
    const header = new Header(this.onLoad, this.onClear);
    const basicInfo = new BasicInfo(this.character);
    const stats = new Stats(this.character);
    const cyphers = new Cyphers(this.character.cyphers);
    const artifacts = new Artifacts(this.character.artifacts);
    const oddities = new Oddities(this.character.oddities);
    const textFields = new TextFields(this.character);

    return html`
      <div class="min-h-screen bg-gray-50 p-4">
        <div class="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
          ${header.render()} ${basicInfo.render()} ${stats.render()} ${cyphers.render()}
          ${artifacts.render()} ${oddities.render()} ${textFields.render()}
        </div>
      </div>
    `;
  }
}
