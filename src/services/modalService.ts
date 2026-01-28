// Modal Service - Centralized modal opening logic
// Eliminates duplicate modal creation code across components

import { render } from "lit-html";
import { EditFieldModal } from "../components/EditFieldModal.js";
import { PortraitDisplayModal } from "../components/PortraitDisplayModal.js";
import { FieldType } from "../utils/unified-validation.js";

export interface ModalConfig {
  fieldType: FieldType;
  currentValue: string | number;
  onConfirm: (newValue: string | number) => void;
  onCancel?: () => void;
}

/**
 * Opens an EditFieldModal for editing a character field
 * Handles modal creation, rendering, and cleanup automatically
 */
export class ModalService {
  static openEditModal(config: ModalConfig): void {
    // Create modal container
    const modalContainer = document.createElement("div");
    document.body.appendChild(modalContainer);

    // Create modal with cleanup callbacks
    const modal = new EditFieldModal({
      fieldType: config.fieldType,
      currentValue: config.currentValue,
      onConfirm: (newValue) => {
        config.onConfirm(newValue);
        this.closeModal(modalContainer);
      },
      onCancel: () => {
        config.onCancel?.();
        this.closeModal(modalContainer);
      },
    });

    // Render modal
    render(modal.render(), modalContainer);

    // Focus and select input after render
    this.focusModalInput(modalContainer);
  }

  /**
   * Focuses the modal input field and selects its content
   */
  private static focusModalInput(modalContainer: HTMLElement): void {
    setTimeout(() => {
      const input = modalContainer.querySelector<HTMLInputElement>(
        '[data-testid="edit-modal-input"]'
      );
      if (input) {
        input.focus();
        input.select();
      }
    }, 0);
  }

  /**
   * Opens a PortraitDisplayModal for viewing a character portrait
   * Handles modal creation, rendering, and cleanup automatically
   */
  static openPortraitModal(portraitSrc: string): void {
    // Create modal container
    const modalContainer = document.createElement("div");
    document.body.appendChild(modalContainer);

    // Create modal with cleanup callback
    const modal = new PortraitDisplayModal({
      portraitSrc,
      onClose: () => {
        this.closeModal(modalContainer);
      },
    });

    // Render modal
    render(modal.render(), modalContainer);

    // Focus the modal for keyboard navigation
    setTimeout(() => {
      const backdrop = modalContainer.querySelector<HTMLElement>(".portrait-display-backdrop");
      if (backdrop) {
        backdrop.focus();
      }
    }, 0);
  }

  /**
   * Closes the modal and removes it from DOM
   */
  private static closeModal(modalContainer: HTMLElement): void {
    if (modalContainer.parentNode) {
      document.body.removeChild(modalContainer);
    }
  }
}
