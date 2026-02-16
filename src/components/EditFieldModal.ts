// EditFieldModal component - Modal for editing character fields

import { html, render, TemplateResult } from "lit-html";
import {
  FieldType,
  validateField,
  validateTier,
  getInputType,
  getInputMode,
  getMinValue,
  getMaxValue,
  getMaxLength,
  isNumericField,
} from "../utils/unified-validation.js";
import {
  ModalBehavior,
  FocusTrappingBehavior,
  renderModalButtons,
} from "../services/modalBehavior.js";
import type { VersionHistoryService } from "../services/versionHistoryService.js";
import { CompletionNotifier } from "../utils/completionNotifier.js";

interface EditFieldModalConfig {
  fieldType: FieldType;
  currentValue: string | number;
  onConfirm: (newValue: string | number) => void;
  onCancel: () => void;
  versionHistoryService?: VersionHistoryService;
}

export class EditFieldModal extends ModalBehavior {
  private fieldType: FieldType;
  private currentValue: string;
  private onConfirmWithValue: (newValue: string | number) => void;
  private inputValue: string;
  private validationError: string | null = null;
  private versionHistoryService?: VersionHistoryService;
  private modalNotifier: CompletionNotifier;

  constructor(config: EditFieldModalConfig) {
    super({
      onConfirm: () => this.handleConfirmWithValidation(),
      onCancel: config.onCancel,
    });

    this.fieldType = config.fieldType;
    this.currentValue = String(config.currentValue);
    this.onConfirmWithValue = config.onConfirm;
    this.inputValue = this.currentValue;
    this.versionHistoryService = config.versionHistoryService;

    // Initialize completion notifier for modal events
    this.modalNotifier = new CompletionNotifier("modal", {
      data: { modalType: "field", field: this.fieldType },
    });

    // Bind additional methods for event handlers
    this.handleInput = this.handleInput.bind(this);

    // Emit modal-opened event after construction
    this.modalNotifier.emit("opened", { field: this.fieldType });
  }

  private validate(value: string): boolean {
    this.validationError = null;

    // Special case: tier validation happens on confirm, not during input
    // This allows out-of-range values to be constrained rather than rejected
    if (this.fieldType === "tier") {
      return true;
    }

    // Use centralized validation for other fields
    const result = validateField(this.fieldType, value);
    if (!result.valid) {
      this.validationError = result.error || null;
    }
    return result.valid;
  }

  private handleInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.inputValue = input.value;

    // Reset version history timer on each keystroke
    if (this.versionHistoryService) {
      this.versionHistoryService.resetTimer();
    }

    // For numeric fields, validate immediately to disable button if invalid
    if (isNumericField(this.fieldType)) {
      this.validate(this.inputValue);
    }

    // Trigger re-render to update button state
    this.rerender();
  }

  private rerender(): void {
    // Find the modal container and re-render
    const modalContainer = document.querySelector('[data-testid="modal-backdrop"]')?.parentElement;
    if (modalContainer) {
      // Get currently focused element's testid to restore focus after render
      const focusedTestId = document.activeElement?.getAttribute("data-testid");

      render(this.render(), modalContainer);

      // Restore focus to the same element after re-render
      if (focusedTestId) {
        const elementToFocus = modalContainer.querySelector(
          `[data-testid="${focusedTestId}"]`
        ) as HTMLElement;
        if (elementToFocus) {
          elementToFocus.focus();
        }
      }
    }
  }

  private handleConfirmWithValidation(): void {
    let newValue: string | number;

    if (this.fieldType === "tier") {
      // Apply tier constraints
      newValue = validateTier(this.inputValue);
      this.onConfirmWithValue(newValue);
    } else if (isNumericField(this.fieldType)) {
      // Validate and convert to number
      if (this.validate(this.inputValue)) {
        newValue = parseInt(this.inputValue, 10);
        this.onConfirmWithValue(newValue);
      } else {
        // Validation failed, don't proceed
        return;
      }
    } else {
      // Validate text fields
      if (this.validate(this.inputValue)) {
        newValue = this.inputValue.trim();
        this.onConfirmWithValue(newValue);
      } else {
        // Validation failed, don't proceed
        return;
      }
    }

    // Emit field-edited event
    const fieldNotifier = new CompletionNotifier("field", {
      data: {
        field: this.fieldType,
        oldValue: this.currentValue,
        newValue: newValue,
      },
    });
    fieldNotifier.emit("edited");

    // Emit modal-closed event with confirm action
    this.modalNotifier.emit("closed", { action: "confirm" });
  }

  protected handleCancel(): void {
    // Emit modal-closed event with cancel action
    this.modalNotifier.emit("closed", { action: "cancel" });

    // Call parent cancel handler
    super.handleCancel();
  }

  protected handleKeyDown(e: KeyboardEvent): void {
    // Handle Escape through base class
    super.handleKeyDown(e);

    // Handle Enter key
    if (e.key === "Enter") {
      e.preventDefault();
      this.handleConfirm();
    } else if (e.key === "Tab") {
      FocusTrappingBehavior.handleTabKey(e, '[data-testid="edit-modal"]');
    }
  }

  render(): TemplateResult {
    const isValid = this.validate(this.inputValue);
    const inputType = getInputType(this.fieldType);
    const inputMode = getInputMode(this.fieldType);
    const minValue = getMinValue(this.fieldType);
    const maxValue = getMaxValue(this.fieldType);
    const maxLength = getMaxLength(this.fieldType);

    return html`
      <div
        class="edit-modal-backdrop"
        @click=${this.handleBackdropClick}
        @keydown=${this.handleKeyDown}
        aria-hidden="true"
        data-testid="modal-backdrop"
      >
        <div class="edit-modal-content" data-testid="edit-modal" role="dialog" aria-modal="true">
          <!-- Input Field -->
          <input
            type=${inputType}
            class="edit-modal-input ${this.validationError ? "error" : ""}"
            .value=${this.inputValue}
            @input=${this.handleInput}
            inputmode=${inputMode || ""}
            min=${minValue !== undefined ? String(minValue) : ""}
            max=${maxValue !== undefined ? String(maxValue) : ""}
            maxlength=${maxLength !== undefined ? String(maxLength) : ""}
            data-testid="edit-modal-input"
          />

          <!-- Validation Error -->
          ${this.validationError
            ? html`<div class="edit-modal-error">${this.validationError}</div>`
            : ""}

          <!-- Action Buttons -->
          ${renderModalButtons({
            onConfirm: this.handleConfirm,
            onCancel: this.handleCancel,
            confirmDisabled: !isValid,
          })}
        </div>
      </div>
    `;
  }
}
