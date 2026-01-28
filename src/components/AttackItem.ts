// AttackItem component - Individual attack card with combat styling

import { html, TemplateResult } from "lit-html";
import { Attack } from "../types/character.js";
import { t } from "../i18n/index.js";
import { sanitizeForTestId } from "../utils/testHelpers.js";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";

export class AttackItem {
  private editedAttack: Attack;
  public handleEdit: () => void;

  constructor(
    private attack: Attack,
    private index: number,
    private onUpdate?: (updated: Attack) => void,
    private onDelete?: () => void
  ) {
    this.editedAttack = { ...attack };
    this.handleEdit = createEditHandler<Attack>({
      item: this.attack,
      getEditedItem: () => this.editedAttack,
      onUpdate: this.onUpdate,
      renderEditableVersion: () => this.renderEditableVersion(),
      resetEditedItem: () => {
        this.editedAttack = { ...this.attack };
      },
    });
  }

  private formatModifier(modifier: number): string {
    if (modifier > 0) return `+${modifier}`;
    if (modifier === 0) return "0";
    return modifier.toString();
  }

  private renderEditableVersion(): TemplateResult {
    return html`
      <div class="card-edit-wrapper">
        <div
          class="attack-item-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-red-900 mb-1">
              ${t("character.name")}
            </label>
            <input
              type="text"
              .value=${this.editedAttack.name}
              @input=${(e: Event) => {
                this.editedAttack.name = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold"
              data-testid="edit-attack-name"
            />
          </div>
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label class="block text-sm font-medium text-red-900 mb-1">
                ${t("attacks.damage")}
              </label>
              <input
                type="number"
                .value=${this.editedAttack.damage.toString()}
                @input=${(e: Event) => {
                  const value = (e.target as HTMLInputElement).value;
                  this.editedAttack.damage = parseInt(value, 10) || 0;
                }}
                class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold"
                data-testid="edit-attack-damage"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-red-900 mb-1">
                ${t("attacks.modifier")}
              </label>
              <input
                type="number"
                .value=${this.editedAttack.modifier.toString()}
                @input=${(e: Event) => {
                  const value = (e.target as HTMLInputElement).value;
                  this.editedAttack.modifier = parseInt(value, 10) || 0;
                }}
                class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold"
                data-testid="edit-attack-modifier"
              />
            </div>
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-red-900 mb-1">
              ${t("attacks.range")}
            </label>
            <input
              type="text"
              .value=${this.editedAttack.range}
              @input=${(e: Event) => {
                this.editedAttack.range = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-red-900 font-semibold"
              data-testid="edit-attack-range"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-red-900 mb-1">
              ${t("attacks.notes")}
            </label>
            <textarea
              .value=${this.editedAttack.notes || ""}
              @input=${(e: Event) => {
                this.editedAttack.notes = (e.target as HTMLTextAreaElement).value || undefined;
              }}
              class="w-full bg-transparent border-b-2 border-red-300 focus:border-red-500 px-2 py-1 text-gray-700"
              rows="2"
              data-testid="edit-attack-notes"
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    const testIdBase = sanitizeForTestId(this.attack.name);

    return html`
      <div
        data-testid="attack-item-${testIdBase}"
        class="attack-item-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-red-300 transition-all relative"
      >
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `attack-edit-button-${this.index}`,
          deleteButtonTestId: `attack-delete-button-${this.index}`,
          colorTheme: "red",
        })}

        <div class="attack-header flex justify-between items-start mb-2 pr-8 pl-8">
          <h4
            data-testid="attack-name-${this.index}"
            class="attack-name font-bold text-lg text-red-900"
          >
            ${this.attack.name}
          </h4>
          <div class="attack-badges flex gap-2">
            <span
              data-testid="attack-damage-${testIdBase}"
              class="attack-badge attack-damage px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-900"
              title="${t("attacks.damage")}"
            >
              ${t("attacks.damage")}: ${this.attack.damage}
            </span>
            <span
              data-testid="attack-modifier-${testIdBase}"
              class="attack-badge attack-modifier px-2 py-1 bg-blue-100 border border-blue-300 rounded text-xs font-semibold text-blue-900"
              title="${t("attacks.modifier")}"
            >
              ${t("attacks.modifier")}: ${this.formatModifier(this.attack.modifier)}
            </span>
          </div>
        </div>
        <div class="attack-info mb-2">
          <span
            data-testid="attack-range-${testIdBase}"
            class="attack-range text-xs text-red-700 font-semibold"
          >
            ${t("attacks.range")}: ${this.attack.range}
          </span>
        </div>
        ${this.attack.notes
          ? html`
              <p
                data-testid="attack-notes-${testIdBase}"
                class="attack-notes text-gray-700 text-sm leading-relaxed"
              >
                ${this.attack.notes}
              </p>
            `
          : ""}
      </div>
    `;
  }
}
