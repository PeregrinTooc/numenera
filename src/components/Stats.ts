// Stats component - Displays all three stat pools
// Arranged side-by-side on tablet/desktop to match official character sheet

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { StatPool } from "./StatPool.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";

type FieldType = "effort";

export class Stats {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {}

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.effort;

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
      },
    });
  }

  render(): TemplateResult {
    const mightPool = new StatPool("might", this.character.stats.might, (field, value) =>
      this.onFieldUpdate(field as any, value)
    );
    const speedPool = new StatPool("speed", this.character.stats.speed, (field, value) =>
      this.onFieldUpdate(field as any, value)
    );
    const intellectPool = new StatPool(
      "intellect",
      this.character.stats.intellect,
      (field, value) => this.onFieldUpdate(field as any, value)
    );

    return html`
      <div data-testid="stats-section" class="section-box">
        <!-- Effort Badge - top-right corner -->
        <div
          data-testid="effort-badge"
          class="stat-badge badge-top-right editable-field"
          @click=${() => this.openEditModal("effort")}
          role="button"
          tabindex="0"
          aria-label="Edit Effort"
        >
          <span data-testid="effort-value" class="stat-badge-value">${this.character.effort}</span>
          <span class="stat-badge-label">${t("stats.effort")}</span>
        </div>

        <h2 data-testid="stats-heading" class="section-box-heading">${t("stats.heading")}</h2>

        <!-- Three stat pools side-by-side on tablet/desktop -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${mightPool.render()} ${speedPool.render()} ${intellectPool.render()}
        </div>
      </div>
    `;
  }
}
