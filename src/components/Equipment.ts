// Equipment component - Displays character equipment items

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";
import { EquipmentItem as EquipmentItemType } from "../types/character.js";
import { EquipmentItem } from "./EquipmentItem.js";

export class Equipment {
  constructor(private equipment: EquipmentItemType[]) {}

  render(): TemplateResult {
    const isEmpty = !this.equipment || this.equipment.length === 0;

    if (isEmpty) {
      return html`
        <div class="equipment-section mt-8">
          <h2 class="text-2xl font-serif font-bold mb-4">${t("equipment.heading")} 🎒</h2>
          <div data-testid="empty-equipment" class="empty-equipment-styled">
            ${t("equipment.empty")}
          </div>
        </div>
      `;
    }

    return html`
      <div class="equipment-section mt-8">
        <h2 class="text-2xl font-serif font-bold mb-4">${t("equipment.heading")} 🎒</h2>
        <div class="equipment-list space-y-3" data-testid="equipment-content">
          ${this.equipment.map((item) => {
            const equipmentItem = new EquipmentItem(item);
            return equipmentItem.render();
          })}
        </div>
      </div>
    `;
  }
}
