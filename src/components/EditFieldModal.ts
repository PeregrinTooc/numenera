// EditFieldModal component - Modal for editing character fields

import { html, render, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";
/* global KeyboardEvent, Event */
import {
  validateTier,
  validateName,
  validateDescriptor,
  validateFocus,
} from "../utils/validation.js";

type FieldType = "name" | "tier" | "descriptor" | "focus" | "xp" | "shins" | "armor";

interface EditFieldModalConfig {
  fieldType: FieldType;
  currentValue: string | number;
  onConfirm: (newValue: string | number) => void;
  onCancel: () => void;
}

export class EditFieldModal {
  private fieldType: FieldType;
  private currentValue: string;
  private onConfirm: (newValue: string | number) => void;
  private onCancel: () => void;
  private inputValue: string;
  private validationError: string | null = null;

  constructor(config: EditFieldModalConfig) {
    this.fieldType = config.fieldType;
    this.currentValue = String(config.currentValue);
    this.onConfirm = config.onConfirm;
    this.onCancel = config.onCancel;
    this.inputValue = this.currentValue;

    // Bind methods for event handlers
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  private getLabel(): string {
    switch (this.fieldType) {
      case "name":
        return t("modal.edit.name");
      case "tier":
        return t("modal.edit.tier");
      case "descriptor":
        return t("modal.edit.descriptor");
      case "focus":
        return t("modal.edit.focus");
      case "xp":
        return t("modal.edit.xp");
      case "shins":
        return t("modal.edit.shins");
      case "armor":
        return t("modal.edit.armor");
    }
  }

  private getInputType(): string {
    return this.fieldType === "tier" ||
      this.fieldType === "xp" ||
      this.fieldType === "shins" ||
      this.fieldType === "armor"
      ? "number"
      : "text";
  }

  private getInputMode(): string | undefined {
    return this.fieldType === "tier" ||
      this.fieldType === "xp" ||
      this.fieldType === "shins" ||
      this.fieldType === "armor"
      ? "numeric"
      : undefined;
  }

  private validate(value: string): boolean {
    this.validationError = null;

    switch (this.fieldType) {
      case "name": {
        const result = validateName(value);
        if (!result.valid) {
          this.validationError = result.error || null;
        }
        return result.valid;
      }
      case "descriptor": {
        const result = validateDescriptor(value);
        if (!result.valid) {
          this.validationError = result.error || null;
        }
        return result.valid;
      }
      case "focus": {
        const result = validateFocus(value);
        if (!result.valid) {
          this.validationError = result.error || null;
        }
        return result.valid;
      }
      case "tier":
        // Tier validation happens in handleConfirm
        return true;
      case "xp": {
        // XP must be a non-negative integer, max 9999
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0 || num > 9999 || !Number.isInteger(Number(value))) {
          this.validationError = t("validation.xp.invalid");
          return false;
        }
        return true;
      }
      case "shins": {
        // Shins must be a non-negative integer, max 999999
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0 || num > 999999 || !Number.isInteger(Number(value))) {
          this.validationError = t("validation.shins.invalid");
          return false;
        }
        return true;
      }
      case "armor": {
        // Armor must be a non-negative integer, max 10
        const num = parseInt(value, 10);
        if (isNaN(num) || num < 0 || num > 10 || !Number.isInteger(Number(value))) {
          this.validationError = t("validation.armor.invalid");
          return false;
        }
        return true;
      }
    }
  }

  private handleInput(e: Event): void {
    const input = e.target as HTMLInputElement;
    this.inputValue = input.value;

    // For numeric fields, validate immediately to disable button if invalid
    if (this.fieldType === "xp" || this.fieldType === "shins" || this.fieldType === "armor") {
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

  private handleConfirm(): void {
    if (this.fieldType === "tier") {
      // Apply tier constraints
      const validated = validateTier(this.inputValue);
      this.onConfirm(validated);
    } else if (
      this.fieldType === "xp" ||
      this.fieldType === "shins" ||
      this.fieldType === "armor"
    ) {
      // Validate and convert to number
      if (this.validate(this.inputValue)) {
        this.onConfirm(parseInt(this.inputValue, 10));
      }
    } else {
      // Validate text fields
      if (this.validate(this.inputValue)) {
        this.onConfirm(this.inputValue.trim());
      }
    }
  }

  private handleCancel(): void {
    this.onCancel();
  }

  private handleBackdropClick(e: Event): void {
    // Only close if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget) {
      this.handleCancel();
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      this.handleCancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      this.handleConfirm();
    } else if (e.key === "Tab") {
      this.handleTabKey(e);
    }
  }

  private handleTabKey(e: KeyboardEvent): void {
    // Get all focusable elements in the modal
    const modalContent = document.querySelector('[data-testid="edit-modal"]');
    if (!modalContent) return;

    const focusableElements = modalContent.querySelectorAll(
      "input:not([disabled]), button:not([disabled])"
    );
    const focusableArray = Array.from(focusableElements) as HTMLElement[];

    if (focusableArray.length === 0) return;

    const firstElement = focusableArray[0];
    const lastElement = focusableArray[focusableArray.length - 1];
    const activeElement = document.activeElement as HTMLElement;

    // Check if current focus is within our focusable elements
    const currentIndex = focusableArray.indexOf(activeElement);

    // Always trap Tab key when modal is open
    e.preventDefault();

    if (e.shiftKey) {
      // Shift+Tab: moving backwards
      if (currentIndex <= 0) {
        // At or before first element, wrap to last
        lastElement.focus();
      } else {
        // Move to previous element
        focusableArray[currentIndex - 1].focus();
      }
    } else {
      // Tab: moving forwards
      if (currentIndex < 0 || currentIndex >= focusableArray.length - 1) {
        // Not in list or at last element, wrap to first
        firstElement.focus();
      } else {
        // Move to next element
        focusableArray[currentIndex + 1].focus();
      }
    }
  }

  render(): TemplateResult {
    const isValid = this.validate(this.inputValue);
    const inputMode = this.getInputMode();

    return html`
      <div
        class="edit-modal-backdrop"
        @click=${this.handleBackdropClick}
        @keydown=${this.handleKeyDown}
        aria-hidden="true"
        data-testid="modal-backdrop"
      >
        <div
          class="edit-modal-content"
          data-testid="edit-modal"
          role="dialog"
          aria-label=${this.getLabel()}
          aria-modal="true"
        >
          <!-- Input Field -->
          <input
            type=${this.getInputType()}
            class="edit-modal-input ${this.validationError ? "error" : ""}"
            .value=${this.inputValue}
            @input=${this.handleInput}
            inputmode=${inputMode || ""}
            min=${this.fieldType === "tier"
              ? "1"
              : this.fieldType === "xp" || this.fieldType === "shins" || this.fieldType === "armor"
                ? "0"
                : ""}
            max=${this.fieldType === "tier"
              ? "6"
              : this.fieldType === "xp"
                ? "9999"
                : this.fieldType === "shins"
                  ? "999999"
                  : this.fieldType === "armor"
                    ? "10"
                    : ""}
            maxlength=${this.fieldType === "name" || this.fieldType === "focus"
              ? "50"
              : this.fieldType === "descriptor"
                ? "30"
                : ""}
            data-testid="edit-modal-input"
          />

          <!-- Validation Error -->
          ${this.validationError
            ? html`<div class="edit-modal-error">${this.validationError}</div>`
            : ""}

          <!-- Action Buttons -->
          <div class="edit-modal-buttons">
            <!-- Cancel Button -->
            <button
              class="edit-modal-button cancel"
              @click=${this.handleCancel}
              data-testid="modal-cancel-button"
              aria-label=${t("modal.edit.cancel")}
            >
              <!-- X Icon (SVG) -->
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path
                  d="M8 8L16 16M16 8L8 16"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              <span class="button-label">${t("modal.edit.cancel")}</span>
            </button>

            <!-- Confirm Button -->
            <button
              class="edit-modal-button confirm"
              @click=${this.handleConfirm}
              ?disabled=${!isValid}
              data-testid="modal-confirm-button"
              aria-label=${t("modal.edit.confirm")}
            >
              <!-- Checkmark Icon (SVG) -->
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path
                  d="M7 12L10.5 15.5L17 9"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="button-label">${t("modal.edit.confirm")}</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
}
