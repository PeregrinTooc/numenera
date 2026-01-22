// Equipment component - Displays character equipment as a text field with light blue theme

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class Equipment {
  constructor(private equipment: string) {}

  render(): TemplateResult {
    const isEmpty = !this.equipment || this.equipment.trim() === "";

    if (isEmpty) {
      return html`
        <div class="equipment-section">
          <h3 class="text-xl font-bold mb-3 text-gray-700">${t("equipment.heading")} 🎒</h3>
          <div
            data-testid="empty-equipment"
            class="empty-equipment-styled border-2 border-dashed border-blue-300 rounded-lg p-6 text-center text-gray-500 bg-blue-50/30"
          >
            ${t("equipment.empty")}
          </div>
        </div>
      `;
    }

    return html`
      <div class="equipment-section">
        <h3 class="text-xl font-bold mb-3 text-gray-700">${t("equipment.heading")} 🎒</h3>
        <div
          data-testid="equipment-content"
          class="equipment-card bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">${this.equipment}</p>
        </div>
      </div>
    `;
  }
}
