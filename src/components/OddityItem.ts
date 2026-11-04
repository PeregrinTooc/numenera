import { html, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";
import { renderTextArea } from "./helpers/cardFormFields.js";

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
    const theme = "indigo";
    return html`
      <div class="card-edit-wrapper">
        <div
          class="oddity-item-card bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4"
        >
          ${renderTextArea({
            theme,
            label: t("oddities.oddity"),
            testId: "edit-field-oddity",
            value: this.editedOddity,
            onInput: (value) => {
              this.editedOddity = value;
            },
          })}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div
        data-testid="oddity-item"
        data-index="${this.index}"
        class="oddity-item-card relative"
        draggable="true"
      >
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
