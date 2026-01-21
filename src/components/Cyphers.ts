// Cyphers component - Displays cypher section with list of cyphers

import { html, TemplateResult } from "lit-html";
import { Cypher } from "../types/character.js";
import { CypherItem } from "./CypherItem.js";

export class Cyphers {
  constructor(private cyphers: Cypher[]) {}

  render(): TemplateResult {
    return html`
      <div data-testid="cyphers-section" class="mt-8">
        <h2 data-testid="cyphers-heading" class="text-2xl font-bold mb-4">Cyphers</h2>
        <div data-testid="cyphers-list" class="space-y-3">
          ${this.cyphers.length === 0
            ? html`<div data-testid="empty-cyphers" class="text-gray-500 italic p-3 border rounded">
                No cyphers
              </div>`
            : this.cyphers.map((cypher) => new CypherItem(cypher).render())}
        </div>
      </div>
    `;
  }
}
