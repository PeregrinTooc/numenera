// BasicInfo component - Displays character basic information

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { t } from "../i18n/index.js";

export class BasicInfo {
  constructor(private character: Character) {}

  render(): TemplateResult {
    return html`
      <div data-testid="basic-info" class="basic-info-card">
        <!-- Character info content - left side -->
        <div class="character-info-content">
          <!-- Large character name -->
          <div data-testid="character-name" class="character-name">${this.character.name}</div>

          <!-- Numenera sentence format: "A tier 3 Strong Glaive who Bears a Halo of Fire" -->
          <div class="character-sentence">
            ${t("character.sentence.prefix")}
            <span class="char-tier" data-testid="character-tier">${this.character.tier}</span>
            <span class="char-descriptor" data-testid="character-descriptor"
              >${this.character.descriptor}</span
            >
            <span class="char-type" data-testid="character-type">${this.character.type}</span>
            ${t("character.sentence.connector")}
            <span class="char-focus" data-testid="character-focus">${this.character.focus}</span>
          </div>
        </div>

        <!-- Character portrait - RIGHT side, 3:4 ratio (150×200px) -->
        <div class="character-portrait">
          <span class="character-portrait-text">${t("character.portrait")}</span>
        </div>
      </div>
    `;
  }
}
