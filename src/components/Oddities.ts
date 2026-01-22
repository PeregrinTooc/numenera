// Oddities component - Displays oddities section with list of oddities

import { html, TemplateResult } from "lit-html";
import { OddityItem } from "./OddityItem.js";
import { t } from "../i18n/index.js";

export class Oddities {
  constructor(private oddities: string[]) {}

  render(): TemplateResult {
    return html`
      <div data-testid="oddities-section" class="mt-8">
        <h2 data-testid="oddities-heading" class="text-2xl font-bold mb-4">
          ${t("oddities.heading")}
        </h2>
        <div data-testid="oddities-list" class="space-y-2">
          ${this.oddities.length === 0
            ? html`<div data-testid="empty-oddities" class="empty-oddities-styled">
                ${t("oddities.empty")}
              </div>`
            : this.oddities.map((oddity) => new OddityItem(oddity).render())}
        </div>
      </div>
    `;
  }
}
