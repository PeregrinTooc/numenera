// StatPool component - Displays a single stat pool (Might, Speed, or Intellect)
// Redesigned to match official Numenera character sheet aesthetic

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";
import { StatPool as StatPoolType } from "../types/character.js";
import { ModalService } from "../services/modalService.js";

type FieldType =
  | "mightPool"
  | "mightEdge"
  | "mightCurrent"
  | "speedPool"
  | "speedEdge"
  | "speedCurrent"
  | "intellectPool"
  | "intellectEdge"
  | "intellectCurrent";

export class StatPool {
  constructor(
    private statType: "might" | "speed" | "intellect",
    private stats: StatPoolType,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {}

  private openEditModal(fieldName: "pool" | "edge" | "current"): void {
    // Construct the full field type (e.g., "mightPool", "speedEdge", "intellectCurrent")
    const fieldType =
      `${this.statType}${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}` as FieldType;

    // Get the current value for this field
    const currentValue = this.stats[fieldName];

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
      },
    });
  }

  render(): TemplateResult {
    const name = t(`stats.${this.statType}`);
    const nameLower = this.statType;

    return html`
      <div data-testid="stat-${nameLower}" class="stat-pool-card">
        <!-- Stat name - serif, bold -->
        <h3 data-testid="stat-${nameLower}-label" class="stat-pool-label">${name}</h3>

        <!-- Pool value - VERY LARGE, handwritten font -->
        <div class="stat-pool-value-section">
          <div
            data-testid="stat-${nameLower}-pool"
            class="stat-pool-number editable-field"
            @click=${() => this.openEditModal("pool")}
            role="button"
            tabindex="0"
            aria-label="Edit ${name} Pool"
          >
            ${this.stats.pool}
          </div>
          <div class="stat-pool-sublabel">${t("stats.pool")}</div>
        </div>

        <!-- Edge and Current - two columns with handwritten values -->
        <div class="stat-pool-grid">
          <div class="stat-pool-stat">
            <div class="stat-pool-stat-label">
              <label data-testid="label-${nameLower}-edge">${t("stats.edge")}:</label>
            </div>
            <div
              data-testid="stat-${nameLower}-edge"
              class="stat-pool-stat-value editable-field"
              @click=${() => this.openEditModal("edge")}
              role="button"
              tabindex="0"
              aria-label="Edit ${name} Edge"
            >
              ${this.stats.edge}
            </div>
          </div>
          <div class="stat-pool-stat">
            <div class="stat-pool-stat-label">
              <label data-testid="label-${nameLower}-current">${t("stats.current")}:</label>
            </div>
            <div
              data-testid="stat-${nameLower}-current"
              class="stat-pool-stat-value editable-field"
              @click=${() => this.openEditModal("current")}
              role="button"
              tabindex="0"
              aria-label="Edit Current ${name}"
            >
              ${this.stats.current}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
