// OddityItem component - Displays a single oddity card

import { html, TemplateResult } from "lit-html";

export class OddityItem {
  constructor(private oddity: string) {}

  render(): TemplateResult {
    return html`
      <div data-testid="oddity-item" class="oddity-item-card">
        <div data-testid="oddity-${this.oddity}" class="oddity-text">🔮 ${this.oddity}</div>
      </div>
    `;
  }
}
