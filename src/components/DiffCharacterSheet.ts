// DiffCharacterSheet - a static, read-only rendering of one character
// snapshot for Comparison View, with diff highlight classes applied from a
// CharacterDiff. Deliberately NOT built from CharacterSheet's interactive
// component tree: those components take mandatory edit callbacks and some
// reach out via document.querySelector('[data-testid=...]') instead of
// scoping to their own container (e.g. BasicInfo.ts), which would collide
// if two live instances were mounted side by side. This renders its own
// markup instead, reusing the same CSS classes (section-box, *-item-card,
// etc.) so it looks like the real sheet, with no inputs/buttons at all.

import { html, TemplateResult, nothing } from "lit-html";
import type {
  Character,
  Cypher,
  Artifact,
  Ability,
  EquipmentItem,
  Attack,
  SpecialAbility,
} from "../types/character.js";
import type {
  CharacterDiff,
  CollectionDiffEntry,
  CollectionItemStatus,
} from "../utils/characterDiff.js";
import { t } from "../i18n/index.js";

function diffClass(status: CollectionItemStatus): string {
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

function scalarClass(changed: boolean): string {
  return changed ? "diff-modified" : "";
}

export class DiffCharacterSheet {
  constructor(
    private character: Character,
    private diff: CharacterDiff
  ) {}

  private renderBasicInfo(): TemplateResult {
    const c = this.character;
    const d = this.diff.basicInfo;
    return html`
      <div data-testid="basic-info" class="basic-info-card">
        <div class="character-info-content">
          <div data-testid="character-name" class="character-name ${scalarClass(d.name)}">
            ${c.name}
          </div>
          <div class="character-sentence">
            ${t("character.sentence.prefix")}
            <span data-testid="character-tier" class="char-tier ${scalarClass(d.tier)}"
              >${c.tier}</span
            >
            <span
              data-testid="character-descriptor"
              class="char-descriptor ${scalarClass(d.descriptor)}"
              >${c.descriptor || t("character.descriptor")}</span
            >
            <span data-testid="character-type" class="char-type ${scalarClass(d.type)}"
              >${c.type}</span
            >
            ${t("character.sentence.connector")}
            <span data-testid="character-focus" class="char-focus ${scalarClass(d.focus)}"
              >${c.focus || t("character.focus")}</span
            >
          </div>
        </div>
        <div class="character-portrait" data-testid="character-portrait">
          ${c.portrait
            ? html`<img
                src="${c.portrait}"
                alt="${t("character.portrait")}"
                class="portrait-image"
              />`
            : html`<span class="character-portrait-text">${t("character.portrait")}</span>`}
        </div>
      </div>
    `;
  }

  private renderStats(): TemplateResult {
    const c = this.character;
    const d = this.diff.stats;
    const pool = (
      label: string,
      testId: string,
      changed: boolean,
      stat: Character["stats"]["might"]
    ) => html`
      <div data-testid="${testId}" class="stat-pool-box ${scalarClass(changed)}">
        <div class="stat-pool-label">${label}</div>
        <div class="stat-pool-values">
          <span data-testid="${testId}-current">${stat.current}</span> /
          <span data-testid="${testId}-pool">${stat.pool}</span>
          (<span data-testid="${testId}-edge">${t("stats.edge")}: ${stat.edge}</span>)
        </div>
      </div>
    `;
    return html`
      <div data-testid="stats-section" class="section-box">
        <div class="stat-badge badge-top-right" data-testid="effort-badge">
          <span class="stat-badge-value ${scalarClass(this.diff.resources.effort)}"
            >${c.effort}</span
          >
          <span class="stat-badge-label">${t("stats.effort")}</span>
        </div>
        <h2 class="section-box-heading">${t("stats.heading")}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${pool(t("stats.might"), "stat-might", d.might, c.stats.might)}
          ${pool(t("stats.speed"), "stat-speed", d.speed, c.stats.speed)}
          ${pool(t("stats.intellect"), "stat-intellect", d.intellect, c.stats.intellect)}
        </div>
      </div>
    `;
  }

  private renderResources(): TemplateResult {
    const c = this.character;
    const d = this.diff.resources;
    const badge = (label: string, testId: string, value: number | string, changed: boolean) => html`
      <div class="stat-badge ${scalarClass(changed)}" data-testid="${testId}">
        <span class="stat-badge-value">${value}</span>
        <span class="stat-badge-label">${label}</span>
      </div>
    `;
    return html`
      <div data-testid="resources-section" class="section-box">
        <h2 class="section-box-heading">${t("versionHistory.compareView.resourcesHeading")}</h2>
        <div class="flex gap-4 flex-wrap">
          ${badge(t("character.xpCurrent"), "xp-badge-current", c.currentXp, d.xp)}
          ${badge(t("character.xpTotal"), "xp-badge-total", c.totalXp, d.xp)}
          ${badge(t("character.shins"), "shins-badge", c.shins, d.shins)}
          ${badge(t("resourceTracker.armor"), "armor-badge", c.armor, d.armor)}
          ${badge(t("cyphers.max"), "max-cyphers-badge", c.maxCyphers, d.maxCyphers)}
        </div>
      </div>
    `;
  }

  private renderTextFields(): TemplateResult {
    const c = this.character;
    const d = this.diff.textFields;
    return html`
      <div data-testid="text-fields-section" class="section-box">
        <h2 class="section-box-heading">${t("textFields.heading")}</h2>
        <div class="mb-3">
          <h3 class="subsection-heading">${t("textFields.background.label")}</h3>
          <p data-testid="character-background" class="${scalarClass(d.background)}">
            ${c.textFields.background || t("textFields.background.empty")}
          </p>
        </div>
        <div>
          <h3 class="subsection-heading">${t("textFields.notes.label")}</h3>
          <p data-testid="character-notes" class="${scalarClass(d.notes)}">
            ${c.textFields.notes || t("textFields.notes.empty")}
          </p>
        </div>
      </div>
    `;
  }

  private renderCyphers(): TemplateResult | typeof nothing {
    const entries = this.paneEntries(this.diff.collections.cyphers);
    if (entries.length === 0) return nothing;
    return html`
      <div data-testid="cyphers-section" class="section-box">
        <h2 class="section-box-heading">${t("cyphers.heading")}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${entries.map(
            (entry: CollectionDiffEntry<Cypher>) => html`
              <div data-testid="cypher-item" class="cypher-item-card ${diffClass(entry.status)}">
                <div class="font-semibold text-lg">⚡ ${entry.item.name}</div>
                <div class="text-sm text-gray-700 mt-1">${entry.item.effect}</div>
                <div class="cypher-level-badge">${t("cyphers.level")}: ${entry.item.level}</div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderArtifacts(): TemplateResult | typeof nothing {
    const entries = this.paneEntries(this.diff.collections.artifacts);
    if (entries.length === 0) return nothing;
    return html`
      <div data-testid="artifacts-section" class="section-box">
        <h2 class="section-box-heading">${t("artifacts.heading")}</h2>
        <div class="space-y-4">
          ${entries.map(
            (entry: CollectionDiffEntry<Artifact>) => html`
              <div
                data-testid="artifact-item"
                class="artifact-item-card ${diffClass(entry.status)}"
              >
                <div class="artifact-name">${entry.item.name}</div>
                <div class="artifact-effect">${entry.item.effect}</div>
                <div class="artifact-level-badge">${t("artifacts.level")}: ${entry.item.level}</div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderEquipment(): TemplateResult | typeof nothing {
    const entries = this.paneEntries(this.diff.collections.equipment);
    if (entries.length === 0) return nothing;
    return html`
      <div data-testid="equipment-section" class="section-box">
        <h2 class="section-box-heading">${t("equipment.heading")}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${entries.map(
            (entry: CollectionDiffEntry<EquipmentItem>) => html`
              <div
                data-testid="equipment-item"
                class="equipment-item-card ${diffClass(entry.status)}"
              >
                <div class="equipment-name">${entry.item.name}</div>
                ${entry.item.description
                  ? html`<div class="equipment-description">${entry.item.description}</div>`
                  : nothing}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderOddities(): TemplateResult | typeof nothing {
    const entries = this.paneEntries(this.diff.collections.oddities);
    if (entries.length === 0) return nothing;
    return html`
      <div data-testid="oddities-section" class="section-box">
        <h2 class="section-box-heading">${t("oddities.heading")}</h2>
        <div class="space-y-2">
          ${entries.map(
            (entry: CollectionDiffEntry<string>) => html`
              <div data-testid="oddity-item" class="oddity-item-card ${diffClass(entry.status)}">
                ${entry.item}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderAttacks(): TemplateResult | typeof nothing {
    const entries = this.paneEntries(this.diff.collections.attacks);
    if (entries.length === 0) return nothing;
    return html`
      <div data-testid="attacks-section" class="section-box">
        <h2 class="section-box-heading">${t("attacks.title")}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${entries.map(
            (entry: CollectionDiffEntry<Attack>) => html`
              <div data-testid="attack-item" class="attack-item-card ${diffClass(entry.status)}">
                <div class="attack-name font-bold text-lg">${entry.item.name}</div>
                <div class="attack-badges flex gap-2">
                  <span>${t("attacks.damage")}: ${entry.item.damage}</span>
                  <span>${t("attacks.modifier")}: ${entry.item.modifier}</span>
                </div>
                <div>${t("attacks.range")}: ${entry.item.range}</div>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderAbilities(): TemplateResult | typeof nothing {
    const entries = this.paneEntries(this.diff.collections.abilities);
    if (entries.length === 0) return nothing;
    return html`
      <div data-testid="abilities-section" class="section-box">
        <h2 class="section-box-heading">${t("abilities.heading")}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${entries.map(
            (entry: CollectionDiffEntry<Ability>) => html`
              <div data-testid="ability-item" class="ability-item-card ${diffClass(entry.status)}">
                <h4 class="ability-name font-bold text-lg">${entry.item.name}</h4>
                <div class="text-sm text-gray-700">${entry.item.description}</div>
                ${entry.item.cost !== undefined
                  ? html`<span>${t("abilities.cost")}: ${entry.item.cost}</span>`
                  : nothing}
                ${entry.item.pool ? html`<span>${t(`stats.${entry.item.pool}`)}</span>` : nothing}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private renderSpecialAbilities(): TemplateResult | typeof nothing {
    const entries = this.paneEntries(this.diff.collections.specialAbilities);
    if (entries.length === 0) return nothing;
    return html`
      <div data-testid="special-abilities-section" class="section-box">
        <h2 class="section-box-heading">${t("specialAbilities.title")}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${entries.map(
            (entry: CollectionDiffEntry<SpecialAbility>) => html`
              <div
                data-testid="special-ability-item"
                class="special-ability-item-card ${diffClass(entry.status)}"
              >
                <h4 class="special-ability-name font-bold text-lg">${entry.item.name}</h4>
                <span>${entry.item.source}</span>
                <p class="text-sm text-gray-700">${entry.item.description}</p>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  /**
   * Which side of a CollectionDiff this sheet is rendering. Set by the
   * caller via `forSide` before render() is invoked - defaults to "right"
   * (the more common case: the newer/latest-leaning pane).
   */
  private side: "left" | "right" = "right";

  forSide(side: "left" | "right"): this {
    this.side = side;
    return this;
  }

  private paneEntries<T>(collectionDiff: {
    left: CollectionDiffEntry<T>[];
    right: CollectionDiffEntry<T>[];
  }): CollectionDiffEntry<T>[] {
    return this.side === "left" ? collectionDiff.left : collectionDiff.right;
  }

  render(): TemplateResult {
    return html`
      <div data-testid="diff-character-sheet" class="diff-character-sheet">
        ${this.renderBasicInfo()} ${this.renderStats()} ${this.renderResources()}
        ${this.renderCyphers()} ${this.renderArtifacts()} ${this.renderEquipment()}
        ${this.renderOddities()} ${this.renderAttacks()} ${this.renderAbilities()}
        ${this.renderSpecialAbilities()} ${this.renderTextFields()}
      </div>
    `;
  }
}
