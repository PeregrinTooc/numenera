import { html, TemplateResult } from "lit-html";
import { EquipmentItem as EquipmentItemType } from "@/types/character";
import { t } from "@/i18n/index";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";
import { renderTextArea, renderTextField } from "./helpers/cardFormFields.js";

export class EquipmentItem {
  private editedItem: EquipmentItemType;
  public handleEdit: () => void;

  constructor(
    private item: EquipmentItemType,
    private index: number,
    private onUpdate?: (updated: EquipmentItemType) => void,
    private onDelete?: () => void
  ) {
    this.editedItem = { ...item };
    this.handleEdit = createEditHandler<EquipmentItemType>({
      item: this.item,
      getEditedItem: () => this.editedItem,
      onUpdate: this.onUpdate,
      renderEditableVersion: () => this.renderEditableVersion(),
      resetEditedItem: () => {
        this.editedItem = { ...this.item };
      },
    });
  }

  private renderEditableVersion(): TemplateResult {
    const theme = "green";
    return html`
      <div class="card-edit-wrapper">
        <div
          class="equipment-item-card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4"
        >
          ${renderTextField({
            theme,
            label: t("equipment.name"),
            testId: "edit-field-name",
            value: this.editedItem.name,
            onInput: (value) => {
              this.editedItem.name = value;
            },
          })}
          ${renderTextArea({
            theme,
            label: t("equipment.description"),
            testId: "edit-field-description",
            value: this.editedItem.description || "",
            onInput: (value) => {
              this.editedItem.description = value;
            },
          })}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div
        data-testid="equipment-item"
        data-index="${this.index}"
        class="equipment-item equipment-item-card relative"
        draggable="true"
      >
        ${renderCardButtons({
          index: this.index,
          onEdit: this.onUpdate ? () => this.handleEdit() : undefined,
          onDelete: this.onDelete,
          editButtonTestId: `equipment-edit-button-${this.index}`,
          deleteButtonTestId: `equipment-delete-button-${this.index}`,
          colorTheme: "green",
        })}
        <div class="flex justify-between items-start pr-8 pl-8">
          <div class="flex-1">
            <div class="equipment-name">${this.item.name}</div>
            ${this.item.description
              ? html`<div class="equipment-description">${this.item.description}</div>`
              : ""}
          </div>
        </div>
      </div>
    `;
  }
}
