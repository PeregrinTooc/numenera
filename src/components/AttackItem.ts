// AttackItem component - Individual attack card with combat styling

import { html, TemplateResult } from "lit-html";
import { Attack } from "../types/character.js";
import { t } from "../i18n/index.js";

export class AttackItem {
  constructor(
    private attack: Attack,
    private index: number
  ) {}

  private sanitizeForTestId(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  private formatModifier(modifier: number): string {
    if (modifier > 0) return `+${modifier}`;
    if (modifier === 0) return "0";
    return modifier.toString();
  }

  render(): TemplateResult {
    const testIdBase = this.sanitizeForTestId(this.attack.name);

    return html`
      <div
        data-testid="attack-item-${testIdBase}"
        class="attack-item-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-red-300 transition-all"
      >
        <div class="attack-header flex justify-between items-start mb-2">
          <h4
            data-testid="attack-name-${this.index}"
            class="attack-name font-bold text-lg text-red-900"
          >
            ${this.attack.name}
          </h4>
          <div class="attack-badges flex gap-2">
            <span
              data-testid="attack-damage-${testIdBase}"
              class="attack-badge attack-damage px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-900"
              title="${t("attacks.damage")}"
            >
              ${this.attack.damage}
            </span>
            <span
              data-testid="attack-modifier-${testIdBase}"
              class="attack-badge attack-modifier px-2 py-1 bg-blue-100 border border-blue-300 rounded text-xs font-semibold text-blue-900"
              title="${t("attacks.modifier")}"
            >
              ${this.formatModifier(this.attack.modifier)}
            </span>
          </div>
        </div>
        <div class="attack-info mb-2">
          <span
            data-testid="attack-range-${testIdBase}"
            class="attack-range text-xs text-red-700 font-semibold"
          >
            ${t("attacks.range")}: ${this.attack.range}
          </span>
        </div>
        ${this.attack.notes
          ? html`
              <p
                data-testid="attack-notes-${testIdBase}"
                class="attack-notes text-gray-700 text-sm leading-relaxed"
              >
                ${this.attack.notes}
              </p>
            `
          : ""}
      </div>
    `;
  }
}
