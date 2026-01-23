// Attacks component - Displays character attacks in grid

import { html, TemplateResult } from "lit-html";
import { Attack } from "../types/character.js";
import { AttackItem } from "./AttackItem.js";
import { t } from "../i18n/index.js";

export class Attacks {
  constructor(
    private attacks: Attack[],
    private armor: number
  ) {}

  render(): TemplateResult {
    const isEmpty = !this.attacks || this.attacks.length === 0;

    return html`
      <div data-testid="attacks-section" class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-serif font-bold text-gray-700">${t("attacks.title")} ⚔️</h2>
          <div
            data-testid="armor-badge"
            class="stat-badge stat-badge-armor flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg shadow-sm"
          >
            <span class="stat-badge-label text-sm font-semibold text-gray-700"
              >${t("resourceTracker.armor")}:</span
            >
            <span data-testid="armor-value" class="stat-badge-value text-lg font-bold text-gray-900"
              >${this.armor}</span
            >
          </div>
        </div>
        ${isEmpty
          ? html`
              <div data-testid="empty-attacks" class="empty-attacks-styled">
                ${t("attacks.empty")}
              </div>
            `
          : html`
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${this.attacks.map((attack, index) => new AttackItem(attack, index).render())}
              </div>
            `}
      </div>
    `;
  }
}
