// ItemsSection component - 2x2 grid layout for Equipment, Cyphers, Artifacts, and Oddities

import { html, TemplateResult } from "lit-html";
import { Cypher, Artifact } from "../types/character.js";
import { Equipment } from "./Equipment.js";
import { Cyphers } from "./Cyphers.js";
import { Artifacts } from "./Artifacts.js";
import { Oddities } from "./Oddities.js";

export class ItemsSection {
  constructor(
    private equipment: string,
    private cyphers: Cypher[],
    private artifacts: Artifact[],
    private oddities: string[]
  ) {}

  render(): TemplateResult {
    const equipmentComponent = new Equipment(this.equipment);
    const cyphersComponent = new Cyphers(this.cyphers);
    const artifactsComponent = new Artifacts(this.artifacts);
    const odditiesComponent = new Oddities(this.oddities);

    return html`
      <div class="mt-8">
        <!-- Top row: Equipment | Cyphers -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>${equipmentComponent.render()}</div>
          <div>${cyphersComponent.render()}</div>
        </div>
        <!-- Bottom row: Artifacts | Oddities -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>${artifactsComponent.render()}</div>
          <div>${odditiesComponent.render()}</div>
        </div>
      </div>
    `;
  }
}
