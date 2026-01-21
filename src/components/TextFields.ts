// TextFields component - Displays character details text fields section

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { TextField } from "./TextField.js";
import { t } from "../i18n/index.js";

export class TextFields {
  constructor(private character: Character) {}

  render(): TemplateResult {
    const background = new TextField(this.character.textFields.background, "background");
    const notes = new TextField(this.character.textFields.notes, "notes");
    const equipment = new TextField(this.character.textFields.equipment, "equipment");
    const abilities = new TextField(this.character.textFields.abilities, "abilities");

    return html`
      <div data-testid="text-fields-section" class="mt-8">
        <h2 data-testid="text-fields-heading" class="text-2xl font-bold mb-4">
          ${t("textFields.heading")}
        </h2>
        <div class="space-y-4">
          ${background.render()} ${notes.render()} ${equipment.render()} ${abilities.render()}
        </div>
      </div>
    `;
  }
}
