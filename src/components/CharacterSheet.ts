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
import {
  Layout,
  LayoutItem,
  SectionId,
  isGridEligible,
  isFixedSection,
  cloneLayout,
} from "../types/layout.js";
import { reorderArray } from "./helpers/DragDropBehavior.js";
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
  private draggedIndex: number | null = null;
  private currentTargetIndex: number | null = null;
  private previewOrder: number[] | null = null;

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
   * Render drag handle for layout edit mode
   */
  private renderDragHandle(sectionId: SectionId, isGrid: boolean = false): TemplateResult {
    if (!this.isLayoutEditMode) return html``;
    if (!isGrid && isFixedSection(sectionId)) {
      // Fixed sections show lock icon
      return html`<div class="layout-drag-handle layout-drag-handle--fixed" aria-hidden="true">🔒</div>`;
    }
    return html`
      <div
        class="layout-drag-handle"
        aria-label="${t("layout.dragHandle")}"
        draggable="true"
        @dragstart=${(e: DragEvent) => {
          e.stopPropagation();
          if (isGrid) {
            this.handleGridDragStart(e, sectionId);
          } else {
            this.handleDragStart(e, sectionId);
          }
        }}
        @dragend=${(e: DragEvent) => {
          e.stopPropagation();
          this.handleDragEnd();
        }}
      >⋮⋮</div>
    `;
  }

  /**
   * Render a layout item (single or grid)
   */
  private renderLayoutItem(item: LayoutItem, layoutIndex: number): TemplateResult {
    if (item.type === "single") {
      const isFixed = isFixedSection(item.id);
      const isDragging = this.draggedSectionId === item.id;

      // Fixed sections get layout-fixed class, not layout-draggable
      const wrapperClass = this.isLayoutEditMode
        ? isFixed
          ? "layout-section layout-fixed"
          : `layout-section layout-draggable${isDragging ? " dragging" : ""}`
        : "";

      return html`
        <div
          class=${wrapperClass}
          data-section-id=${item.id}
          data-layout-index=${layoutIndex}
          data-testid="layout-section-${item.id}"
          @dragover=${(e: DragEvent) => this.handleDragOver(e, item.id)}
          @dragleave=${() => this.handleDragLeave()}
          @drop=${(e: DragEvent) => this.handleDrop(e, item.id)}
        >
          ${this.renderDragHandle(item.id)}
          ${this.getSectionTemplate(item.id)}
        </div>
      `;
    } else {
      // Grid layout - two sections side by side
      // Check if either section in the grid is being dragged
      const isDragging =
        this.draggedSectionId === item.items[0] || this.draggedSectionId === item.items[1];
      const wrapperClass = this.isLayoutEditMode
        ? `layout-grid layout-draggable${isDragging ? " dragging" : ""}`
        : "";

      return html`
        <div
          class="grid-wrapper ${wrapperClass}"
          data-layout-index=${layoutIndex}
          data-testid="layout-grid-${item.items[0]}-${item.items[1]}"
          @dragover=${(e: DragEvent) => this.handleGridDragOver(e, item.items[0])}
          @dragleave=${() => this.handleDragLeave()}
          @drop=${(e: DragEvent) => this.handleGridDrop(e, item.items[0])}
        >
          ${this.renderDragHandle(item.items[0], true)}
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            ${this.renderGridItem(item.items[0])} ${this.renderGridItem(item.items[1])}
          </div>
        </div>
      `;
    }
  }

  /**
   * Render an individual item within a grid
   */
  private renderGridItem(sectionId: SectionId): TemplateResult {
    const isDragging = this.draggedSectionId === sectionId;
    const wrapperClass = this.isLayoutEditMode
      ? `layout-section layout-draggable${isDragging ? " dragging" : ""}`
      : "";

    return html`
      <div
        class=${wrapperClass}
        data-section-id=${sectionId}
        data-testid="layout-section-${sectionId}"
        @dragover=${(e: DragEvent) => this.handleDragOver(e, sectionId)}
        @dragleave=${() => this.handleDragLeave()}
        @drop=${(e: DragEvent) => this.handleDrop(e, sectionId)}
      >
        ${this.renderDragHandle(sectionId)}
        ${this.getSectionTemplate(sectionId)}
      </div>
    `;
  }

  /**
   * Get flattened section IDs from layout for drag operations
   */
  private getFlatSectionIds(): SectionId[] {
    const ids: SectionId[] = [];
    for (const item of this.layout) {
      if (item.type === "single") {
        ids.push(item.id);
      } else {
        ids.push(...item.items);
      }
    }
    return ids;
  }

  /**
   * Find layout index containing a section
   */
  private findLayoutIndex(sectionId: SectionId): number {
    for (let i = 0; i < this.layout.length; i++) {
      const item = this.layout[i];
      if (item.type === "single" && item.id === sectionId) {
        return i;
      }
      if (item.type === "grid" && item.items.includes(sectionId)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Handle drag start event for single sections
   */
  private handleDragStart(e: DragEvent, sectionId: SectionId): void {
    if (!this.isLayoutEditMode) return;
    if (isFixedSection(sectionId)) return; // Can't drag fixed sections

    const layoutIndex = this.findLayoutIndex(sectionId);

    this.draggedSectionId = sectionId;
    this.draggedIndex = layoutIndex;
    this.previewOrder = null;

    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", sectionId);
    }

    // Find the layout item wrapper (direct child of parchment-container)
    const target = e.target as HTMLElement;
    const layoutItem = target.closest("[data-layout-index]") as HTMLElement;
    if (layoutItem) {
      layoutItem.setAttribute("data-dragging", "true");
    }
  }

  /**
   * Handle drag start for grid items (drag the whole grid)
   */
  private handleGridDragStart(e: DragEvent, sectionId: SectionId): void {
    // Prevent child elements from starting their own drag
    e.stopPropagation();
    this.handleDragStart(e, sectionId);
  }

  /**
   * Handle drag end event
   */
  private handleDragEnd(keepOrder: boolean = false): void {
    // Clear visual state from all layout items
    const layoutItems = document.querySelectorAll("[data-layout-index]");
    layoutItems.forEach((item) => {
      item.removeAttribute("data-dragging");
      if (!keepOrder) {
        (item as HTMLElement).style.order = "";
      }
    });

    this.draggedSectionId = null;
    this.draggedIndex = null;
    this.currentTargetIndex = null;
    this.previewOrder = null;
  }

  /**
   * Handle drag over event - show live preview by reordering with CSS
   */
  private handleDragOver(e: DragEvent, targetId: SectionId): void {
    if (!this.isLayoutEditMode || !this.draggedSectionId || this.draggedIndex === null) return;
    if (isFixedSection(targetId)) return; // Can't drop on fixed sections

    const targetLayoutIndex = this.findLayoutIndex(targetId);
    if (targetLayoutIndex === this.draggedIndex) return; // Same layout item
    if (targetLayoutIndex === 0) return; // Can't drop at position 0 (fixed)

    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }

    if (this.currentTargetIndex !== targetLayoutIndex) {
      this.currentTargetIndex = targetLayoutIndex;

      // Calculate and apply preview order at layout item level
      const newOrder = this.calculatePreviewOrder(this.draggedIndex, targetLayoutIndex);
      if (!this.previewOrderEquals(newOrder)) {
        this.previewOrder = newOrder;
        this.applyPreviewOrder();
      }
    }
  }

  /**
   * Handle drag over for grid wrapper
   */
  private handleGridDragOver(e: DragEvent, sectionId: SectionId): void {
    e.stopPropagation();
    this.handleDragOver(e, sectionId);
  }

  /**
   * Handle drag leave event
   */
  private handleDragLeave(): void {
    // Note: We don't clear state here because dragleave fires
    // when entering child elements. We let dragover set the target.
  }

  /**
   * Handle drop event - reorder layout using the same pattern as card reordering
   */
  private handleDrop(e: DragEvent, targetId: SectionId): void {
    e.preventDefault();
    if (!this.isLayoutEditMode || !this.draggedSectionId || this.draggedIndex === null) {
      return;
    }
    if (isFixedSection(targetId)) {
      return; // Can't drop on fixed sections
    }

    const targetLayoutIndex = this.findLayoutIndex(targetId);
    if (targetLayoutIndex === this.draggedIndex) {
      return;
    }
    if (targetLayoutIndex === 0) {
      return; // Can't drop at position 0 (fixed)
    }

    // Perform the reorder using the same pattern as card reordering (reorderArray)
    const newLayout = reorderArray(this.layout, this.draggedIndex, targetLayoutIndex);
    this.layout = newLayout;
    saveLayout(this.layout);

    // Clear drag state and CSS order
    this.handleDragEnd(false);

    // Re-render with new layout order
    this.rerender();
  }

  /**
   * Handle drop for grid wrapper
   */
  private handleGridDrop(e: DragEvent, sectionId: SectionId): void {
    e.stopPropagation();
    this.handleDrop(e, sectionId);
  }

  /**
   * Calculate preview order for live drag feedback (at layout item level)
   */
  private calculatePreviewOrder(fromIndex: number, toIndex: number): number[] {
    const indices = this.layout.map((_, i) => i);
    const [removed] = indices.splice(fromIndex, 1);
    indices.splice(toIndex, 0, removed);
    return indices;
  }

  /**
   * Check if preview order matches current
   */
  private previewOrderEquals(newOrder: number[]): boolean {
    if (!this.previewOrder) return false;
    return this.previewOrder.every((val, i) => val === newOrder[i]);
  }

  /**
   * Apply preview order via CSS order property to layout items
   */
  private applyPreviewOrder(): void {
    if (!this.previewOrder) return;

    const container = document.querySelector(".parchment-container");
    if (!container) return;

    // Get direct children with data-layout-index (layout items, not nested sections)
    const layoutItems = Array.from(container.querySelectorAll(":scope > [data-layout-index]"));

    this.previewOrder.forEach((originalIndex, visualPosition) => {
      const layoutItem = layoutItems.find(
        (el) => parseInt((el as HTMLElement).dataset.layoutIndex || "-1", 10) === originalIndex
      );
      if (layoutItem) {
        (layoutItem as HTMLElement).style.order = visualPosition.toString();
      }
    });
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
    const layoutSections = this.layout.map((item, index) => this.renderLayoutItem(item, index));

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
