// TextField component - Displays a text field with label and empty state

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class TextField {
  constructor(
    private label: string,
    private value: string,
    private fieldName: string
  ) {}

  render(): TemplateResult {
    const hasValue = this.value && this.value.trim().length > 0;

    return html`
      <div data-testid="${this.fieldName}-container">
        <label
          data-testid="label-${this.fieldName}"
          class="block text-sm font-medium text-gray-700 mb-1"
          >${t(`textFields.${this.fieldName}.label`)}</label
        >
        ${hasValue
          ? html`<div data-testid="text-${this.fieldName}" class="text-sm whitespace-pre-wrap">
              ${this.value}
            </div>`
          : html`<div data-testid="empty-${this.fieldName}" class="text-gray-500 italic text-sm">
              ${t(`textFields.${this.fieldName}.empty`)}
            </div>`}
      </div>
    `;
  }
}
