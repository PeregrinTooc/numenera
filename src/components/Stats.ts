// Stats component - Displays all three stat pools

import { html, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { StatPool } from "./StatPool.js";

export class Stats {
  constructor(private character: Character) {}

  render(): TemplateResult {
    const mightPool = new StatPool(
      "Might",
      this.character.stats.might.pool,
      this.character.stats.might.edge,
      this.character.stats.might.current
    );
    const speedPool = new StatPool(
      "Speed",
      this.character.stats.speed.pool,
      this.character.stats.speed.edge,
      this.character.stats.speed.current
    );
    const intellectPool = new StatPool(
      "Intellect",
      this.character.stats.intellect.pool,
      this.character.stats.intellect.edge,
      this.character.stats.intellect.current
    );

    return html`
      <div data-testid="stats-section" class="mt-8">
        <h2 data-testid="stats-heading" class="text-2xl font-bold mb-4">Stats</h2>
        <div class="space-y-4">
          ${mightPool.render()} ${speedPool.render()} ${intellectPool.render()}
        </div>
      </div>
    `;
  }
}
