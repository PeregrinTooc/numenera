// ItemsSection component - Container for horizontal layout of Cyphers, Artifacts, and Oddities

import { html, TemplateResult } from "lit-html";
import { Cypher, Artifact } from "../types/character.js";
import { Cyphers } from "./Cyphers.js";
import { Artifacts } from "./Artifacts.js";
import { Oddities } from "./Oddities.js";

export class ItemsSection {
  constructor(
    private cyphers: Cypher[],
    private artifacts: Artifact[],
    private oddities: string[]
  ) {}

  render(): TemplateResult {
    const cyphersComponent = new Cyphers(this.cyphers);
    const artifactsComponent = new Artifacts(this.artifacts);
    const odditiesComponent = new Oddities(this.oddities);

    return html`
      <div class="flex flex-col lg:flex-row gap-6 mt-8">
        <div class="flex-1">${cyphersComponent.render()}</div>
        <div class="flex-1">${artifactsComponent.render()}</div>
        <div class="flex-1">${odditiesComponent.render()}</div>
      </div>
    `;
  }
}
