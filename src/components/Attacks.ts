// Attacks component - Displays character attacks in grid

import { html, TemplateResult } from "lit-html";
import { Character, Attack } from "../types/character.js";
import { AttackItem } from "./AttackItem.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";
import {
  createAddHandler,
  createItemInstances,
  renderAddButton,
} from "./helpers/CollectionBehavior.js";

type FieldType = "armor";

export class Attacks {
  private handleAddAttack: () => void;

  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void,
    private onAttackUpdate?: (index: number, updated: Attack) => void,
    private onAttackDelete?: (index: number) => void
  ) {
    // Create add handler using CollectionBehavior helper
    this.handleAddAttack = createAddHandler({
      emptyItem: { name: "", damage: 0, modifier: 0, range: "" },
      ItemComponentClass: AttackItem,
      collection: this.character.attacks,
      onUpdate: this.onAttackUpdate,
    });
  }

  private openEditModal(fieldType: FieldType): void {
    const currentValue = this.character.armor;

    ModalService.openEditModal({
      fieldType,
      currentValue,
      onConfirm: (newValue) => {
        this.onFieldUpdate(fieldType, newValue as number);
      },
    });
  }

  render(): TemplateResult {
    const isEmpty = !this.character.attacks || this.character.attacks.length === 0;

    // Create attack item instances using CollectionBehavior helper
    const attackItems = isEmpty
      ? []
      : createItemInstances({
          collection: this.character.attacks,
          ItemComponentClass: AttackItem,
          onUpdate: this.onAttackUpdate,
          onDelete: this.onAttackDelete,
        });

    return html`
      <div data-testid="attacks-section" class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-serif font-bold text-gray-700">${t("attacks.title")} ⚔️</h2>
            ${this.onAttackUpdate
              ? renderAddButton({
                  onClick: this.handleAddAttack,
                  testId: "add-attack-button",
                  colorTheme: "red",
                  ariaLabel: "Add Attack",
                })
              : ""}
          </div>
          <div
            data-testid="armor-badge"
            class="stat-badge stat-badge-armor editable-field flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg shadow-sm"
            @click=${() => this.openEditModal("armor")}
            role="button"
            tabindex="0"
            aria-label="Edit Armor"
          >
            <span class="stat-badge-label text-sm font-semibold text-gray-700"
              >${t("resourceTracker.armor")}:</span
            >
            <span data-testid="armor-value" class="stat-badge-value text-lg font-bold text-gray-900"
              >${this.character.armor}</span
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
              <div class="grid grid-cols-1 gap-4">${attackItems.map((item) => item.render())}</div>
            `}
      </div>
    `;
  }
}
