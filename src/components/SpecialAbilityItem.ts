// SpecialAbilityItem component - Individual special ability card with teal styling

import { html, TemplateResult } from "lit-html";
import { SpecialAbility } from "../types/character.js";
import { t } from "../i18n/index.js";
import { sanitizeForTestId } from "../utils/testHelpers.js";

export class SpecialAbilityItem {
  constructor(
    private specialAbility: SpecialAbility,
    private index: number
  ) {}

  render(): TemplateResult {
    const testIdBase = sanitizeForTestId(this.specialAbility.name);

    return html`
      <div
        data-testid="special-ability-item-${testIdBase}"
        class="special-ability-item-card bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-teal-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
      >
        <div class="special-ability-header flex justify-between items-start mb-2">
          <h4
            data-testid="special-ability-name-${this.index}"
            class="special-ability-name font-bold text-lg text-teal-900"
          >
            ${this.specialAbility.name}
          </h4>
          <span
            data-testid="special-ability-source-${testIdBase}"
            class="special-ability-badge px-2 py-1 bg-teal-100 border border-teal-300 rounded text-xs font-semibold text-teal-900"
            title="${t("specialAbilities.source")}"
          >
            ${this.specialAbility.source}
          </span>
        </div>
        <p
          data-testid="special-ability-description-${this.index}"
          class="special-ability-description text-gray-700 text-sm leading-relaxed"
        >
          ${this.specialAbility.description}
        </p>
      </div>
    `;
  }
}
