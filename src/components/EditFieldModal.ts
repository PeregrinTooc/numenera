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
} from "@/utils/fieldValidation";
import { ModalBehavior, renderModalButtons } from "@/services/modalBehavior";
import { FocusTrappingBehavior } from "@/services/focusTrappingBehavior";
import type { VersionHistoryService } from "@/services/versionHistoryService";

interface EditFieldModalConfig {
  fieldType: FieldType;
  currentValue: string | number;
  onConfirm: (newValue: string | number) => void;
  onCancel: () => void;
  versionHistoryService?: VersionHistoryService;
}

/** Focus the element with the given testid again after a re-render replaced it. */
function restoreFocus(container: Element, testId: string | null | undefined): void {
  if (!testId) return;
  container.querySelector<HTMLElement>(`[data-testid="${testId}"]`)?.focus();
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

    this.handleInput = this.handleInput.bind(this);
  }

  private validate(value: string): boolean {
    this.validationError = null;

    // Special case: tier validation happens on confirm, not during input
    // This allows out-of-range values to be constrained rather than rejected
    if (this.fieldType === "tier") {
      return true;
    }

    const result = validateField(this.fieldType, value);
    if (!result.valid) {
      this.validationError = result.error || null;
    }
    return result.valid;
  }

  private handleInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.inputValue = input.value;

    if (this.versionHistoryService) {
      this.versionHistoryService.resetTimer();
    }

    if (isNumericField(this.fieldType)) {
      this.validate(this.inputValue);
    }

    this.rerender();
  }

  private rerender(): void {
    const modalContainer = document.querySelector('[data-testid="modal-backdrop"]')?.parentElement;
    if (modalContainer) {
      const focusedTestId = document.activeElement?.getAttribute("data-testid");
      render(this.render(), modalContainer);
      restoreFocus(modalContainer, focusedTestId);
    }
  }

  /** The validated, converted input value, or null when it is invalid (the error is shown). */
  private parseConfirmedValue(): string | number | null {
    if (this.fieldType === "tier") {
      return validateTier(this.inputValue);
    }
    if (!this.validate(this.inputValue)) {
      return null;
    }
    return isNumericField(this.fieldType) ? parseInt(this.inputValue, 10) : this.inputValue.trim();
  }

  private handleConfirmWithValidation(): void {
    const value = this.parseConfirmedValue();
    if (value !== null) {
      this.onConfirmWithValue(value);
    }
  }

  protected handleKeyDown(e: KeyboardEvent): void {
    super.handleKeyDown(e);

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

          ${this.validationError
            ? html`<div class="edit-modal-error">${this.validationError}</div>`
            : ""}
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
