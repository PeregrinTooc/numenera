import { html, TemplateResult } from "lit-html";
import { t } from "@/i18n/index";

/**
 * Render the toolbar button that enters or leaves layout edit mode
 */
export function renderEditLayoutButton(isEditMode: boolean, onToggle: () => void): TemplateResult {
  const buttonText = isEditMode ? t("layout.editButton.exit") : t("layout.editButton.edit");
  const buttonClass = isEditMode
    ? "edit-layout-button edit-layout-button--active"
    : "edit-layout-button";

  return html`
    <button
      data-testid="edit-layout-button"
      class=${buttonClass}
      aria-label=${buttonText}
      @click=${() => onToggle()}
    >
      <svg
        class="edit-layout-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
      </svg>
      <span class="edit-layout-text">${buttonText}</span>
    </button>
  `;
}
