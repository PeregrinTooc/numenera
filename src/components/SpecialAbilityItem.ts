// SpecialAbilityItem component - Individual special ability card with teal styling
/* global Event, HTMLTextAreaElement */

import { html, TemplateResult } from "lit-html";
import { SpecialAbility } from "../types/character.js";
import { t } from "../i18n/index.js";
import { sanitizeForTestId } from "../utils/testHelpers.js";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";

export class SpecialAbilityItem {
  private editedAbility: SpecialAbility;
  public handleEdit: () => void;

  constructor(
    private specialAbility: SpecialAbility,
    private index: number,
    private onUpdate?: (updated: SpecialAbility) => void,
    private onDelete?: () => void
  ) {
    this.editedAbility = { ...specialAbility };
    this.handleEdit = createEditHandler<SpecialAbility>({
      item: this.specialAbility,
      getEditedItem: () => this.editedAbility,
      onUpdate: this.onUpdate,
      renderEditableVersion: () => this.renderEditableVersion(),
      resetEditedItem: () => {
        this.editedAbility = { ...this.specialAbility };
      },
    });
  }

  private renderEditableVersion(): TemplateResult {
    return html`
      <div class="card-edit-wrapper">
        <div
          class="special-ability-item-card bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-teal-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-teal-900 mb-1">
              ${t("character.name")}
            </label>
            <input
              type="text"
              .value=${this.editedAbility.name}
              @input=${(e: Event) => {
                this.editedAbility.name = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-teal-300 focus:border-teal-500 px-2 py-1 text-teal-900 font-semibold"
              data-testid="edit-special-ability-name"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-teal-900 mb-1">
              ${t("specialAbilities.source")}
            </label>
            <input
              type="text"
              .value=${this.editedAbility.source}
              @input=${(e: Event) => {
                this.editedAbility.source = (e.target as HTMLInputElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-teal-300 focus:border-teal-500 px-2 py-1 text-teal-900 font-semibold"
              data-testid="edit-special-ability-source"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-teal-900 mb-1">
              ${t("abilities.description")}
            </label>
            <textarea
              .value=${this.editedAbility.description}
              @input=${(e: Event) => {
                this.editedAbility.description = (e.target as HTMLTextAreaElement).value;
              }}
              class="w-full bg-transparent border-b-2 border-teal-300 focus:border-teal-500 px-2 py-1 text-gray-700"
              rows="3"
              data-testid="edit-special-ability-description"
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    const testIdBase = sanitizeForTestId(this.specialAbility.name);

    return html`
      <div
        data-testid="special-ability-item-${testIdBase}"
        class="special-ability-item-card bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-teal-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all relative pr-8 pl-8"
      >
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `special-ability-edit-button-${this.index}`,
          deleteButtonTestId: `special-ability-delete-button-${this.index}`,
          colorTheme: "blue",
        })}

        <div class="special-ability-header flex justify-between items-start mb-2 pr-8">
          <h4
            data-testid="special-ability-name-${this.index}"
            class="special-ability-name font-bold text-lg text-teal-900"
          >
            ${this.specialAbility.name}
          </h4>
          <span
            data-testid="special-ability-source-${testIdBase}"
            class="special-ability-badge px-2 py-1 bg-teal-100 border border-teal-300 rounded text-xs font-semibold text-teal-900"
            title="${t("specialAbilities.source")}"
          >
            ${this.specialAbility.source}
          </span>
        </div>
        <p
          data-testid="special-ability-description-${this.index}"
          class="special-ability-description text-gray-700 text-sm leading-relaxed"
        >
          ${this.specialAbility.description}
        </p>
      </div>
    `;
  }
}
