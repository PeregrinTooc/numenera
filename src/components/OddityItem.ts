// OddityItem component - Displays a single oddity card

import { html, TemplateResult } from "lit-html";

export class OddityItem {
  constructor(private oddity: string) {}

  render(): TemplateResult {
    return html`
      <div data-testid="oddity-item" class="border rounded p-3">
        <div data-testid="oddity-${this.oddity}" class="text-sm">${this.oddity}</div>
      </div>
    `;
  }
}
