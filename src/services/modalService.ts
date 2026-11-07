import { render } from "lit-html";
import { EditFieldModal } from "@/components/EditFieldModal";
import { UnreadableCharacterModal } from "@/components/UnreadableCharacterModal";
import { LayoutChoiceModal } from "@/components/LayoutChoiceModal";
import { PortraitDisplayModal } from "@/components/PortraitDisplayModal";
import { FieldType } from "@/utils/fieldValidation";
import { ModalContainer } from "@/services/modalContainer";
import type { VersionHistoryService } from "./versionHistoryService.js";
import { getVersionHistoryService } from "./versionHistoryServiceAccess.js";

export interface ModalConfig {
  fieldType: FieldType;
  currentValue: string | number;
  onConfirm: (newValue: string | number) => void;
  onCancel?: () => void;
  versionHistoryService?: VersionHistoryService;
}

/** Wraps a choice's handler so the modal closes once it has run. */
function closingAfter(container: ModalContainer): (handler: () => void) => () => void {
  return (handler) => () => {
    handler();
    container.remove();
  };
}

export class ModalService {
  static openEditModal(config: ModalConfig): void {
    const container = new ModalContainer();

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

    render(modal.render(), container.getElement());

    container.focusElement('[data-testid="edit-modal-input"]', true);
  }

  static openPortraitModal(portraitSrc: string): void {
    const container = new ModalContainer();

    const modal = new PortraitDisplayModal({
      portraitSrc,
      onClose: () => {
        container.remove();
      },
    });

    render(modal.render(), container.getElement());

    container.focusElement(".portrait-display-backdrop");
  }

  /**
   * Opens the modal offering a kept copy of an unreadable character.
   * Every choice closes it; the handlers decide what happens to the data.
   */
  static openUnreadableCharacterModal(handlers: {
    onDownload: () => void;
    onDiscard: () => void;
    onLater: () => void;
  }): void {
    const container = new ModalContainer();
    const closeAfter = closingAfter(container);

    const modal = new UnreadableCharacterModal({
      onDownload: closeAfter(handlers.onDownload),
      onDiscard: closeAfter(handlers.onDiscard),
      onLater: closeAfter(handlers.onLater),
    });

    render(modal.render(), container.getElement());
    container.focusElement('[data-testid="unreadable-download-button"]');
  }

  /**
   * Opens the modal asking whether an imported layout replaces the current
   * one. Every choice closes it.
   */
  static openLayoutChoiceModal(handlers: { onKeep: () => void; onUseImported: () => void }): void {
    const container = new ModalContainer();
    const closeAfter = closingAfter(container);

    const modal = new LayoutChoiceModal({
      onKeep: closeAfter(handlers.onKeep),
      onUseImported: closeAfter(handlers.onUseImported),
    });

    render(modal.render(), container.getElement());
    container.focusElement('[data-testid="keep-current-layout"]');
  }
}

/** Open the edit modal for one field and hand the confirmed value to `onConfirm`. */
export function openFieldEditor(
  fieldType: FieldType,
  currentValue: string | number,
  onConfirm: (newValue: string | number) => void
): void {
  ModalService.openEditModal({
    fieldType,
    currentValue,
    onConfirm,
    versionHistoryService: getVersionHistoryService(),
  });
}
