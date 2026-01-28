// OddityItem component - Displays a single oddity card

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";

export class OddityItem {
  private editedOddity: string;
  public handleEdit: () => void;

  constructor(
    private oddity: string,
    private index: number,
    private onUpdate?: (updated: string) => void,
    private onDelete?: () => void
  ) {
    this.editedOddity = oddity;
    this.handleEdit = createEditHandler<string>({
      item: this.oddity,
      getEditedItem: () => this.editedOddity,
      onUpdate: this.onUpdate,
      renderEditableVersion: () => this.renderEditableVersion(),
      resetEditedItem: () => {
        this.editedOddity = this.oddity;
      },
    });
  }

  private renderEditableVersion(): TemplateResult {
    return html`
      <div class="card-edit-wrapper">
        <div
          class="oddity-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-indigo-900 mb-1">
              ${t("oddities.oddity")}
            </label>
            <textarea
              data-testid="edit-field-oddity"
              class="w-full bg-transparent border-b-2 border-indigo-300 focus:border-indigo-500 px-2 py-1 text-gray-700"
              rows="3"
              .value=${this.editedOddity}
              @input=${(e: Event) => {
                this.editedOddity = (e.target as HTMLTextAreaElement).value;
              }}
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div data-testid="oddity-item" class="oddity-item-card relative">
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `oddity-edit-button-${this.index}`,
          deleteButtonTestId: `oddity-delete-button-${this.index}`,
          colorTheme: "indigo",
        })}
        <div class="flex justify-between items-start pr-8 pl-8">
          <div data-testid="oddity-${this.oddity}" class="oddity-text flex-1">
            🔮 ${this.oddity}
          </div>
        </div>
      </div>
    `;
  }
}
