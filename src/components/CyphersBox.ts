// CyphersBox component - Displays cyphers in a standalone section with max cyphers badge

import { html, TemplateResult } from "lit-html";
import { Cypher } from "../types/character.js";
import { CypherItem } from "./CypherItem.js";
import { t } from "../i18n/index.js";

export class CyphersBox {
  constructor(
    private cyphers: Cypher[],
    private maxCyphers: number
  ) {}

  render(): TemplateResult {
    const cypherItems = this.cyphers.map((cypher) => new CypherItem(cypher));

    return html`
      <div data-testid="cyphers-section" class="section-box">
        <!-- Max Cyphers Badge - top-right corner -->
        <div class="stat-badge badge-top-right">
          <span class="stat-badge-value">${this.cyphers.length}/${this.maxCyphers}</span>
          <span class="stat-badge-label">${t("cyphers.max")}</span>
        </div>

        <h2 data-testid="cyphers-heading" class="section-box-heading">${t("cyphers.heading")}</h2>

        ${this.cyphers.length === 0
          ? html`
              <div data-testid="empty-cyphers" class="empty-cyphers-styled">
                <p>${t("cyphers.empty")}</p>
              </div>
            `
          : html`
              <div data-testid="cyphers-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${cypherItems.map((item) => item.render())}
              </div>
            `}
      </div>
    `;
  }
}
