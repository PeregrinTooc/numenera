// EquipmentItem component - Renders a single equipment item with green theme

import { html, TemplateResult } from "lit-html";
import { EquipmentItem as EquipmentItemType } from "../types/character.js";
import { t } from "../i18n/index.js";
import { createEditHandler, renderCardButtons } from "./helpers/CardEditorBehavior.js";

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
    return html`
      <div class="card-edit-wrapper">
        <div
          class="equipment-item-card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4"
        >
          <div class="mb-3">
            <label class="block text-sm font-medium text-green-900 mb-1">
              ${t("equipment.name")}
            </label>
            <input
              type="text"
              data-testid="edit-field-name"
              class="w-full bg-transparent border-b-2 border-green-300 focus:border-green-500 px-2 py-1 text-green-900 font-semibold"
              .value=${this.editedItem.name}
              @input=${(e: Event) => {
                this.editedItem.name = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="mb-3">
            <label class="block text-sm font-medium text-green-900 mb-1">
              ${t("equipment.description")}
            </label>
            <textarea
              data-testid="edit-field-description"
              class="w-full bg-transparent border-b-2 border-green-300 focus:border-green-500 px-2 py-1 text-gray-700"
              rows="3"
              .value=${this.editedItem.description || ""}
              @input=${(e: Event) => {
                this.editedItem.description = (e.target as HTMLTextAreaElement).value;
              }}
            ></textarea>
          </div>
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    return html`
      <div
        data-testid="equipment-item-${this.item.name}"
        class="equipment-item equipment-item-card relative"
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
