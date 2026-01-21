// Header component - Displays page header with Load/Clear buttons

import { html, TemplateResult } from "lit-html";

export class Header {
  constructor(
    private onLoad: () => void,
    private onClear: () => void
  ) {}

  render(): TemplateResult {
    return html`
      <div data-testid="character-header" class="flex justify-between items-center mb-6">
        <h1 data-testid="page-title" class="text-3xl font-bold">Numenera Character Sheet</h1>
        <div class="flex gap-2">
          <button
            data-testid="load-button"
            @click=${this.onLoad}
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow transition-colors"
          >
            Load
          </button>
          <button
            data-testid="clear-button"
            @click=${this.onClear}
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded shadow transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    `;
  }
}
