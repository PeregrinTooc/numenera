// Stats component - Displays all three stat pools
// Arranged side-by-side on tablet/desktop to match official character sheet

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { StatPool } from "./StatPool.js";
import { t } from "../i18n/index.js";

export class Stats {
  constructor(private character: Character) {}

  render(): TemplateResult {
    const mightPool = new StatPool(
      t("stats.might"),
      this.character.stats.might.pool,
      this.character.stats.might.edge,
      this.character.stats.might.current
    );
    const speedPool = new StatPool(
      t("stats.speed"),
      this.character.stats.speed.pool,
      this.character.stats.speed.edge,
      this.character.stats.speed.current
    );
    const intellectPool = new StatPool(
      t("stats.intellect"),
      this.character.stats.intellect.pool,
      this.character.stats.intellect.edge,
      this.character.stats.intellect.current
    );

    return html`
      <div data-testid="stats-section" class="section-box">
        <!-- Effort Badge - top-right corner -->
        <div class="stat-badge badge-top-right">
          <span class="stat-badge-value">${this.character.effort}</span>
          <span class="stat-badge-label">${t("stats.effort")}</span>
        </div>

        <h2 data-testid="stats-heading" class="section-box-heading">${t("stats.heading")}</h2>

        <!-- Three stat pools side-by-side on tablet/desktop -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${mightPool.render()} ${speedPool.render()} ${intellectPool.render()}
        </div>
      </div>
    `;
  }
}
