// CharacterSheet component - Main container that composes all sections

import { html, render, TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { Header } from "./Header.js";
import { SheetSections } from "@/components/helpers/SheetSections";
import { changeLanguage } from "@/i18n/index";
import { Layout, LayoutItem, SectionId } from "@/types/layout";
import { loadLayout, saveLayout, resetLayout } from "@/storage/layoutStorage";
import { reorderLayout, mergeSectionsInLayout, splitGridInLayout } from "@/utils/layoutOperations";
import { SectionDragController } from "@/components/helpers/SectionDragController";
import { SheetVersionUi } from "@/components/helpers/SheetVersionUi";
import { renderEditLayoutButton } from "@/components/helpers/layoutEditButton";

export class CharacterSheet {
  private header: Header;
  private sections: SheetSections;
  private readonly versionUi = new SheetVersionUi();
  private layout: Layout;
  private isLayoutEditMode: boolean = false;
  private container: HTMLElement | null = null;

  private readonly drag = new SectionDragController({
    isEditMode: () => this.isLayoutEditMode,
    requestRender: () => this.rerender(),
    onReorder: (sourceId, targetId) => this.reorderSections(sourceId, targetId),
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

    // Load layout from storage
    this.layout = loadLayout();
  }

  /**
   * Re-render a single collection section, leaving the rest of the sheet's DOM
   * untouched.
   */
  rerenderSection(sectionId: SectionId): void {
    this.sections.rerenderSection(sectionId, this.container ?? document);
  }

  /**
   * Render a layout item (single or grid)
   */
  private renderLayoutItem(item: LayoutItem): TemplateResult {
    if (item.type === "single") {
      return this.renderDraggableSection(item.id);
    }

    // Grid layout - two sections side by side
    const wrapperClass = this.isLayoutEditMode ? "layout-grid" : "";

    return html`
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-6 ${wrapperClass}"
        data-testid="layout-grid-${item.items[0]}-${item.items[1]}"
      >
        ${this.renderDraggableSection(item.items[0])} ${this.renderDraggableSection(item.items[1])}
      </div>
    `;
  }

  private renderDraggableSection(sectionId: SectionId): TemplateResult {
    return this.drag.renderSection(sectionId, this.sections.getSectionTemplate(sectionId));
  }

  /**
   * Reorder sections by moving source to before target
   */
  private reorderSections(sourceId: SectionId, targetId: SectionId): void {
    this.applyLayout(reorderLayout(this.layout, sourceId, targetId));
  }

  /**
   * Merge two sections into a grid
   */
  mergeSections(sectionId1: SectionId, sectionId2: SectionId): void {
    this.applyLayout(mergeSectionsInLayout(this.layout, sectionId1, sectionId2));
  }

  /**
   * Split a grid into two single sections
   */
  splitGrid(sectionId: SectionId): void {
    this.applyLayout(splitGridInLayout(this.layout, sectionId));
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

  /**
   * Toggle layout edit mode
   */
  toggleLayoutEditMode(): void {
    this.drag.cancelTouchDrag();
    this.isLayoutEditMode = !this.isLayoutEditMode;
    if (this.isLayoutEditMode) {
      // Re-sync with storage on entry so a long-lived instance (or one whose
      // layout changed elsewhere, e.g. import or another tab) starts the
      // session from the real persisted state rather than a stale snapshot.
      this.layout = loadLayout();
    }
    // No save on exit: reorderSections/mergeSections/splitGrid already persist
    // immediately when they mutate this.layout. Re-saving here used to
    // overwrite storage with this instance's (possibly stale) in-memory copy
    // whenever the persisted layout had changed since edit mode was entered.
    this.rerender();
  }

  /**
   * Reset layout to default
   */
  resetLayoutToDefault(): void {
    this.layout = resetLayout();
    this.rerender();
  }

  /**
   * Update the layout
   */
  updateLayout(newLayout: Layout): void {
    this.layout = newLayout;
    this.rerender();
  }

  /**
   * Get current layout
   */
  getLayout(): Layout {
    return this.layout;
  }

  /**
   * Check if in layout edit mode
   */
  isInLayoutEditMode(): boolean {
    return this.isLayoutEditMode;
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

  /**
   * Re-render the whole sheet in place.
   */
  rerender(): void {
    const container = this.container ?? document.getElementById("app");
    if (container) {
      this.mount(container);
    }
  }

  /**
   * Mount version navigator to a container
   */
  mountVersionNavigator(
    container: HTMLElement,
    versionCount: number,
    currentIndex: number,
    onNavigateBackward: () => void,
    onNavigateForward: () => void
  ): void {
    this.versionUi.mountNavigator(container, {
      versionCount,
      currentIndex,
      onNavigateBackward,
      onNavigateForward,
    });
  }

  /**
   * Update version navigator with new props
   */
  updateVersionNavigator(
    versionCount: number,
    currentIndex: number,
    onNavigateBackward: () => void,
    onNavigateForward: () => void
  ): void {
    this.versionUi.updateNavigator({
      versionCount,
      currentIndex,
      onNavigateBackward,
      onNavigateForward,
    });
  }

  /**
   * Mount version warning banner to a container
   */
  mountVersionWarningBanner(
    container: HTMLElement,
    description: string,
    timestamp: Date,
    onReturn: () => void,
    onRestore: () => void
  ): void {
    this.versionUi.mountWarningBanner(container, description, timestamp, onReturn, onRestore);
  }

  /**
   * Unmount version warning banner
   */
  unmountVersionWarningBanner(): void {
    this.versionUi.unmountWarningBanner();
  }

  /**
   * Set whether the user is viewing an old version
   * Triggers a re-render to update the header buttons
   */
  setIsViewingOldVersion(isViewing: boolean): void {
    this.header.setIsViewingOldVersion(isViewing);
    // Trigger re-render to update button state
    this.rerender();
  }

  render(): TemplateResult {
    // Render sections based on layout order
    const layoutSections = this.layout.map((item) => this.renderLayoutItem(item));

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
        >
          ${this.header.render()} ${layoutSections}
        </div>
      </div>
    `;
  }
}
