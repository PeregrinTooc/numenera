import { render } from "lit-html";
import { EditFieldModal } from "@/components/EditFieldModal";
import { UnreadableCharacterModal } from "@/components/UnreadableCharacterModal";
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
    const closeAfter = (handler: () => void) => () => {
      handler();
      container.remove();
    };

    const modal = new UnreadableCharacterModal({
      onDownload: closeAfter(handlers.onDownload),
      onDiscard: closeAfter(handlers.onDiscard),
      onLater: closeAfter(handlers.onLater),
    });

    render(modal.render(), container.getElement());
    container.focusElement('[data-testid="unreadable-download-button"]');
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
