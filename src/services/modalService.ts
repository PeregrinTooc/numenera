// Modal Service - Centralized modal opening logic
// Eliminates duplicate modal creation code across components

import { render } from "lit-html";
import { EditFieldModal } from "../components/EditFieldModal.js";
import { PortraitDisplayModal } from "../components/PortraitDisplayModal.js";
import { FieldType } from "../utils/unified-validation.js";
import { ModalContainer } from "./modalBehavior.js";
import type { VersionHistoryService } from "./versionHistoryService.js";

export interface ModalConfig {
  fieldType: FieldType;
  currentValue: string | number;
  onConfirm: (newValue: string | number) => void;
  onCancel?: () => void;
  versionHistoryService?: VersionHistoryService;
}

/**
 * Opens an EditFieldModal for editing a character field
 * Handles modal creation, rendering, and cleanup automatically
 */
export class ModalService {
  static openEditModal(config: ModalConfig): void {
    // Create modal container using helper
    const container = new ModalContainer();

    // Create modal with cleanup callbacks
    const modal = new EditFieldModal({
      fieldType: config.fieldType,
      currentValue: config.currentValue,
      onConfirm: (newValue) => {
        config.onConfirm(newValue);
        container.remove();
      },
      onCancel: () => {
        config.onCancel?.();
        container.remove();
      },
      versionHistoryService: config.versionHistoryService,
    });

    // Render modal
    render(modal.render(), container.getElement());

    // Focus and select input after render
    container.focusElement('[data-testid="edit-modal-input"]', true);
  }

  /**
   * Opens a PortraitDisplayModal for viewing a character portrait
   * Handles modal creation, rendering, and cleanup automatically
   */
  static openPortraitModal(portraitSrc: string): void {
    // Create modal container using helper
    const container = new ModalContainer();

    // Create modal with cleanup callback
    const modal = new PortraitDisplayModal({
      portraitSrc,
      onClose: () => {
        container.remove();
      },
    });

    // Render modal
    render(modal.render(), container.getElement());

    // Focus the modal for keyboard navigation
    container.focusElement(".portrait-display-backdrop");
  }
}
