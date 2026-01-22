// TextField component - Displays a text field with label and parchment styling

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class TextField {
  constructor(
    private value: string,
    private fieldName: string
  ) {}

  render(): TemplateResult {
    const hasValue = this.value && this.value.trim().length > 0;

    return html`
      <div data-testid="${this.fieldName}-container" class="parchment-field">
        <label
          data-testid="label-${this.fieldName}"
          class="block text-sm font-medium text-gray-700 mb-2"
          >${t(`textFields.${this.fieldName}.label`)}</label
        >
        ${hasValue
          ? html`<div data-testid="text-${this.fieldName}" class="text-content">${this.value}</div>`
          : html`<div data-testid="empty-${this.fieldName}" class="empty-text-content">
              ${t(`textFields.${this.fieldName}.empty`)}
            </div>`}
      </div>
    `;
  }
}
