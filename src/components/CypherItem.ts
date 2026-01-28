// CypherItem component - Displays a single cypher card

import { html, TemplateResult } from "lit-html";
import { Cypher } from "../types/character.js";
import { t } from "../i18n/index.js";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";

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
    return html`
      <div class="card-edit-wrapper">
        <div
          class="cypher-item-card bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("cyphers.name")}
            </label>
            <input
              type="text"
              .value=${this.editedCypher.name}
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.editedCypher.name = target.value;
              }}
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-purple-900 font-semibold"
              placeholder="${t("cyphers.name")}"
              data-testid="edit-cypher-name"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("cyphers.level")}
            </label>
            <input
              type="text"
              .value=${this.editedCypher.level.toString()}
              @input=${(e: Event) => {
                const target = e.target as HTMLInputElement;
                this.editedCypher.level = target.value || "1";
              }}
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-purple-900 font-semibold"
              placeholder="${t("cyphers.level")}"
              data-testid="edit-cypher-level"
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-purple-900 mb-1">
              ${t("cyphers.effect")}
            </label>
            <textarea
              .value=${this.editedCypher.effect}
              @input=${(e: Event) => {
                const target = e.target as HTMLTextAreaElement;
                this.editedCypher.effect = target.value;
              }}
              rows="3"
              class="w-full bg-transparent border-b-2 border-purple-300 focus:border-purple-500 px-2 py-1 text-gray-700"
              placeholder="${t("cyphers.effect")}"
              data-testid="edit-cypher-effect"
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div data-testid="cypher-item" class="cypher-item-card relative">
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
        <div data-testid="cypher-warning" class="cypher-warning">⚠️ ONE-USE</div>
      </div>
    `;
  }
}
