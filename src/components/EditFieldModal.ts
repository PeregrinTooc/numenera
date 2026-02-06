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

    // Bind additional methods for event handlers
    this.handleInput = this.handleInput.bind(this);
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
    if (this.fieldType === "tier") {
      // Apply tier constraints
      const validated = validateTier(this.inputValue);
      this.onConfirmWithValue(validated);
    } else if (isNumericField(this.fieldType)) {
      // Validate and convert to number
      if (this.validate(this.inputValue)) {
        this.onConfirmWithValue(parseInt(this.inputValue, 10));
      }
    } else {
      // Validate text fields
      if (this.validate(this.inputValue)) {
        this.onConfirmWithValue(this.inputValue.trim());
      }
    }
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
