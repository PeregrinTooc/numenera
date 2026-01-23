// AbilityItem component - Individual ability card with cost, pool, and action information

import { html, TemplateResult } from "lit-html";
import { Ability } from "../types/character.js";
import { t } from "../i18n/index.js";

export class AbilityItem {
  constructor(
    private ability: Ability,
    private index: number
  ) {}

  private sanitizeForTestId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  render(): TemplateResult {
    const testIdBase = this.sanitizeForTestId(this.ability.name);

    return html`
      <div
        data-testid="ability-item-${testIdBase}"
        class="ability-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
      >
        <div class="ability-header flex justify-between items-start mb-2">
          <h4
            data-testid="ability-name-${this.index}"
            class="ability-name font-bold text-lg text-indigo-900"
          >
            ${this.ability.name}
          </h4>
          <div class="ability-badges flex gap-2">
            ${this.ability.cost !== undefined
              ? html`
                  <span
                    data-testid="ability-cost-${testIdBase}"
                    class="ability-badge ability-cost px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-900"
                    title="${t("abilities.cost")}"
                  >
                    ${this.ability.cost}
                  </span>
                `
              : ""}
            ${this.ability.pool
              ? html`
                  <span
                    data-testid="ability-pool-${testIdBase}"
                    class="ability-badge ability-pool pool-${this.ability
                      .pool} px-2 py-1 rounded text-xs font-semibold"
                  >
                    ${t(`stats.${this.ability.pool}`)}
                  </span>
                `
              : ""}
          </div>
        </div>
        ${this.ability.action
          ? html`
              <div
                data-testid="ability-action-${testIdBase}"
                class="ability-action text-xs text-indigo-600 italic mb-2"
              >
                ${this.ability.action}
              </div>
            `
          : ""}
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
