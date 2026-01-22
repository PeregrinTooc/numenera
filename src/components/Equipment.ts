// Equipment component - Displays character equipment items

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";
import { EquipmentItem } from "../types/character.js";

export class Equipment {
  constructor(private equipment: EquipmentItem[]) {}

  render(): TemplateResult {
    const isEmpty = !this.equipment || this.equipment.length === 0;

    if (isEmpty) {
      return html`
        <div class="equipment-section">
          <h3 class="text-xl font-bold mb-3 text-gray-700">${t("equipment.heading")} 🎒</h3>
          <div
            data-testid="empty-equipment"
            class="empty-equipment-styled border-2 border-dashed border-green-300 rounded-lg p-6 text-center text-gray-500 bg-green-50/30"
          >
            ${t("equipment.empty")}
          </div>
        </div>
      `;
    }

    return html`
      <div class="equipment-section">
        <h3 class="text-xl font-bold mb-3 text-gray-700">${t("equipment.heading")} 🎒</h3>
        <div class="equipment-list space-y-2" data-testid="equipment-content">
          ${this.equipment.map(
            (item) => html`
              <div
                class="equipment-item bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="font-semibold text-green-800">${item.name}</div>
                ${item.description
                  ? html`<div class="text-sm text-gray-600 mt-1">${item.description}</div>`
                  : ""}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }
}
