// TextField component - Displays a single text field with label and empty state

import { html, TemplateResult } from "lit-html";

export class TextField {
  constructor(
    private label: string,
    private content: string,
    private fieldName: string
  ) {}

  render(): TemplateResult {
    const testId = `text-${this.fieldName}`;
    const emptyTestId = `empty-${this.fieldName}`;
    const labelTestId = `label-${this.fieldName}`;
    const containerTestId = `${this.fieldName}-container`;

    return html`
      <div data-testid="${containerTestId}">
        <label data-testid="${labelTestId}" class="text-sm font-medium text-gray-700"
          >${this.label}:</label
        >
        ${!this.content || this.content.trim() === ""
          ? html`<div
              data-testid="${emptyTestId}"
              class="text-gray-500 italic p-3 border rounded bg-gray-50"
            >
              No ${this.fieldName}
            </div>`
          : html`<div data-testid="${testId}" class="mt-1 p-3 border rounded bg-gray-50">
              ${this.content}
            </div>`}
      </div>
    `;
  }
}
