import { html, TemplateResult } from "lit-html";
import { SpecialAbility } from "@/types/character";
import { t } from "@/i18n/index";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";
import { renderTextArea, renderTextField } from "./helpers/cardFormFields.js";

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
    const theme = "teal";
    return html`
      <div class="card-edit-wrapper">
        <div
          class="special-ability-item-card bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-teal-200 rounded-lg p-4"
        >
          ${renderTextField({
            theme,
            label: t("character.name"),
            testId: "edit-special-ability-name",
            value: this.editedAbility.name,
            onInput: (value) => {
              this.editedAbility.name = value;
            },
          })}
          ${renderTextField({
            theme,
            label: t("specialAbilities.source"),
            testId: "edit-special-ability-source",
            value: this.editedAbility.source,
            onInput: (value) => {
              this.editedAbility.source = value;
            },
          })}
          ${renderTextArea({
            theme,
            label: t("abilities.description"),
            testId: "edit-special-ability-description",
            value: this.editedAbility.description,
            onInput: (value) => {
              this.editedAbility.description = value;
            },
          })}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div
        data-testid="special-ability-item"
        data-index="${this.index}"
        class="special-ability-item-card bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-teal-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-teal-300 transition-all relative pr-8 pl-8"
        draggable="true"
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
            data-testid="special-ability-name-${this.specialAbility.name}"
            class="special-ability-name font-bold text-lg text-teal-900"
          >
            ${this.specialAbility.name}
          </h4>
          <span
            data-testid="special-ability-source-${this.index}"
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
