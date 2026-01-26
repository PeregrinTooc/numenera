// CardEditorBehavior - Reusable behavior for card editing
// Provides common edit handler and button rendering for all item components

import { html, TemplateResult } from "lit-html";
import { openCardEditModal } from "../CardEditModal.js";
import { t } from "../../i18n/index.js";

/**
 * Configuration for card editor behavior
 */
export interface CardEditorConfig<T> {
  item: T;
  getEditedItem: () => T;
  onUpdate?: (updated: T) => void;
  renderEditableVersion: () => TemplateResult;
  resetEditedItem: () => void;
}

/**
 * Creates a generic edit handler for card items
 * Handles modal opening, confirmation, and cancellation
 */
export function createEditHandler<T>(config: CardEditorConfig<T>): () => void {
  return () => {
    // Reset edited item to current item state
    config.resetEditedItem();

    openCardEditModal({
      content: config.renderEditableVersion(),
      onConfirm: () => {
        if (config.onUpdate) {
          config.onUpdate(config.getEditedItem());
        }
      },
      onCancel: () => {
        // No action needed on cancel
      },
    });
  };
}

/**
 * Button configuration for rendering edit/delete buttons
 */
export interface CardButtonConfig {
  index: number;
  onEdit?: () => void;
  onDelete?: () => void;
  editButtonTestId: string;
  deleteButtonTestId: string;
  colorTheme: "indigo" | "purple" | "green" | "orange" | "blue" | "red";
}

/**
 * Renders edit and delete buttons for a card item
 * Returns a template with consistent styling and behavior
 */
export function renderCardButtons(config: CardButtonConfig): TemplateResult {
  const { colorTheme, onEdit, onDelete, editButtonTestId, deleteButtonTestId } = config;

  return html`
    ${onDelete
      ? html`
          <button
            @click=${() => onDelete()}
            class="absolute top-2 left-2 p-2 text-${colorTheme}-600 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
            data-testid="${deleteButtonTestId}"
            aria-label="${t("cards.delete")}"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        `
      : ""}
    ${onEdit
      ? html`
          <button
            @click=${() => onEdit()}
            class="absolute top-2 right-2 p-2 text-${colorTheme}-600 hover:text-${colorTheme}-800 hover:bg-${colorTheme}-100 rounded-full transition-colors"
            data-testid="${editButtonTestId}"
            aria-label="${t("cards.edit")}"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        `
      : ""}
  `;
}