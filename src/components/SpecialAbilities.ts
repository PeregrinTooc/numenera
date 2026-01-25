// SpecialAbilities component - Displays character special abilities in grid

import { html, TemplateResult } from "lit-html";
import { SpecialAbility } from "../types/character.js";
import { SpecialAbilityItem } from "./SpecialAbilityItem.js";
import { t } from "../i18n/index.js";

export class SpecialAbilities {
  constructor(
    private specialAbilities: SpecialAbility[],
    private onUpdate?: (index: number, updated: SpecialAbility) => void
  ) {}

  render(): TemplateResult {
    const isEmpty = !this.specialAbilities || this.specialAbilities.length === 0;

    if (isEmpty) {
      return html`
        <div data-testid="special-abilities-section" class="mt-8">
          <h2 class="text-2xl font-serif font-bold mb-4 text-gray-700">
            ${t("specialAbilities.title")} ✨
          </h2>
          <div data-testid="empty-special-abilities" class="empty-special-abilities-styled">
            ${t("specialAbilities.empty")}
          </div>
        </div>
      `;
    }

    const specialAbilityItems = this.specialAbilities.map((specialAbility, index) =>
      new SpecialAbilityItem(specialAbility, index, (updated) => {
        if (this.onUpdate) {
          this.onUpdate(index, updated);
        }
      }).render()
    );

    return html`
      <div data-testid="special-abilities-section" class="mt-8">
        <h2 class="text-2xl font-serif font-bold mb-4 text-gray-700">
          ${t("specialAbilities.title")} ✨
        </h2>
        <div class="grid grid-cols-1 gap-4">${specialAbilityItems}</div>
      </div>
    `;
  }
}
