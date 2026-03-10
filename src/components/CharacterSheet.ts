// CharacterSheet component - Main container that composes all sections

import { html, render, TemplateResult } from "lit-html";
import { Character } from "../types/character.js";
import { Header } from "./Header.js";
import { BasicInfo } from "./BasicInfo.js";
import { Stats } from "./Stats.js";
import { RecoveryDamageSection } from "./RecoveryDamageSection.js";
import { Abilities } from "./Abilities.js";
import { SpecialAbilities } from "./SpecialAbilities.js";
import { Attacks } from "./Attacks.js";
import { CyphersBox } from "./CyphersBox.js";
import { ItemsBox } from "./ItemsBox.js";
import { BottomTextFields } from "./BottomTextFields.js";
import { VersionNavigator } from "./VersionNavigator.js";
import { VersionWarningBanner } from "./VersionWarningBanner.js";
import { changeLanguage, t } from "../i18n/index.js";
import { Layout, LayoutItem, SectionId, isGridEligible, cloneLayout } from "../types/layout.js";
import { loadLayout, saveLayout, resetLayout } from "../storage/layoutStorage.js";

export class CharacterSheet {
  private header: Header;
  private basicInfo: BasicInfo;
  private bottomTextFields: BottomTextFields;
  private itemsBox: ItemsBox;
  private attacks: Attacks;
  private cyphersBox: CyphersBox;
  private stats: Stats;
  private abilities: Abilities;
  private specialAbilities: SpecialAbilities;
  private versionNavigator: VersionNavigator | null = null;
  private versionWarningBanner: VersionWarningBanner | null = null;
  private layout: Layout;
  private isLayoutEditMode: boolean = false;
  private draggedSectionId: SectionId | null = null;
  private dropTargetId: SectionId | null = null;

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
    this.basicInfo = new BasicInfo(this.character, this.onFieldUpdate);
    this.bottomTextFields = new BottomTextFields(this.character);
    this.itemsBox = new ItemsBox(this.character, this.onFieldUpdate);
    // Attacks component uses event-based pattern for updates/deletes
    this.attacks = new Attacks(this.character, this.onFieldUpdate);
    this.cyphersBox = new CyphersBox(this.character, this.onFieldUpdate);
    this.stats = new Stats(this.character, this.onFieldUpdate);

    // Create abilities and specialAbilities using event-based pattern
    // These use CollectionBehavior helpers which handle immutable updates
    // for proper version history undo support
    this.abilities = new Abilities(this.character);
    this.specialAbilities = new SpecialAbilities(this.character);

    // Load layout from storage
    this.layout = loadLayout();
  }

  /**
   * Get the template for a specific section
   */
  private getSectionTemplate(sectionId: SectionId): TemplateResult {
    const recoveryDamageSection = new RecoveryDamageSection(this.character);

    switch (sectionId) {
      case "basicInfo":
        return this.basicInfo.render();
      case "stats":
        return this.stats.render();
      case "recoveryDamage":
        return recoveryDamageSection.render();
      case "abilities":
        return this.abilities.render();
      case "specialAbilities":
        return this.specialAbilities.render();
      case "attacks":
        return this.attacks.render();
      case "cyphers":
        return this.cyphersBox.render();
      case "items":
        return this.itemsBox.render();
      case "background":
        return this.bottomTextFields.renderBackground();
      case "notes":
        return this.bottomTextFields.renderNotes();
      default:
        return html``;
    }
  }

  /**
   * Render a layout item (single or grid)
   */
  private renderLayoutItem(item: LayoutItem): TemplateResult {
    if (item.type === "single") {
      const isDragging = this.draggedSectionId === item.id;
      const isDropTarget = this.dropTargetId === item.id;
      const wrapperClass = this.isLayoutEditMode
        ? `layout-section layout-draggable${isDragging ? " dragging" : ""}${isDropTarget ? " drop-target" : ""}`
        : "";
      const draggable = this.isLayoutEditMode ? "true" : "false";

      return html`
        <div
          class=${wrapperClass}
          data-section-id=${item.id}
          data-testid="layout-section-${item.id}"
          draggable=${draggable}
          @dragstart=${(e: DragEvent) => this.handleDragStart(e, item.id)}
          @dragend=${() => this.handleDragEnd()}
          @dragover=${(e: DragEvent) => this.handleDragOver(e, item.id)}
          @dragleave=${() => this.handleDragLeave()}
          @drop=${(e: DragEvent) => this.handleDrop(e, item.id)}
        >
          ${this.getSectionTemplate(item.id)}
        </div>
      `;
    } else {
      // Grid layout - two sections side by side
      const wrapperClass = this.isLayoutEditMode ? "layout-grid" : "";

      return html`
        <div
          class="grid grid-cols-1 lg:grid-cols-2 gap-6 ${wrapperClass}"
          data-testid="layout-grid-${item.items[0]}-${item.items[1]}"
        >
          ${this.renderGridItem(item.items[0])} ${this.renderGridItem(item.items[1])}
        </div>
      `;
    }
  }

  /**
   * Render an individual item within a grid
   */
  private renderGridItem(sectionId: SectionId): TemplateResult {
    const isDragging = this.draggedSectionId === sectionId;
    const isDropTarget = this.dropTargetId === sectionId;
    const wrapperClass = this.isLayoutEditMode
      ? `layout-section layout-draggable${isDragging ? " dragging" : ""}${isDropTarget ? " drop-target" : ""}`
      : "";
    const draggable = this.isLayoutEditMode ? "true" : "false";

    return html`
      <div
        class=${wrapperClass}
        data-section-id=${sectionId}
        data-testid="layout-section-${sectionId}"
        draggable=${draggable}
        @dragstart=${(e: DragEvent) => this.handleDragStart(e, sectionId)}
        @dragend=${() => this.handleDragEnd()}
        @dragover=${(e: DragEvent) => this.handleDragOver(e, sectionId)}
        @dragleave=${() => this.handleDragLeave()}
        @drop=${(e: DragEvent) => this.handleDrop(e, sectionId)}
      >
        ${this.getSectionTemplate(sectionId)}
      </div>
    `;
  }

  /**
   * Handle drag start event
   */
  private handleDragStart(e: DragEvent, sectionId: SectionId): void {
    if (!this.isLayoutEditMode) return;

    this.draggedSectionId = sectionId;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", sectionId);
    }
    this.rerender();
  }

  /**
   * Handle drag end event
   */
  private handleDragEnd(): void {
    this.draggedSectionId = null;
    this.dropTargetId = null;
    this.rerender();
  }

  /**
   * Handle drag over event
   */
  private handleDragOver(e: DragEvent, targetId: SectionId): void {
    if (!this.isLayoutEditMode || !this.draggedSectionId) return;
    if (targetId === this.draggedSectionId) return;

    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }

    if (this.dropTargetId !== targetId) {
      this.dropTargetId = targetId;
      this.rerender();
    }
  }

  /**
   * Handle drag leave event
   */
  private handleDragLeave(): void {
    // Note: We don't clear dropTargetId here because dragleave fires
    // when entering child elements. We let dragover set the target.
  }

  /**
   * Handle drop event
   */
  private handleDrop(e: DragEvent, targetId: SectionId): void {
    e.preventDefault();
    if (!this.isLayoutEditMode || !this.draggedSectionId) return;
    if (targetId === this.draggedSectionId) return;

    // Perform the reorder
    this.reorderSections(this.draggedSectionId, targetId);

    // Clear drag state
    this.draggedSectionId = null;
    this.dropTargetId = null;
  }

  /**
   * Reorder sections by moving source to before target
   */
  private reorderSections(sourceId: SectionId, targetId: SectionId): void {
    const newLayout = cloneLayout(this.layout);

    // Find source position and remove it
    let sourceItem: LayoutItem | null = null;

    for (let i = 0; i < newLayout.length; i++) {
      const item = newLayout[i];
      if (item.type === "single" && item.id === sourceId) {
        sourceItem = item;
        newLayout.splice(i, 1);
        break;
      } else if (item.type === "grid") {
        const gridIndex = item.items.indexOf(sourceId);
        if (gridIndex !== -1) {
          // Extract from grid - other item becomes single
          const otherId = item.items[1 - gridIndex];
          sourceItem = { type: "single", id: sourceId };
          newLayout[i] = { type: "single", id: otherId };
          break;
        }
      }
    }

    if (!sourceItem) return;

    // Find target position
    let targetIndex = -1;
    for (let i = 0; i < newLayout.length; i++) {
      const item = newLayout[i];
      if (item.type === "single" && item.id === targetId) {
        targetIndex = i;
        break;
      } else if (item.type === "grid" && item.items.includes(targetId)) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) return;

    // Insert source before target
    newLayout.splice(targetIndex, 0, sourceItem);

    this.layout = newLayout;
    saveLayout(this.layout);
    this.rerender();
  }

  /**
   * Merge two sections into a grid
   */
  mergeSections(sectionId1: SectionId, sectionId2: SectionId): void {
    if (!isGridEligible(sectionId1) || !isGridEligible(sectionId2)) {
      return; // Cannot merge non-eligible sections
    }

    const newLayout = cloneLayout(this.layout);

    // Find and remove both sections
    let index1 = -1;
    let index2 = -1;

    for (let i = 0; i < newLayout.length; i++) {
      const item = newLayout[i];
      if (item.type === "single") {
        if (item.id === sectionId1) index1 = i;
        if (item.id === sectionId2) index2 = i;
      }
    }

    if (index1 === -1 || index2 === -1) return;

    // Remove both (higher index first to preserve indices)
    const minIndex = Math.min(index1, index2);
    const maxIndex = Math.max(index1, index2);
    newLayout.splice(maxIndex, 1);
    newLayout.splice(minIndex, 1);

    // Insert grid at the first position
    const gridItem: LayoutItem = { type: "grid", items: [sectionId1, sectionId2] };
    newLayout.splice(minIndex, 0, gridItem);

    this.layout = newLayout;
    saveLayout(this.layout);
    this.rerender();
  }

  /**
   * Split a grid into two single sections
   */
  splitGrid(sectionId: SectionId): void {
    const newLayout = cloneLayout(this.layout);

    for (let i = 0; i < newLayout.length; i++) {
      const item = newLayout[i];
      if (item.type === "grid" && item.items.includes(sectionId)) {
        // Replace grid with two singles
        newLayout.splice(
          i,
          1,
          { type: "single", id: item.items[0] },
          { type: "single", id: item.items[1] }
        );
        break;
      }
    }

    this.layout = newLayout;
    saveLayout(this.layout);
    this.rerender();
  }

  /**
   * Toggle layout edit mode
   */
  toggleLayoutEditMode(): void {
    this.isLayoutEditMode = !this.isLayoutEditMode;
    if (!this.isLayoutEditMode) {
      // Save layout when exiting edit mode
      saveLayout(this.layout);
    }
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
   * Trigger a re-render
   */
  private rerender(): void {
    const app = document.getElementById("app");
    if (app) {
      render(this.render(), app);
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
    this.versionNavigator = new VersionNavigator({
      versionCount,
      currentIndex,
      onNavigateBackward,
      onNavigateForward,
    });
    this.versionNavigator.mount(container);
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
    if (this.versionNavigator) {
      this.versionNavigator.update({
        versionCount,
        currentIndex,
        onNavigateBackward,
        onNavigateForward,
      });
    }
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
    this.versionWarningBanner = new VersionWarningBanner({
      description,
      timestamp,
      onReturn,
      onRestore,
    });
    this.versionWarningBanner.mount(container);
  }

  /**
   * Unmount version warning banner
   */
  unmountVersionWarningBanner(): void {
    if (this.versionWarningBanner) {
      this.versionWarningBanner.unmount();
      this.versionWarningBanner = null;
    }
  }

  /**
   * Set whether the user is viewing an old version
   * Triggers a re-render to update the header buttons
   */
  setIsViewingOldVersion(isViewing: boolean): void {
    this.header.setIsViewingOldVersion(isViewing);
    // Trigger re-render to update button state
    const app = document.getElementById("app");
    if (app) {
      render(this.render(), app);
    }
  }

  /**
   * Render the edit layout button
   */
  private renderEditLayoutButton(): TemplateResult {
    const buttonText = this.isLayoutEditMode
      ? t("layout.editButton.exit")
      : t("layout.editButton.edit");
    const buttonClass = this.isLayoutEditMode
      ? "edit-layout-button edit-layout-button--active"
      : "edit-layout-button";

    return html`
      <button
        data-testid="edit-layout-button"
        class=${buttonClass}
        aria-label=${buttonText}
        @click=${() => this.toggleLayoutEditMode()}
      >
        <svg
          class="edit-layout-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
        </svg>
        <span class="edit-layout-text">${buttonText}</span>
      </button>
    `;
  }

  render(): TemplateResult {
    // Render sections based on layout order
    const layoutSections = this.layout.map((item) => this.renderLayoutItem(item));

    return html`
      <div class="min-h-screen p-4">
        ${this.renderEditLayoutButton()}
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
