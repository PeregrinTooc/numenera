// Attacks component - Displays character attacks in grid

import { html, TemplateResult } from "lit-html";
import { Character, Attack } from "../types/character.js";
import { AttackItem } from "./AttackItem.js";
import { ModalService } from "../services/modalService.js";
import { t } from "../i18n/index.js";

type FieldType = "armor";

export class Attacks {
  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void,
    private onAttackUpdate?: (index: number, updated: Attack) => void,
    private onAttackDelete?: (index: number) => void
  ) {}

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

  private handleAddAttack(): void {
    // Create temporary attack with empty fields
    const tempAttack: Attack = {
      name: "",
      damage: 0,
      modifier: 0,
      range: "",
    };

    // Create temporary AttackItem to leverage its edit UI
    const tempItem = new AttackItem(tempAttack, -1, (updated) => {
      // Add the new attack to the character's attacks array
      if (this.onAttackUpdate) {
        this.character.attacks.push(updated);
        const newIndex = this.character.attacks.length - 1;
        this.onAttackUpdate(newIndex, updated);
      }
    });

    // Open the edit modal with the temporary item's UI
    tempItem.handleEdit();
  }

  render(): TemplateResult {
    const isEmpty = !this.character.attacks || this.character.attacks.length === 0;

    return html`
      <div data-testid="attacks-section" class="mt-8">
        <div class="flex justify-between items-center mb-4">
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-serif font-bold text-gray-700">${t("attacks.title")} ⚔️</h2>
            ${this.onAttackUpdate
              ? html`
                  <button
                    @click=${() => this.handleAddAttack()}
                    class="add-button p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors"
                    data-testid="add-attack-button"
                    aria-label="Add Attack"
                    title="Add Attack"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      />
                    </svg>
                  </button>
                `
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
              <div class="grid grid-cols-1 gap-4">
                ${this.character.attacks.map((attack, index) =>
                  new AttackItem(
                    attack,
                    index,
                    this.onAttackUpdate
                      ? (updated) => this.onAttackUpdate!(index, updated)
                      : undefined,
                    this.onAttackDelete
                      ? () => {
                          this.onAttackDelete!(index);
                        }
                      : undefined
                  ).render()
                )}
              </div>
            `}
      </div>
    `;
  }
}
