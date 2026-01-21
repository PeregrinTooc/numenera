// Entry point for the application
// Refactored to use lit-html for template rendering

import { html, render, TemplateResult } from "lit-html";
import { saveCharacterState, loadCharacterState } from "./storage/localStorage";

// Type definitions
type StatPool = { pool: number; edge: number; current: number };
type Cypher = { name: string; level: string; effect: string };
type Artifact = { name: string; level: string; effect: string };

interface Character {
  name: string;
  tier: number;
  type: string;
  descriptor: string;
  focus: string;
  stats: {
    might: StatPool;
    speed: StatPool;
    intellect: StatPool;
  };
  cyphers: Cypher[];
  artifacts: Artifact[];
  oddities: string[];
  textFields: {
    background: string;
    notes: string;
    equipment: string;
    abilities: string;
  };
}

// Character data constants
const FULL_CHARACTER: Character = {
  name: "Kael the Wanderer",
  tier: 3,
  type: "Glaive",
  descriptor: "Strong",
  focus: "Bears a Halo of Fire",
  stats: {
    might: { pool: 15, edge: 2, current: 12 },
    speed: { pool: 12, edge: 1, current: 12 },
    intellect: { pool: 10, edge: 0, current: 8 },
  },
  cyphers: [
    {
      name: "Detonation (Cell)",
      level: "1d6+2",
      effect: "Explodes in an immediate radius",
    },
    {
      name: "Stim (Injector)",
      level: "1d6",
      effect: "Restores 1d6 + 2 points to one Pool",
    },
  ],
  artifacts: [
    {
      name: "Lightning Rod",
      level: "6",
      effect: "Projects lightning bolt up to long range",
    },
  ],
  oddities: [
    "A glowing cube that hums when near water",
    "A piece of transparent metal that's always cold",
  ],
  textFields: {
    background: "Born in a remote village, discovered ancient ruins that changed everything",
    notes: "Currently investigating the mysterious disappearances in the nearby forest",
    equipment: "Medium armor, Broadsword, Explorer's pack, 50 feet of rope",
    abilities: "Trained in intimidation, Specialized in heavy weapons",
  },
};

const EMPTY_CHARACTER: Character = {
  name: "Kael the Wanderer",
  tier: 3,
  type: "Glaive",
  descriptor: "Strong",
  focus: "Bears a Halo of Fire",
  stats: {
    might: { pool: 15, edge: 2, current: 12 },
    speed: { pool: 12, edge: 1, current: 12 },
    intellect: { pool: 10, edge: 0, current: 8 },
  },
  cyphers: [],
  artifacts: [],
  oddities: [],
  textFields: {
    background: "",
    notes: "",
    equipment: "",
    abilities: "",
  },
};

// Template functions

function headerTemplate(): TemplateResult {
  return html`
    <div data-testid="character-header" class="flex justify-between items-center mb-6">
      <h1 data-testid="page-title" class="text-3xl font-bold">Numenera Character Sheet</h1>
      <div class="flex gap-2">
        <button
          data-testid="load-button"
          @click=${() => renderCharacterSheet(FULL_CHARACTER)}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow transition-colors"
        >
          Load
        </button>
        <button
          data-testid="clear-button"
          @click=${() => renderCharacterSheet(EMPTY_CHARACTER)}
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded shadow transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  `;
}

function basicInfoTemplate(character: Character): TemplateResult {
  return html`
    <div data-testid="basic-info" class="space-y-4">
      <div>
        <label data-testid="label-name" class="text-sm font-medium text-gray-700">Name:</label>
        <div data-testid="character-name" class="text-xl font-semibold">${character.name}</div>
      </div>

      <div>
        <label data-testid="label-tier" class="text-sm font-medium text-gray-700">Tier:</label>
        <div data-testid="character-tier" class="text-lg">${character.tier}</div>
      </div>

      <div>
        <label data-testid="label-type" class="text-sm font-medium text-gray-700">Type:</label>
        <div data-testid="character-type" class="text-lg">${character.type}</div>
      </div>

      <div>
        <label data-testid="label-descriptor" class="text-sm font-medium text-gray-700"
          >Descriptor:</label
        >
        <div data-testid="character-descriptor" class="text-lg">${character.descriptor}</div>
      </div>

      <div>
        <label data-testid="label-focus" class="text-sm font-medium text-gray-700">Focus:</label>
        <div data-testid="character-focus" class="text-lg">${character.focus}</div>
      </div>
    </div>
  `;
}

function statPoolTemplate(name: string, stat: StatPool): TemplateResult {
  const nameLower = name.toLowerCase();
  return html`
    <div data-testid="stat-${nameLower}" class="border rounded p-4">
      <h3 data-testid="stat-${nameLower}-label" class="text-lg font-semibold mb-2">${name}</h3>
      <div class="grid grid-cols-3 gap-4">
        <div>
          <label data-testid="label-${nameLower}-pool" class="text-sm text-gray-600">Pool:</label>
          <div data-testid="stat-${nameLower}-pool" class="text-lg font-medium">${stat.pool}</div>
        </div>
        <div>
          <label data-testid="label-${nameLower}-edge" class="text-sm text-gray-600">Edge:</label>
          <div data-testid="stat-${nameLower}-edge" class="text-lg font-medium">${stat.edge}</div>
        </div>
        <div>
          <label data-testid="label-${nameLower}-current" class="text-sm text-gray-600"
            >Current:</label
          >
          <div data-testid="stat-${nameLower}-current" class="text-lg font-medium">
            ${stat.current}
          </div>
        </div>
      </div>
    </div>
  `;
}

function statsTemplate(character: Character): TemplateResult {
  return html`
    <div data-testid="stats-section" class="mt-8">
      <h2 data-testid="stats-heading" class="text-2xl font-bold mb-4">Stats</h2>
      <div class="space-y-4">
        ${statPoolTemplate("Might", character.stats.might)}
        ${statPoolTemplate("Speed", character.stats.speed)}
        ${statPoolTemplate("Intellect", character.stats.intellect)}
      </div>
    </div>
  `;
}

function cypherTemplate(cypher: Cypher): TemplateResult {
  return html`
    <div data-testid="cypher-item" class="border rounded p-3">
      <div class="flex justify-between items-start">
        <div>
          <div data-testid="cypher-name-${cypher.name}" class="font-semibold">${cypher.name}</div>
          <div class="text-sm text-gray-600">${cypher.effect}</div>
        </div>
        <div
          data-testid="cypher-level-${cypher.name}"
          class="text-sm font-medium bg-gray-100 px-2 py-1 rounded"
        >
          Level: ${cypher.level}
        </div>
      </div>
    </div>
  `;
}

function cyphersTemplate(cyphers: Cypher[]): TemplateResult {
  return html`
    <div data-testid="cyphers-section" class="mt-8">
      <h2 data-testid="cyphers-heading" class="text-2xl font-bold mb-4">Cyphers</h2>
      <div data-testid="cyphers-list" class="space-y-3">
        ${cyphers.length === 0
          ? html`<div data-testid="empty-cyphers" class="text-gray-500 italic p-3 border rounded">
              No cyphers
            </div>`
          : cyphers.map((cypher) => cypherTemplate(cypher))}
      </div>
    </div>
  `;
}

function artifactTemplate(artifact: Artifact): TemplateResult {
  return html`
    <div data-testid="artifact-item" class="border rounded p-3">
      <div class="flex justify-between items-start">
        <div>
          <div data-testid="artifact-name-${artifact.name}" class="font-semibold">
            ${artifact.name}
          </div>
          <div class="text-sm text-gray-600">${artifact.effect}</div>
        </div>
        <div
          data-testid="artifact-level-${artifact.name}"
          class="text-sm font-medium bg-gray-100 px-2 py-1 rounded"
        >
          Level: ${artifact.level}
        </div>
      </div>
    </div>
  `;
}

function artifactsTemplate(artifacts: Artifact[]): TemplateResult {
  return html`
    <div data-testid="artifacts-section" class="mt-8">
      <h2 data-testid="artifacts-heading" class="text-2xl font-bold mb-4">Artifacts</h2>
      <div data-testid="artifacts-list" class="space-y-3">
        ${artifacts.length === 0
          ? html`<div data-testid="empty-artifacts" class="text-gray-500 italic p-3 border rounded">
              No artifacts
            </div>`
          : artifacts.map((artifact) => artifactTemplate(artifact))}
      </div>
    </div>
  `;
}

function oddityTemplate(oddity: string): TemplateResult {
  return html`
    <div data-testid="oddity-item" class="border rounded p-3">
      <div data-testid="oddity-${oddity}" class="text-sm">${oddity}</div>
    </div>
  `;
}

function odditiesTemplate(oddities: string[]): TemplateResult {
  return html`
    <div data-testid="oddities-section" class="mt-8">
      <h2 data-testid="oddities-heading" class="text-2xl font-bold mb-4">Oddities</h2>
      <div data-testid="oddities-list" class="space-y-2">
        ${oddities.length === 0
          ? html`<div data-testid="empty-oddities" class="text-gray-500 italic p-3 border rounded">
              No oddities
            </div>`
          : oddities.map((oddity) => oddityTemplate(oddity))}
      </div>
    </div>
  `;
}

function textFieldTemplate(label: string, content: string, fieldName: string): TemplateResult {
  const testId = `text-${fieldName}`;
  const emptyTestId = `empty-${fieldName}`;
  const labelTestId = `label-${fieldName}`;
  const containerTestId = `${fieldName}-container`;

  return html`
    <div data-testid="${containerTestId}">
      <label data-testid="${labelTestId}" class="text-sm font-medium text-gray-700"
        >${label}:</label
      >
      ${!content || content.trim() === ""
        ? html`<div
            data-testid="${emptyTestId}"
            class="text-gray-500 italic p-3 border rounded bg-gray-50"
          >
            No ${fieldName}
          </div>`
        : html`<div data-testid="${testId}" class="mt-1 p-3 border rounded bg-gray-50">
            ${content}
          </div>`}
    </div>
  `;
}

function textFieldsTemplate(character: Character): TemplateResult {
  return html`
    <div data-testid="text-fields-section" class="mt-8">
      <h2 data-testid="text-fields-heading" class="text-2xl font-bold mb-4">Character Details</h2>
      <div class="space-y-4">
        ${textFieldTemplate("Background", character.textFields.background, "background")}
        ${textFieldTemplate("Notes", character.textFields.notes, "notes")}
        ${textFieldTemplate("Equipment", character.textFields.equipment, "equipment")}
        ${textFieldTemplate("Abilities", character.textFields.abilities, "abilities")}
      </div>
    </div>
  `;
}

function characterSheetTemplate(character: Character): TemplateResult {
  return html`
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-4xl mx-auto bg-white shadow rounded-lg p-6">
        ${headerTemplate()} ${basicInfoTemplate(character)} ${statsTemplate(character)}
        ${cyphersTemplate(character.cyphers)} ${artifactsTemplate(character.artifacts)}
        ${odditiesTemplate(character.oddities)} ${textFieldsTemplate(character)}
      </div>
    </div>
  `;
}

// Render the character sheet with the given character data
function renderCharacterSheet(character: Character): void {
  const app = document.getElementById("app");
  if (!app) return;

  // Render using lit-html
  render(characterSheetTemplate(character), app);

  // Save character state to localStorage after rendering
  saveCharacterState(character);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  // Priority: URL param > localStorage > default
  // URL param allows explicit override for testing
  const urlParams = new URLSearchParams(window.location.search);
  const useEmpty = urlParams.get("empty") === "true";
  const storedCharacter = loadCharacterState();

  // Select and render initial character data
  let initialCharacter: Character;
  if (useEmpty) {
    // URL param explicitly requests empty character
    initialCharacter = EMPTY_CHARACTER;
  } else if (storedCharacter) {
    // Load from localStorage if available
    initialCharacter = storedCharacter;
  } else {
    // Default to full character
    initialCharacter = FULL_CHARACTER;
  }

  renderCharacterSheet(initialCharacter);
});
