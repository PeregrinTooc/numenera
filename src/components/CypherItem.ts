// CypherItem component - Displays a single cypher card

import { html, TemplateResult } from "lit-html";
import { Cypher } from "../types/character.js";
import { t } from "../i18n/index.js";

export class CypherItem {
  constructor(private cypher: Cypher) {}

  render(): TemplateResult {
    return html`
      <div data-testid="cypher-item" class="cypher-item-card">
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <div data-testid="cypher-name-${this.cypher.name}" class="font-semibold text-lg">
              ⚡ ${this.cypher.name}
            </div>
            <div class="text-sm text-gray-700 mt-1">${this.cypher.effect}</div>
          </div>
          <div data-testid="cypher-level-${this.cypher.name}" class="cypher-level-badge ml-3">
            ${t("cyphers.level")}: ${this.cypher.level}
          </div>
        </div>
        <div data-testid="cypher-warning" class="cypher-warning">⚠️ ONE-USE</div>
      </div>
    `;
  }
}
