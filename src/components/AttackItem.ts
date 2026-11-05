import { html, TemplateResult } from "lit-html";
import { Attack } from "@/types/character";
import { t } from "@/i18n/index";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";
import { renderTextArea, renderTextField } from "./helpers/cardFormFields.js";

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
    const theme = "red";
    return html`
      <div class="card-edit-wrapper">
        <div
          class="attack-item-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4"
        >
          ${renderTextField({
            theme,
            label: t("character.name"),
            testId: "edit-attack-name",
            value: this.editedAttack.name,
            onInput: (value) => {
              this.editedAttack.name = value;
            },
          })}
          <div class="grid grid-cols-2 gap-3 mb-3">
            ${renderTextField({
              theme,
              grid: true,
              type: "number",
              label: t("attacks.damage"),
              testId: "edit-attack-damage",
              value: this.editedAttack.damage.toString(),
              onInput: (value) => {
                this.editedAttack.damage = parseInt(value, 10) || 0;
              },
            })}
            ${renderTextField({
              theme,
              grid: true,
              type: "number",
              label: t("attacks.modifier"),
              testId: "edit-attack-modifier",
              value: this.editedAttack.modifier.toString(),
              onInput: (value) => {
                this.editedAttack.modifier = parseInt(value, 10) || 0;
              },
            })}
          </div>
          ${renderTextField({
            theme,
            label: t("attacks.range"),
            testId: "edit-attack-range",
            value: this.editedAttack.range,
            onInput: (value) => {
              this.editedAttack.range = value;
            },
          })}
          ${renderTextArea({
            theme,
            rows: 2,
            label: t("attacks.notes"),
            testId: "edit-attack-notes",
            value: this.editedAttack.notes || "",
            onInput: (value) => {
              this.editedAttack.notes = value || undefined;
            },
          })}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div
        data-testid="attack-item"
        data-index="${this.index}"
        class="attack-item-card bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-red-300 transition-all relative"
        draggable="true"
      >
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `attack-edit-button-${this.index}`,
          deleteButtonTestId: `attack-delete-button-${this.index}`,
          colorTheme: "red",
        })}

        <div class="attack-header flex flex-wrap justify-between items-start gap-2 mb-2 pr-8 pl-8">
          <h4
            data-testid="attack-name-${this.attack.name}"
            class="attack-name min-w-0 font-bold text-lg text-red-900"
          >
            ${this.attack.name}
          </h4>
          <div class="attack-badges ml-auto flex gap-2">
            <span
              data-testid="attack-damage-${this.index}"
              class="attack-badge attack-damage px-2 py-1 bg-amber-100 border border-amber-300 rounded text-xs font-semibold text-amber-900"
              title="${t("attacks.damage")}"
            >
              ${t("attacks.damage")}: ${this.attack.damage}
            </span>
            <span
              data-testid="attack-modifier-${this.index}"
              class="attack-badge attack-modifier px-2 py-1 bg-blue-100 border border-blue-300 rounded text-xs font-semibold text-blue-900"
              title="${t("attacks.modifier")}"
            >
              ${t("attacks.modifier")}: ${this.formatModifier(this.attack.modifier)}
            </span>
          </div>
        </div>
        <div class="attack-info mb-2">
          <span
            data-testid="attack-range-${this.index}"
            class="attack-range text-xs text-red-700 font-semibold"
          >
            ${t("attacks.range")}: ${this.attack.range}
          </span>
        </div>
        ${this.attack.notes
          ? html`
              <p
                data-testid="attack-notes-${this.index}"
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
