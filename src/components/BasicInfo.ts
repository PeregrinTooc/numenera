// BasicInfo component - Displays character basic information

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";

export class BasicInfo {
  constructor(private character: Character) {}

  render(): TemplateResult {
    return html`
      <div data-testid="basic-info" class="space-y-4">
        <div>
          <label data-testid="label-name" class="text-sm font-medium text-gray-700">Name:</label>
          <div data-testid="character-name" class="text-xl font-semibold">
            ${this.character.name}
          </div>
        </div>

        <div>
          <label data-testid="label-tier" class="text-sm font-medium text-gray-700">Tier:</label>
          <div data-testid="character-tier" class="text-lg">${this.character.tier}</div>
        </div>

        <div>
          <label data-testid="label-type" class="text-sm font-medium text-gray-700">Type:</label>
          <div data-testid="character-type" class="text-lg">${this.character.type}</div>
        </div>

        <div>
          <label data-testid="label-descriptor" class="text-sm font-medium text-gray-700"
            >Descriptor:</label
          >
          <div data-testid="character-descriptor" class="text-lg">${this.character.descriptor}</div>
        </div>

        <div>
          <label data-testid="label-focus" class="text-sm font-medium text-gray-700">Focus:</label>
          <div data-testid="character-focus" class="text-lg">${this.character.focus}</div>
        </div>
      </div>
    `;
  }
}
