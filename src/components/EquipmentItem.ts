// EquipmentItem component - Renders a single equipment item with green theme

import { html, TemplateResult } from "lit-html";
import { EquipmentItem as EquipmentItemType } from "../types/character.js";

export class EquipmentItem {
  constructor(private item: EquipmentItemType) {}

  render(): TemplateResult {
    return html`
      <div
        data-testid="equipment-item-${this.item.name}"
        class="equipment-item equipment-item-card"
      >
        <div class="equipment-name">${this.item.name}</div>
        ${this.item.description
          ? html`<div class="equipment-description">${this.item.description}</div>`
          : ""}
      </div>
    `;
  }
}
