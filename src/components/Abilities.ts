// Abilities component - Displays character abilities in two-column grid

import { html, TemplateResult } from "lit-html";
import { Ability } from "../types/character.js";
import { AbilityItem } from "./AbilityItem.js";
import { t } from "../i18n/index.js";

export class Abilities {
  constructor(private abilities: Ability[]) {}

  render(): TemplateResult {
    const isEmpty = this.abilities.length === 0;

    if (isEmpty) {
      return html`
        <div data-testid="abilities-section" class="mt-8">
          <h2 class="text-2xl font-serif font-bold mb-4 text-gray-700">
            ${t("abilities.heading")} ⚡
          </h2>
          <div data-testid="empty-abilities" class="empty-abilities-styled">
            ${t("abilities.empty")}
          </div>
        </div>
      `;
    }

    const abilityItems = this.abilities.map((ability, index) =>
      new AbilityItem(ability, index).render()
    );

    return html`
      <div data-testid="abilities-section" class="mt-8">
        <h2 class="text-2xl font-serif font-bold mb-4 text-gray-700">
          ${t("abilities.heading")} ⚡
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${abilityItems}</div>
      </div>
    `;
  }
}
