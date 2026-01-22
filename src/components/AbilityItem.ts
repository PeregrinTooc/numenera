// AbilityItem component - Individual ability card

import { html, TemplateResult } from "lit-html";
import { Ability } from "../types/character.js";

export class AbilityItem {
  constructor(
    private ability: Ability,
    private index: number
  ) {}

  render(): TemplateResult {
    return html`
      <div
        data-testid="ability-item"
        class="ability-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
      >
        <h4
          data-testid="ability-name-${this.index}"
          class="ability-name font-bold text-lg text-indigo-900 mb-2"
        >
          ${this.ability.name}
        </h4>
        <p
          data-testid="ability-description-${this.index}"
          class="ability-description text-gray-700 text-sm leading-relaxed"
        >
          ${this.ability.description}
        </p>
      </div>
    `;
  }
}
