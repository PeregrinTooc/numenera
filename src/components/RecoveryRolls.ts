import { html, TemplateResult } from "lit-html";
import { RecoveryRolls as RecoveryRollsType } from "../types/character.js";
import { t } from "../i18n/index.js";
import { ModalService } from "../services/modalService.js";
import { getVersionHistoryService } from "../services/versionHistoryServiceAccess.js";

export class RecoveryRolls {
  constructor(
    private data: RecoveryRollsType,
    private onFieldUpdate?: (field: "recoveryModifier", value: number) => void
  ) {
    // Defensive: provide defaults if data is undefined (shouldn't happen with schema v4)
    this.data = data ?? {
      action: false,
      tenMinutes: false,
      oneHour: false,
      tenHours: false,
      modifier: 0,
    };
  }

  private openEditModal(): void {
    if (!this.onFieldUpdate) return;

    ModalService.openEditModal({
      fieldType: "recoveryModifier",
      currentValue: this.data.modifier || 0,
      onConfirm: (newValue) => {
        if (this.onFieldUpdate) {
          this.onFieldUpdate("recoveryModifier", newValue as number);
        }
      },
      versionHistoryService: getVersionHistoryService(),
    });
  }

  render(): TemplateResult {
    const { action, tenMinutes, oneHour, tenHours, modifier } = this.data;

    return html`
      <div
        data-testid="recovery-rolls-section"
        class="recovery-rolls-section bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4 shadow-sm"
      >
        <h3 class="text-lg font-bold font-serif mb-3 text-green-900">${t("recovery.title")}</h3>

        <!-- Recovery Modifier Display -->
        <div class="mb-4 flex items-center gap-2">
          <span class="font-serif text-sm text-green-900">${t("recovery.modifier")}:</span>
          <span
            data-testid="recovery-modifier-display"
            class="font-handwritten text-lg text-green-900 ${this.onFieldUpdate
              ? "editable-field cursor-pointer"
              : ""}"
            @click=${this.onFieldUpdate ? () => this.openEditModal() : null}
            role="${this.onFieldUpdate ? "button" : ""}"
            tabindex="${this.onFieldUpdate ? "0" : ""}"
            aria-label="${this.onFieldUpdate ? "Edit recovery modifier" : ""}"
          >
            1d6 + ${modifier}
          </span>
        </div>

        <!-- Recovery Roll Checkboxes -->
        <div class="space-y-2">
          <!-- Action -->
          <label
            class="flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded transition-colors"
          >
            <input
              type="checkbox"
              data-testid="recovery-action"
              data-recovery-roll="action"
              ?checked=${action}
              class="recovery-checkbox w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
            />
            <span class="font-serif text-sm text-green-900">
              ${t("recovery.action")}
              <span class="text-green-700 text-xs ml-1">(${t("recovery.timeAction")})</span>
            </span>
          </label>

          <!-- Ten Minutes -->
          <label
            class="flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded transition-colors"
          >
            <input
              type="checkbox"
              data-testid="recovery-ten-minutes"
              data-recovery-roll="tenMinutes"
              ?checked=${tenMinutes}
              class="recovery-checkbox w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
            />
            <span class="font-serif text-sm text-green-900">
              ${t("recovery.tenMinutes")}
              <span class="text-green-700 text-xs ml-1">(${t("recovery.time10min")})</span>
            </span>
          </label>

          <!-- One Hour -->
          <label
            class="flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded transition-colors"
          >
            <input
              type="checkbox"
              data-testid="recovery-one-hour"
              data-recovery-roll="oneHour"
              ?checked=${oneHour}
              class="recovery-checkbox w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
            />
            <span class="font-serif text-sm text-green-900">
              ${t("recovery.oneHour")}
              <span class="text-green-700 text-xs ml-1">(${t("recovery.time1hour")})</span>
            </span>
          </label>

          <!-- Ten Hours -->
          <label
            class="flex items-center gap-2 cursor-pointer hover:bg-green-50 p-2 rounded transition-colors"
          >
            <input
              type="checkbox"
              data-testid="recovery-ten-hours"
              data-recovery-roll="tenHours"
              ?checked=${tenHours}
              class="recovery-checkbox w-5 h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
            />
            <span class="font-serif text-sm text-green-900">
              ${t("recovery.tenHours")}
              <span class="text-green-700 text-xs ml-1">(${t("recovery.time10hours")})</span>
            </span>
          </label>
        </div>
      </div>
    `;
  }
}
