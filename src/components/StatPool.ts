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
      <div data-testid="stat-${nameLower}" class="stat-pool-card">
        <!-- Stat name - serif, bold -->
        <h3 data-testid="stat-${nameLower}-label" class="stat-pool-label">${this.name}</h3>

        <!-- Pool value - VERY LARGE, handwritten font -->
        <div class="stat-pool-value-section">
          <div data-testid="stat-${nameLower}-pool" class="stat-pool-number">${this.pool}</div>
          <div class="stat-pool-sublabel">${t("stats.pool")}</div>
        </div>

        <!-- Edge and Current - two columns with handwritten values -->
        <div class="stat-pool-grid">
          <div class="stat-pool-stat">
            <div class="stat-pool-stat-label">
              <label data-testid="label-${nameLower}-edge">${t("stats.edge")}:</label>
            </div>
            <div data-testid="stat-${nameLower}-edge" class="stat-pool-stat-value">
              ${this.edge}
            </div>
          </div>
          <div class="stat-pool-stat">
            <div class="stat-pool-stat-label">
              <label data-testid="label-${nameLower}-current">${t("stats.current")}:</label>
            </div>
            <div data-testid="stat-${nameLower}-current" class="stat-pool-stat-value">
              ${this.current}
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
