import { html, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { EquipmentItem } from "./EquipmentItem.js";
import { ArtifactItem } from "./ArtifactItem.js";
import { OddityItem } from "./OddityItem.js";
import { openFieldEditor } from "@/services/modalService";
import { t } from "@/i18n/index";
import { CollectionSection } from "./helpers/CollectionBehavior.js";
import {
  AddButtonColorTheme,
  EmptyStateConfig,
  renderAddButton,
  renderCollection,
} from "./helpers/collectionRendering.js";
import { CollectionDragReorder } from "./helpers/CollectionDragReorder.js";

type FieldType = "shins";
type ItemSection = "equipment" | "artifacts" | "oddities";

/** What differs between the three sections when rendering heading, add button and list. */
interface SectionView {
  section: ItemSection;
  headingTestId: string;
  addButtonTestId: string;
  colorTheme: AddButtonColorTheme;
  heading: string;
  addLabel: string;
  emptyMessage: string;
  emptyState: Omit<EmptyStateConfig, "message">;
  listTestId: string;
  listClassName: string;
}

function sectionViews(): Record<ItemSection, SectionView> {
  return {
    equipment: {
      section: "equipment",
      headingTestId: "equipment-heading",
      addButtonTestId: "add-equipment-button",
      colorTheme: "green",
      heading: t("equipment.heading"),
      addLabel: t("equipment.add"),
      emptyMessage: t("equipment.empty"),
      emptyState: {
        testId: "empty-equipment",
        className: "empty-equipment-styled",
        paragraph: true,
      },
      listTestId: "equipment-list",
      listClassName: "section-card-grid",
    },
    artifacts: {
      section: "artifacts",
      headingTestId: "artifacts-heading",
      addButtonTestId: "add-artifact-button",
      colorTheme: "purple",
      heading: t("artifacts.heading"),
      addLabel: t("artifacts.add"),
      emptyMessage: t("artifacts.empty"),
      emptyState: {
        testId: "empty-artifacts",
        className: "empty-artifacts-styled",
        paragraph: true,
      },
      listTestId: "artifacts-list",
      listClassName: "space-y-4",
    },
    oddities: {
      section: "oddities",
      headingTestId: "oddities-heading",
      addButtonTestId: "add-oddity-button",
      colorTheme: "indigo",
      heading: t("oddities.heading"),
      addLabel: t("oddities.add"),
      emptyMessage: t("oddities.empty"),
      emptyState: { testId: "empty-oddities", className: "empty-oddities-styled", paragraph: true },
      listTestId: "oddities-list",
      listClassName: "space-y-3",
    },
  };
}

export class ItemsBox {
  private equipment: CollectionSection<Character["equipment"][number], EquipmentItem>;
  private artifacts: CollectionSection<Character["artifacts"][number], ArtifactItem>;
  private oddities: CollectionSection<Character["oddities"][number], OddityItem>;

  private drag: Record<ItemSection, CollectionDragReorder> = {
    equipment: new CollectionDragReorder({
      section: "equipment",
      itemTestId: "equipment-item",
      getCollection: () => this.character.equipment,
      setCollection: (items) => (this.character.equipment = items as Character["equipment"]),
    }),
    artifacts: new CollectionDragReorder({
      section: "artifacts",
      itemTestId: "artifact-item",
      getCollection: () => this.character.artifacts,
      setCollection: (items) => (this.character.artifacts = items as Character["artifacts"]),
    }),
    oddities: new CollectionDragReorder({
      section: "oddities",
      itemTestId: "oddity-item",
      getCollection: () => this.character.oddities,
      setCollection: (items) => (this.character.oddities = items as Character["oddities"]),
    }),
  };

  constructor(
    private character: Character,
    private onFieldUpdate: (field: FieldType, value: number) => void
  ) {
    this.equipment = new CollectionSection(character, {
      collectionKey: "equipment",
      ItemComponentClass: EquipmentItem,
      emptyItem: { name: "", description: "" },
    });
    this.artifacts = new CollectionSection(character, {
      collectionKey: "artifacts",
      ItemComponentClass: ArtifactItem,
      emptyItem: { name: "", level: "", effect: "" },
    });
    this.oddities = new CollectionSection(character, {
      collectionKey: "oddities",
      ItemComponentClass: OddityItem,
      emptyItem: "",
    });
  }

  private openEditModal(fieldType: FieldType): void {
    openFieldEditor(fieldType, this.character.shins, (newValue) =>
      this.onFieldUpdate(fieldType, newValue as number)
    );
  }

  private renderHeadingRow(view: SectionView, handleAdd: () => void): TemplateResult {
    return html`
      <div class="flex justify-between items-center mb-2">
        <h3 data-testid="${view.headingTestId}" class="subsection-heading">${view.heading}</h3>
        ${renderAddButton({
          onClick: handleAdd,
          testId: view.addButtonTestId,
          colorTheme: view.colorTheme,
          ariaLabel: view.addLabel,
        })}
      </div>
    `;
  }

  private renderList(view: SectionView, items: TemplateResult[]): TemplateResult {
    return renderCollection({
      isEmpty: this.character[view.section].length === 0,
      emptyState: { ...view.emptyState, message: view.emptyMessage },
      listTestId: view.listTestId,
      listClassName: view.listClassName,
      drag: this.drag[view.section],
      items,
    });
  }

  render(): TemplateResult {
    // collectionKey enables immutable updates for proper version history undo support
    const views = sectionViews();
    const equipmentItems = this.equipment.items().map((item) => item.render());
    const artifactItems = this.artifacts.items().map((item) => item.render());
    const oddityItems = this.oddities.items().map((item) => item.render());

    return html`
      <div data-testid="items-section" class="section-box">
        <div class="section-box-heading-row">
          <div
            class="stat-badge editable-field"
            data-testid="shins-badge"
            @click=${() => this.openEditModal("shins")}
            role="button"
            tabindex="0"
            aria-label=${t("resourceTracker.editShins")}
          >
            <span class="stat-badge-value">${this.character.shins}</span>
            <span class="stat-badge-label">${t("character.shins")}</span>
          </div>

          <h2 class="section-box-heading">${t("items.heading")}</h2>
        </div>

        <div>
          ${this.renderHeadingRow(views.equipment, this.equipment.handleAdd)}
          ${this.renderList(views.equipment, equipmentItems)}
        </div>

        <div class="section-divider"></div>

        <!-- Artifacts and Oddities (two columns where the section is wide) -->
        <div class="section-card-grid">
          <div data-testid="artifacts-section">
            ${this.renderHeadingRow(views.artifacts, this.artifacts.handleAdd)}
            ${this.renderList(views.artifacts, artifactItems)}
          </div>

          <div data-testid="oddities-section">
            ${this.renderHeadingRow(views.oddities, this.oddities.handleAdd)}
            ${this.renderList(views.oddities, oddityItems)}
          </div>
        </div>
      </div>
    `;
  }
}
