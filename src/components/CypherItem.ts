// CypherItem component - Displays a single cypher card

import { html, TemplateResult } from "lit-html";
import { Cypher } from "../types/character.js";
import { t } from "../i18n/index.js";

export class CypherItem {
  constructor(private cypher: Cypher) {}

  render(): TemplateResult {
    return html`
      <div data-testid="cypher-item" class="border rounded p-3">
        <div class="flex justify-between items-start">
          <div>
            <div data-testid="cypher-name-${this.cypher.name}" class="font-semibold">
              ${this.cypher.name}
            </div>
            <div class="text-sm text-gray-600">${this.cypher.effect}</div>
          </div>
          <div
            data-testid="cypher-level-${this.cypher.name}"
            class="text-sm font-medium bg-gray-100 px-2 py-1 rounded"
          >
            ${t("cyphers.level")}: ${this.cypher.level}
          </div>
        </div>
      </div>
    `;
  }
}
