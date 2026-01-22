// BottomTextFields component - Displays Background and Notes side-by-side

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { TextField } from "./TextField.js";

export class BottomTextFields {
  constructor(private character: Character) {}

  render(): TemplateResult {
    const background = new TextField(this.character.textFields.background, "background");
    const notes = new TextField(this.character.textFields.notes, "notes");

    return html`
      <div data-testid="text-fields-section" class="mt-8">
        <div class="bottom-text-fields">
          <div>${background.render()}</div>
          <div>${notes.render()}</div>
        </div>
      </div>
    `;
  }
}
