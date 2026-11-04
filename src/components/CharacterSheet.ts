import { html, nothing, render, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { Header } from "./Header.js";
import { SheetSections } from "@/components/helpers/SheetSections";
import { changeLanguage } from "@/i18n/index";
import { Layout, LayoutItem, SectionId } from "@/types/layout";
import {
  loadLayout,
  saveLayout,
  resetLayout,
  loadSectionColumns,
  saveSectionColumns,
} from "@/storage/layoutStorage";
import {
  CardSectionId,
  SectionColumns,
  columnsFor,
  isCardSection,
  withColumns,
} from "@/types/sectionColumns";
import { SectionDragController } from "@/components/helpers/SectionDragController";
import { renderEditLayoutButton } from "@/components/helpers/layoutEditButton";
import { renderSectionColumnsButton } from "@/components/helpers/sectionColumnsButton";
import {
  cancelSectionSlides,
  measureSections,
  slideSections,
} from "@/components/helpers/sectionSlide";

export class CharacterSheet {
  private header: Header;
  private sections: SheetSections;
  private layout: Layout;
  private sectionColumns: SectionColumns;
  private isLayoutEditMode: boolean = false;
  private container: HTMLElement | null = null;

  private readonly drag = new SectionDragController({
    isEditMode: () => this.isLayoutEditMode,
    requestRender: () => this.rerender(),
    renderWithSlide: () => this.rerenderWithSlide(),
    getLayout: () => this.layout,
    commitLayout: (layout) => this.applyLayout(layout),
  });

  constructor(
    private character: Character,
    private onLoad: () => void,
    private onNew: () => void,
    private onImport: () => void,
    private onExport: () => void,
    private onFieldUpdate: (field: string, value: string | number) => void,
    private onQuickExport?: () => void,
    private onSaveAs?: () => void
  ) {
    // Create stateful components once to preserve their state across re-renders
    this.header = new Header(
      this.onLoad,
      this.onNew,
      this.onImport,
      this.onExport,
      this.onQuickExport,
      this.onSaveAs,
      (lang: string) => changeLanguage(lang),
      () => this.resetLayoutToDefault()
    );
    this.sections = new SheetSections(this.character, this.onFieldUpdate);

    this.layout = loadLayout();
    this.sectionColumns = loadSectionColumns();
  }

  rerenderSection(sectionId: SectionId): void {
    this.sections.rerenderSection(sectionId, this.mountedContainer());
  }

  private renderLayoutItem(item: LayoutItem, rowIndex: number): TemplateResult {
    if (item.type === "single") {
      return this.renderDraggableSection(item.id, rowIndex);
    }

    const wrapperClass = this.isLayoutEditMode ? "layout-grid" : "";
    const preview = this.drag.rowPreview(rowIndex);

    return html`
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-6 ${wrapperClass} ${preview.classes}"
        data-drop-bump-label=${preview.bumpLabel}
        data-testid="layout-grid-${item.items[0]}-${item.items[1]}"
      >
        ${this.renderDraggableSection(item.items[0])} ${this.renderDraggableSection(item.items[1])}
      </div>
    `;
  }

  private renderDraggableSection(sectionId: SectionId, rowIndex?: number): TemplateResult {
    return this.drag.renderSection(sectionId, this.renderSectionContent(sectionId), rowIndex);
  }

  /**
   * A section's template; a card section's sits in a column container whose
   * own width decides whether its cards may use two columns.
   */
  private renderSectionContent(sectionId: SectionId): TemplateResult {
    const template = this.sections.getSectionTemplate(sectionId);
    if (!isCardSection(sectionId)) return template;

    const columns = columnsFor(this.sectionColumns, sectionId);
    return html`
      <div
        class="section-columns ${columns === 2 ? "section-columns-2" : ""}"
        data-columns=${columns}
        data-testid="section-columns-${sectionId}"
      >
        ${this.isLayoutEditMode
          ? renderSectionColumnsButton(columns, () => this.toggleSectionColumns(sectionId))
          : nothing}
        ${template}
      </div>
    `;
  }

  private toggleSectionColumns(sectionId: CardSectionId): void {
    const next = columnsFor(this.sectionColumns, sectionId) === 2 ? 1 : 2;
    this.sectionColumns = withColumns(this.sectionColumns, sectionId, next);
    saveSectionColumns(this.sectionColumns);
    this.rerender();
  }

  /**
   * Adopt, persist and render the result of a layout operation (null: no-op)
   */
  private applyLayout(newLayout: Layout | null): void {
    if (!newLayout) return;
    this.layout = newLayout;
    saveLayout(this.layout);
    this.rerender();
  }

  toggleLayoutEditMode(): void {
    this.drag.cancelDrag();
    this.isLayoutEditMode = !this.isLayoutEditMode;
    if (this.isLayoutEditMode) {
      // Re-sync with storage on entry so a long-lived instance (or one whose
      // layout changed elsewhere, e.g. import or another tab) starts the
      // session from the real persisted state rather than a stale snapshot.
      this.layout = loadLayout();
    }
    // Leaving saves nothing: drops already persist as they mutate this.layout,
    // and a save here would overwrite storage with a possibly stale copy.
    this.rerender();
    // The sheet snaps to its layout: no section may go on sliding to a place
    // from the live preview
    cancelSectionSlides(this.mountedContainer());
  }

  resetLayoutToDefault(): void {
    this.layout = resetLayout();
    this.sectionColumns = {};
    this.rerender();
  }

  getLayout(): Layout {
    return this.layout;
  }

  /**
   * Check whether this sheet was built for the given character instance,
   * used by main.ts to decide whether a fresh CharacterSheet is needed.
   */
  isForCharacter(character: Character): boolean {
    return this.character === character;
  }

  /**
   * Forward the export handle state to the Header, without exposing it directly.
   */
  setHeaderHasRememberedLocation(hasLocation: boolean): void {
    this.header.setHasRememberedLocation(hasLocation);
  }

  /**
   * Render the sheet into `container` and fill the collection-section hosts.
   * The container is remembered so later re-renders target the same element.
   */
  mount(container: HTMLElement): void {
    this.container = container;
    render(this.render(), container);
    this.sections.mountCollectionSections(container);
  }

  rerender(): void {
    this.mount(this.mountedContainer());
  }

  private mountedContainer(): HTMLElement {
    if (!this.container) {
      throw new Error("CharacterSheet is not mounted");
    }
    return this.container;
  }

  /**
   * Re-render the whole sheet in place; sections that moved slide from their
   * old places. Resolves when the slide has finished; null when nothing slides.
   */
  private rerenderWithSlide(): Promise<void> | null {
    const container = this.mountedContainer();
    const first = measureSections(container);
    this.mount(container);
    return slideSections(container, first);
  }

  /**
   * Set whether the user is viewing an old version
   * Triggers a re-render to update the header buttons
   */
  setIsViewingOldVersion(isViewing: boolean): void {
    this.header.setIsViewingOldVersion(isViewing);
    this.rerender();
  }

  render(): TemplateResult {
    // While a dragged section is held still, show the layout its drop produces
    const shownLayout = this.drag.liveLayout() ?? this.layout;
    const layoutSections = shownLayout.map((item, rowIndex) =>
      this.renderLayoutItem(item, rowIndex)
    );

    return html`
      <div class="min-h-screen p-4">
        <div class="sheet-toolbar" data-testid="sheet-toolbar">
          <div id="version-navigator-container"></div>
          ${renderEditLayoutButton(this.isLayoutEditMode, () => this.toggleLayoutEditMode())}
        </div>
        <div
          class="max-w-6xl mx-auto shadow rounded-lg p-6 parchment-container ${this.isLayoutEditMode
            ? "layout-edit-mode"
            : ""}"
          @dragover=${(e: DragEvent) => this.drag.handleDragOver(e)}
          @drop=${(e: DragEvent) => this.drag.handleDrop(e)}
        >
          ${this.header.render()} ${layoutSections}
        </div>
      </div>
    `;
  }
}
