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
import type { ColumnCount } from "@/types/sectionColumns";

// Two columns only where the section is set to two and the pane is wide enough (see section-columns.css)
const CARD_GRID = "section-card-grid";

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
    columns: ColumnCount;
    listClass: string;
    renderItem: (entry: CollectionDiffEntry<T>) => TemplateResult;
  }
): TemplateResult | typeof nothing {
  if (entries.length === 0) return nothing;
  return html`
    <div class="section-columns ${spec.columns === 2 ? "section-columns-2" : ""}">
      <div data-testid="${spec.testId}" class="section-box">
        <h2 class="section-box-heading">${spec.heading}</h2>
        <div class="${spec.listClass}">${entries.map(spec.renderItem)}</div>
      </div>
    </div>
  `;
}

export function renderCyphersDiff(
  entries: CollectionDiffEntry<Cypher>[],
  columns: ColumnCount
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    columns,
    testId: "cyphers-section",
    heading: t("cyphers.heading"),
    listClass: CARD_GRID,
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
    columns: 1,
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
  entries: CollectionDiffEntry<EquipmentItem>[],
  columns: ColumnCount
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    columns,
    testId: "equipment-section",
    heading: t("equipment.heading"),
    listClass: CARD_GRID,
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
    columns: 1,
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
  entries: CollectionDiffEntry<Attack>[],
  columns: ColumnCount
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    columns,
    testId: "attacks-section",
    heading: t("attacks.title"),
    listClass: CARD_GRID,
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
  entries: CollectionDiffEntry<Ability>[],
  columns: ColumnCount
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    columns,
    testId: "abilities-section",
    heading: t("abilities.heading"),
    listClass: CARD_GRID,
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
  entries: CollectionDiffEntry<SpecialAbility>[],
  columns: ColumnCount
): TemplateResult | typeof nothing {
  return renderCollectionDiff(entries, {
    columns,
    testId: "special-abilities-section",
    heading: t("specialAbilities.title"),
    listClass: CARD_GRID,
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
