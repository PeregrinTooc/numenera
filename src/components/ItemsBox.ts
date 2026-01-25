// ItemsBox component - Combines Equipment, Artifacts, and Oddities in a single box with Shins badge

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { EquipmentItem } from "./EquipmentItem.js";
import { ArtifactItem } from "./ArtifactItem.js";
import { OddityItem } from "./OddityItem.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";

type FieldType = "shins";

export class ItemsBox {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {}

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.shins;

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
      },
    });
  }

  render(): TemplateResult {
    const equipmentItems = this.character.equipment.map((item) => new EquipmentItem(item));
    const artifactItems = this.character.artifacts.map((artifact) => new ArtifactItem(artifact));
    const oddityItems = this.character.oddities.map((oddity) => new OddityItem(oddity));

    return html`
      <div data-testid="items-section" class="section-box">
        <!-- Shins Badge - top-right corner -->
        <div
          class="stat-badge badge-top-right editable-field"
          data-testid="shins-badge"
          @click=${() => this.openEditModal("shins")}
          role="button"
          tabindex="0"
          aria-label="Edit Shins"
        >
          <span class="stat-badge-value">${this.character.shins}</span>
          <span class="stat-badge-label">${t("character.shins")}</span>
        </div>

        <h2 class="section-box-heading">${t("items.heading")}</h2>

        <!-- Equipment Section (full width) -->
        <div>
          <h3 data-testid="equipment-heading" class="subsection-heading">
            ${t("equipment.heading")}
          </h3>
          ${this.character.equipment.length === 0
            ? html`
                <div data-testid="empty-equipment" class="empty-equipment-styled">
                  <p>${t("equipment.empty")}</p>
                </div>
              `
            : html`
                <div data-testid="equipment-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  ${equipmentItems.map((item) => item.render())}
                </div>
              `}
        </div>

        <!-- Divider -->
        <div class="section-divider"></div>

        <!-- Artifacts and Oddities (two columns) -->
        <div class="two-column-grid">
          <!-- Artifacts Column -->
          <div data-testid="artifacts-section">
            <h3 data-testid="artifacts-heading" class="subsection-heading">
              ${t("artifacts.heading")}
            </h3>
            ${this.character.artifacts.length === 0
              ? html`
                  <div data-testid="empty-artifacts" class="empty-artifacts-styled">
                    <p>${t("artifacts.empty")}</p>
                  </div>
                `
              : html`
                  <div data-testid="artifacts-list" class="space-y-4">
                    ${artifactItems.map((item) => item.render())}
                  </div>
                `}
          </div>

          <!-- Oddities Column -->
          <div data-testid="oddities-section">
            <h3 data-testid="oddities-heading" class="subsection-heading">
              ${t("oddities.heading")}
            </h3>
            ${this.character.oddities.length === 0
              ? html`
                  <div data-testid="empty-oddities" class="empty-oddities-styled">
                    <p>${t("oddities.empty")}</p>
                  </div>
                `
              : html`
                  <div data-testid="oddities-list" class="space-y-3">
                    ${oddityItems.map((item) => item.render())}
                  </div>
                `}
          </div>
        </div>
      </div>
    `;
  }
}
