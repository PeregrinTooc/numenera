// StatPool component - Displays a single stat pool (Might, Speed, or Intellect)
// Redesigned to match official Numenera character sheet aesthetic

import { html, TemplateResult } from "lit-html";
import { t } from "../i18n/index.js";

export class StatPool {
  constructor(
    private name: string,
    private pool: number,
    private edge: number,
    private current: number
  ) {}

  render(): TemplateResult {
    const nameLower = this.name.toLowerCase();
    return html`
      <div
        data-testid="stat-${nameLower}"
        class="relative bg-gradient-to-b from-parchment-light to-parchment border-2 border-numenera-secondary rounded-lg p-6 shadow-lg"
      >
        <!-- Stat name - serif, bold, uppercase -->
        <h3
          data-testid="stat-${nameLower}-label"
          class="text-center font-serif text-xl font-bold text-brown-900 mb-4 uppercase tracking-wider"
        >
          ${this.name}
        </h3>

        <!-- Pool value - VERY LARGE, handwritten font -->
        <div class="text-center mb-6 pb-4 border-b border-numenera-secondary/30">
          <div
            data-testid="stat-${nameLower}-pool"
            class="text-7xl font-handwritten font-bold text-numenera-primary leading-none"
          >
            ${this.pool}
          </div>
          <div class="text-xs font-serif text-gray-600 uppercase tracking-wider mt-2">
            ${t("stats.pool")}
          </div>
        </div>

        <!-- Edge and Current - two columns with handwritten values -->
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center">
            <div class="text-xs font-serif text-gray-600 uppercase tracking-wide mb-1">
              <label data-testid="label-${nameLower}-edge">${t("stats.edge")}:</label>
            </div>
            <div
              data-testid="stat-${nameLower}-edge"
              class="text-3xl font-handwritten font-semibold text-numenera-secondary"
            >
              ${this.edge}
            </div>
          </div>
          <div class="text-center">
            <div class="text-xs font-serif text-gray-600 uppercase tracking-wide mb-1">
              <label data-testid="label-${nameLower}-current">${t("stats.current")}:</label>
            </div>
            <div
              data-testid="stat-${nameLower}-current"
              class="text-3xl font-handwritten font-semibold text-numenera-secondary"
            >
              ${this.current}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
