// Oddities component - Displays oddities section with list of oddities

import { html, TemplateResult } from "lit-html";
import { OddityItem } from "./OddityItem.js";

export class Oddities {
  constructor(private oddities: string[]) {}

  render(): TemplateResult {
    return html`
      <div data-testid="oddities-section" class="mt-8">
        <h2 data-testid="oddities-heading" class="text-2xl font-bold mb-4">Oddities</h2>
        <div data-testid="oddities-list" class="space-y-2">
          ${this.oddities.length === 0
            ? html`<div
                data-testid="empty-oddities"
                class="text-gray-500 italic p-3 border rounded"
              >
                No oddities
              </div>`
            : this.oddities.map((oddity) => new OddityItem(oddity).render())}
        </div>
      </div>
    `;
  }
}
