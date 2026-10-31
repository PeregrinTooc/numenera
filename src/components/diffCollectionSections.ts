// Collection sections of DiffCharacterSheet: one generic boxed-list renderer
// plus a thin item renderer per collection (cyphers, artifacts, ...).

import { html, TemplateResult, nothing } from "lit-html";
import type {
  Cypher,
  Artifact,
  Ability,
  EquipmentItem,
  Attack,
  SpecialAbility,
} from "@/types/character";
import type { CollectionDiffEntry, CollectionItemStatus } from "@/utils/characterDiff";
import { t } from "@/i18n/index";

const GRID_TWO_COLUMNS = "grid grid-cols-1 md:grid-cols-2 gap-4";

export function diffClass(status: CollectionItemStatus): string {
  switch (status) {
    case "added":
      return "diff-added";
    case "removed":
      return "diff-removed";
    case "modified":
      return "diff-modified";
    default:
      return "";
  }
}

/**
 * One collection section: a boxed heading plus a list of item cards for the
 * given entries. Renders nothing for an empty pane.
 */
export function renderCollectionDiff<T>(
  entries: CollectionDiffEntry<T>[],
  spec: {
    testId: string;
    heading: string;
    listClass: string;
    renderItem: (entry: CollectionDiffEntry<T>) => TemplateResult;
  }
): TemplateResult | typeof nothing {
  if (entries.length === 0) return nothing;
  return html`
    <div data-testid="${spec.testId}" class="section-box">
      <h2 class="section-box-heading">${spec.heading}</h2>
      <div class="${spec.listClass}">${entries.map(spec.renderItem)}</div>
    </div>
  `;
}

export function renderCyphersDiff(
  entries: CollectionDiffEntry<Cypher>[]
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    testId: "cyphers-section",
    heading: t("cyphers.heading"),
    listClass: GRID_TWO_COLUMNS,
    renderItem: (entry) => html`
      <div data-testid="cypher-item" class="cypher-item-card ${diffClass(entry.status)}">
        <div class="font-semibold text-lg">⚡ ${entry.item.name}</div>
        <div class="text-sm text-gray-700 mt-1">${entry.item.effect}</div>
        <div class="cypher-level-badge">${t("cyphers.level")}: ${entry.item.level}</div>
      </div>
    `,
  });
}

export function renderArtifactsDiff(
  entries: CollectionDiffEntry<Artifact>[]
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    testId: "artifacts-section",
    heading: t("artifacts.heading"),
    listClass: "space-y-4",
    renderItem: (entry) => html`
      <div data-testid="artifact-item" class="artifact-item-card ${diffClass(entry.status)}">
        <div class="artifact-name">${entry.item.name}</div>
        <div class="artifact-effect">${entry.item.effect}</div>
        <div class="artifact-level-badge">${t("artifacts.level")}: ${entry.item.level}</div>
      </div>
    `,
  });
}

export function renderEquipmentDiff(
  entries: CollectionDiffEntry<EquipmentItem>[]
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    testId: "equipment-section",
    heading: t("equipment.heading"),
    listClass: GRID_TWO_COLUMNS,
    renderItem: (entry) => html`
      <div data-testid="equipment-item" class="equipment-item-card ${diffClass(entry.status)}">
        <div class="equipment-name">${entry.item.name}</div>
        ${entry.item.description
          ? html`<div class="equipment-description">${entry.item.description}</div>`
          : nothing}
      </div>
    `,
  });
}

export function renderOdditiesDiff(
  entries: CollectionDiffEntry<string>[]
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    testId: "oddities-section",
    heading: t("oddities.heading"),
    listClass: "space-y-2",
    renderItem: (entry) => html`
      <div data-testid="oddity-item" class="oddity-item-card ${diffClass(entry.status)}">
        ${entry.item}
      </div>
    `,
  });
}

export function renderAttacksDiff(
  entries: CollectionDiffEntry<Attack>[]
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    testId: "attacks-section",
    heading: t("attacks.title"),
    listClass: GRID_TWO_COLUMNS,
    renderItem: (entry) => html`
      <div data-testid="attack-item" class="attack-item-card ${diffClass(entry.status)}">
        <div class="attack-name font-bold text-lg">${entry.item.name}</div>
        <div class="attack-badges flex gap-2">
          <span>${t("attacks.damage")}: ${entry.item.damage}</span>
          <span>${t("attacks.modifier")}: ${entry.item.modifier}</span>
        </div>
        <div>${t("attacks.range")}: ${entry.item.range}</div>
      </div>
    `,
  });
}

export function renderAbilitiesDiff(
  entries: CollectionDiffEntry<Ability>[]
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    testId: "abilities-section",
    heading: t("abilities.heading"),
    listClass: GRID_TWO_COLUMNS,
    renderItem: (entry) => html`
      <div data-testid="ability-item" class="ability-item-card ${diffClass(entry.status)}">
        <h4 class="ability-name font-bold text-lg">${entry.item.name}</h4>
        <div class="text-sm text-gray-700">${entry.item.description}</div>
        ${entry.item.cost !== undefined
          ? html`<span>${t("abilities.cost")}: ${entry.item.cost}</span>`
          : nothing}
        ${entry.item.pool ? html`<span>${t(`stats.${entry.item.pool}`)}</span>` : nothing}
      </div>
    `,
  });
}

export function renderSpecialAbilitiesDiff(
  entries: CollectionDiffEntry<SpecialAbility>[]
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    testId: "special-abilities-section",
    heading: t("specialAbilities.title"),
    listClass: GRID_TWO_COLUMNS,
    renderItem: (entry) => html`
      <div
        data-testid="special-ability-item"
        class="special-ability-item-card ${diffClass(entry.status)}"
      >
        <h4 class="special-ability-name font-bold text-lg">${entry.item.name}</h4>
        <span>${entry.item.source}</span>
        <p class="text-sm text-gray-700">${entry.item.description}</p>
      </div>
    `,
  });
}
