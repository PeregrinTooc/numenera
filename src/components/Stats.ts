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
      <div data-testid="stats-section" class="mt-8">
        <h2 data-testid="stats-heading" class="text-2xl font-serif font-bold mb-4">
          ${t("stats.heading")}
        </h2>
        <!-- Three stat pools side-by-side on tablet/desktop -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${mightPool.render()} ${speedPool.render()} ${intellectPool.render()}
        </div>
      </div>
    `;
  }
}
