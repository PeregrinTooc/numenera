// CypherItem component - Displays a single cypher card

import { html, TemplateResult } from "lit-html";
import { Cypher } from "@/types/character";
import { t } from "@/i18n/index";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";
import { renderTextArea, renderTextField } from "./helpers/cardFormFields.js";

export class CypherItem {
  private editedCypher: Cypher;
  public handleEdit: () => void;

  constructor(
    private cypher: Cypher,
    private index: number,
    private onUpdate?: (updated: Cypher) => void,
    private onDelete?: () => void
  ) {
    this.editedCypher = { ...cypher };
    this.handleEdit = createEditHandler<Cypher>({
      item: this.cypher,
      getEditedItem: () => this.editedCypher,
      onUpdate: this.onUpdate,
      renderEditableVersion: () => this.renderEditableVersion(),
      resetEditedItem: () => {
        this.editedCypher = { ...this.cypher };
      },
    });
  }

  private renderEditableVersion(): TemplateResult {
    const theme = "purple";
    return html`
      <div class="card-edit-wrapper">
        <div
          class="cypher-item-card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4"
        >
          ${renderTextField({
            theme,
            label: t("cyphers.name"),
            placeholder: t("cyphers.name"),
            testId: "edit-cypher-name",
            value: this.editedCypher.name,
            onInput: (value) => {
              this.editedCypher.name = value;
            },
          })}
          ${renderTextField({
            theme,
            label: t("cyphers.level"),
            placeholder: t("cyphers.level"),
            testId: "edit-cypher-level",
            value: this.editedCypher.level.toString(),
            onInput: (value) => {
              this.editedCypher.level = value || "1";
            },
          })}
          ${renderTextArea({
            theme,
            label: t("cyphers.effect"),
            placeholder: t("cyphers.effect"),
            testId: "edit-cypher-effect",
            value: this.editedCypher.effect,
            onInput: (value) => {
              this.editedCypher.effect = value;
            },
          })}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div
        data-testid="cypher-item"
        data-index="${this.index}"
        class="cypher-item-card relative"
        draggable="true"
      >
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `cypher-edit-button-${this.index}`,
          deleteButtonTestId: `cypher-delete-button-${this.index}`,
          colorTheme: "purple",
        })}
        <div class="flex justify-between items-start mb-2 pr-8 pl-8">
          <div class="flex-1">
            <div data-testid="cypher-name-${this.cypher.name}" class="font-semibold text-lg">
              ⚡ ${this.cypher.name}
            </div>
            <div class="text-sm text-gray-700 mt-1">${this.cypher.effect}</div>
          </div>
          <div data-testid="cypher-level-${this.cypher.name}" class="cypher-level-badge ml-3">
            ${t("cyphers.level")}: ${this.cypher.level}
          </div>
        </div>
        <div data-testid="cypher-warning" class="cypher-warning">⚠️ ${t("cyphers.oneUse")}</div>
      </div>
    `;
  }
}
